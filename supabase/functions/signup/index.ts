// signup: creates a member account that is already email-confirmed, so people can sign up
// without an email round-trip (and without hitting the free mailer's rate limit).
// Called anonymously from login.html; the site then signs in with the same email/password.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

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

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json({ code: "BAD_REQUEST", message: "잘못된 요청이에요." }, 400); }

  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim().toLowerCase();
  const password = String(b.password ?? "");
  const phone = String(b.phone ?? "").trim();
  const birthday = String(b.birthday ?? "").trim();

  if (!name || name.length > 30) return json({ code: "INVALID_NAME", message: "이름을 1~30자로 입력해 주세요." }, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) return json({ code: "INVALID_EMAIL", message: "이메일 형식을 확인해 주세요." }, 400);
  if (password.length < 6 || password.length > 72) return json({ code: "INVALID_PASSWORD", message: "비밀번호는 6~72자로 입력해 주세요." }, 400);
  if (phone.length > 30) return json({ code: "INVALID_PHONE", message: "연락처가 너무 길어요." }, 400);
  if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) return json({ code: "INVALID_BIRTHDAY", message: "생일 형식을 확인해 주세요." }, 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { name, phone, birthday },
  });
  if (error) {
    const m = (error.message || "").toLowerCase();
    if (m.includes("already") || m.includes("exists") || (error as { code?: string }).code === "email_exists") {
      return json({ code: "ALREADY_REGISTERED", message: "이미 가입된 이메일이에요. 로그인해 주세요." }, 409);
    }
    if (m.includes("password")) return json({ code: "WEAK_PASSWORD", message: "더 안전한 비밀번호를 입력해 주세요." }, 400);
    return json({ code: "SIGNUP_FAILED", message: "가입하지 못했어요: " + error.message }, 400);
  }
  return json({ ok: true });
});
