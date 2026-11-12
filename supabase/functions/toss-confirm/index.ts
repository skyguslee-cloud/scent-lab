// toss-confirm: confirms a Toss Payments widget payment on the server.
// The browser sends { paymentKey, orderId, amount } after Toss redirects to pay-success.html.
// We check the order belongs to the signed-in member and the amount matches what was saved
// before checkout, then call Toss's confirm API with the secret key (never exposed to the browser).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

// Toss Payments public *documentation* test key (payment widget). Replace via the
// TOSS_SECRET_KEY function secret when using your own merchant keys.
const TOSS_SECRET_KEY = Deno.env.get("TOSS_SECRET_KEY") ?? "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ code: "METHOD_NOT_ALLOWED", message: "POST only" }, 405);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // who is calling?
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth, error: authErr } = await admin.auth.getUser(jwt);
  if (authErr || !auth?.user) return json({ code: "UNAUTHORIZED", message: "로그인이 필요해요." }, 401);

  let body: { paymentKey?: string; orderId?: string; amount?: number | string };
  try { body = await req.json(); } catch { return json({ code: "BAD_REQUEST", message: "잘못된 요청이에요." }, 400); }
  const paymentKey = String(body.paymentKey ?? "");
  const orderId = String(body.orderId ?? "");
  const amount = Number(body.amount);
  if (!paymentKey || !orderId || !Number.isFinite(amount)) return json({ code: "BAD_REQUEST", message: "결제 정보가 부족해요." }, 400);

  const { data: order, error: orderErr } = await admin.from("payments").select("*").eq("order_id", orderId).maybeSingle();
  if (orderErr || !order) return json({ code: "ORDER_NOT_FOUND", message: "주문을 찾을 수 없어요." }, 404);
  if (order.user_id !== auth.user.id) return json({ code: "FORBIDDEN", message: "본인 주문만 결제할 수 있어요." }, 403);

  // already confirmed (e.g. page refreshed) -> return the saved result
  if (order.status === "DONE") {
    return json({ ok: true, already: true, payment: { orderId, method: order.method, receiptUrl: order.receipt_url, approvedAt: order.approved_at, totalAmount: order.amount, orderName: order.order_name } });
  }
  if (order.status !== "READY") return json({ code: "ORDER_CLOSED", message: "이미 실패 처리된 주문이에요. 장바구니에서 다시 결제해 주세요." }, 409);
  if (order.amount !== amount) {
    await admin.from("payments").update({ status: "FAILED", fail_reason: "AMOUNT_MISMATCH" }).eq("order_id", orderId);
    return json({ code: "AMOUNT_MISMATCH", message: "결제 금액이 주문 금액과 달라요." }, 400);
  }

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: { Authorization: "Basic " + btoa(TOSS_SECRET_KEY + ":"), "Content-Type": "application/json" },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  const result = await res.json();

  if (!res.ok) {
    await admin.from("payments").update({ status: "FAILED", fail_reason: `${result.code}: ${result.message}`.slice(0, 300) }).eq("order_id", orderId);
    return json({ code: result.code ?? "CONFIRM_FAILED", message: result.message ?? "결제 승인에 실패했어요." }, res.status);
  }

  const payment = {
    orderId,
    method: result.method ?? null,
    receiptUrl: result.receipt?.url ?? null,
    approvedAt: result.approvedAt ?? new Date().toISOString(),
    totalAmount: result.totalAmount ?? amount,
    orderName: result.orderName ?? order.order_name,
    easyPay: result.easyPay?.provider ?? null,
    card: result.card ? { company: result.card.issuerCode, number: result.card.number } : null,
  };
  await admin.from("payments").update({
    status: "DONE", payment_key: paymentKey, method: payment.method, receipt_url: payment.receiptUrl, approved_at: payment.approvedAt,
  }).eq("order_id", orderId);

  return json({ ok: true, payment });
});
