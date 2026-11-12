/* ============ SCENT LAB — Toss Payments (payment widget, TEST mode) ============
   Client key below is Toss Payments' public documentation test key — no real money moves.
   The matching secret key lives only in the Supabase Edge Function `toss-confirm`.
*/
const TOSS_CLIENT_KEY = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const PENDING_KEY = "sl_pendingOrder";
const siteBase = () => location.href.split(/[?#]/)[0].replace(/[^/]*$/, "");

/* save the paid order into the member's history (safe to call twice) */
function finalizeOrder(snap, payment) {
  const orders = store.get("orders", []);
  if (orders.some((o) => o.no === snap.no)) return false;
  orders.unshift({
    no: snap.no, at: snap.at, atTime: snap.atTime, items: snap.items, total: snap.total,
    gift: snap.gift, to: snap.to, addr: snap.addr,
    pay: "toss", method: payment.method || "토스페이먼츠", receiptUrl: payment.receiptUrl || null, approvedAt: payment.approvedAt || null,
  });
  store.set("orders", orders);
  const pr = profile();
  if (!pr.name && snap.fill) store.set("profile", { ...pr, name: snap.fill.name, phone: snap.fill.phone });
  if (snap.remember) {
    const list = annivs();
    list.push({ id: uid(), name: snap.remember.name, relation: "friend", kind: snap.remember.kind, date: snap.remember.date, daysBefore: 7, channels: ["email", "sms"] });
    store.set("annivs", list);
  }
  cart.save([]);
  try { sessionStorage.removeItem(PENDING_KEY); } catch (e) { /* ignore */ }
  return true;
}

function celebrate() {
  if (!window.confetti) return;
  const c = ["#b0905f", "#d8c3a0", "#111111", "#e9c3c0"];
  confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: c });
  setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0 }, colors: c }), 250);
  setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1 }, colors: c }), 400);
}
