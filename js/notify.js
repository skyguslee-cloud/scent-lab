/* ============ SCENT LAB — recommendations & anniversary notifications (demo simulation) ============ */

/* ---------- recommendation engine (gift finder + notifications) ---------- */
function recommend({ who, occ, mood, budget } = {}, limit = 3) {
  const maxPrice = byId(BUDGETS, budget)?.max ?? Infinity;
  const scored = PRODUCTS.map((p) => {
    let s = 0;
    const why = [];
    if (who && p.tags.who.includes(who)) { s += 3; why.push("who"); }
    if (occ && p.tags.occ.includes(occ)) { s += 3; why.push("occ"); }
    if (mood && p.tags.mood.includes(mood)) { s += 2; why.push("mood"); }
    if (p.cat !== "accessory") s += 0.6;
    if (p.badge === "Best") s += 0.3;
    if (p.price > maxPrice) s -= 10;
    return { p, s, why };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  return scored.slice(0, limit).map(({ p, s, why }) => ({ product: p, score: s, reason: reasonText(p, { who, occ, mood }, why) }));
}
function reasonText(p, ctx, why) {
  const w = byId(RECIPIENTS, ctx.who), o = byId(OCCASIONS, ctx.occ), m = byId(MOODS, ctx.mood);
  const notes = Object.entries(p.notes || {}).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => noteById(k).name);
  const parts = [];
  if (why.includes("who") && w) parts.push(`${w.ko}에게 특히 사랑받는 향이에요`);
  if (why.includes("occ") && o) parts.push(`${o.ko} 선물로 많이 선택돼요`);
  if (why.includes("mood") && m) parts.push(`${m.ko} 분위기와 잘 맞아요`);
  if (notes.length) parts.push(`${notes.join(" · ")} 노트가 중심`);
  return parts.join(". ") + ".";
}

/* ---------- profile & anniversaries ---------- */
const KIND = {
  birthday: { ko: "생일", occ: "birthday" },
  anniversary: { ko: "기념일", occ: "anniversary" },
  graduation: { ko: "졸업", occ: "graduation" },
  etc: { ko: "특별한 날", occ: "thanks" },
};
const profile = () => store.get("profile", { name: "", email: "", phone: "", birthday: "", channels: ["email", "sms"] });
const annivs = () => store.get("annivs", []);
/* family members read better without the honorific: "엄마" not "엄마님" */
const honor = (name, rel) => (["mom", "dad"].includes(rel) ? name : name + "님");

function nextOccurrence(dateStr, from) {
  if (!dateStr) return null;
  const [, m, d] = dateStr.split("-").map(Number);
  let occ = new Date(from.getFullYear(), m - 1, d);
  if (occ < from) occ = new Date(from.getFullYear() + 1, m - 1, d);
  return occ;
}

/* every event that can trigger a message */
function allEvents() {
  const t = today();
  const list = annivs().map((a) => ({
    key: a.id, kind: a.kind, name: a.name, relation: a.relation, days: Number(a.daysBefore) || 7, self: false, src: a,
    occ: nextOccurrence(a.date, t),
  }));
  const p = profile();
  if (p.birthday) list.push({ key: "self", kind: "birthday", name: p.name || "고객", self: true, days: 3, occ: nextOccurrence(p.birthday, t) });
  return list.filter((e) => e.occ).map((e) => {
    const send = new Date(e.occ.getTime() - e.days * DAY);
    const dday = Math.round((e.occ - t) / DAY);
    const logKey = `${e.key}@${fmtDate(e.occ)}`;
    const sent = store.get("notiLog", []).some((n) => n.key === logKey);
    return { ...e, send, dday, logKey, sent };
  }).sort((a, b) => a.occ - b.occ);
}

function buildMessage(ev) {
  const p = profile();
  const user = p.name || "고객";
  const md = `${ev.occ.getMonth() + 1}월 ${ev.occ.getDate()}일`;
  if (ev.self) {
    const rec = recommend({ who: "me", occ: "birthday" }, 1)[0]?.product;
    return {
      title: `${user}님, 생일 축하드려요`,
      sms: `[SCENT LAB] ${user}님, 곧 생일이네요 🎂\n${md}, 당신만을 위한 향을 선물하세요.\n생일 쿠폰 20% : BDAY20\n(커스텀 향수 포함 · 30일간 사용)`,
      email: { subject: `🎂 ${user}님을 위한 생일 선물이 도착했어요`, heading: "Happy Birthday", body: `${user}님의 생일을 진심으로 축하드려요.<br>올해는 세상에 하나뿐인 향으로 스스로를 축하해 보세요.`, coupon: "BDAY20", productId: rec?.id },
    };
  }
  const k = KIND[ev.kind] || KIND.etc;
  const recip = byId(RECIPIENTS, ev.relation);
  const rec = recommend({ who: ev.relation, occ: k.occ }, 1)[0]?.product;
  return {
    title: `${honor(ev.name, ev.relation)}의 ${k.ko} D-${ev.days}`,
    sms: `[SCENT LAB] ${user}님, ${honor(ev.name, ev.relation)}의 ${k.ko}이 ${ev.days}일 남았어요 (${md}).\n${recip ? recip.ko + "께 " : ""}'${rec?.name}' 어떠세요?\n지금 주문하면 ${k.ko} 전에 도착해요.\n선물 쿠폰 10% : SCENT10`,
    email: { subject: `${honor(ev.name, ev.relation)}의 ${k.ko}까지 ${ev.days}일 남았어요`, heading: `D-${ev.days}`, body: `${md}, ${honor(ev.name, ev.relation)}의 ${k.ko}이 다가오고 있어요.<br>마음을 담은 향으로 특별한 하루를 만들어 주세요.`, coupon: "SCENT10", productId: rec?.id },
  };
}

/* send everything that is due (simulated). returns newly sent entries */
function runNotifications(silent) {
  const log = store.get("notiLog", []);
  const t = today();
  const p = profile();
  const fresh = [];
  allEvents().forEach((ev) => {
    if (ev.sent || t < ev.send) return;
    const msg = buildMessage(ev);
    const channels = ev.self ? (p.channels || ["email", "sms"]) : (ev.src?.channels || ["email", "sms"]);
    const entry = { key: ev.logKey, at: fmtDate(t), occ: fmtDate(ev.occ), channels, to: { email: p.email || "(이메일 미등록)", phone: p.phone || "(번호 미등록)" }, read: false, ...msg };
    log.unshift(entry);
    fresh.push(entry);
  });
  if (fresh.length) {
    store.set("notiLog", log);
    updateBadges(true);
    if (!silent) fresh.forEach((f) => toast(`[데모 발송] ${f.title} — ${f.channels.map((c) => (c === "sms" ? "문자" : "메일")).join("·")}`, "📩"));
  }
  return fresh;
}

/* seed a couple of examples on very first visit so the demo has content */
function seedDemo() {
  if (store.get("seeded", false)) return;
  const t = today();
  const md = (n) => { const d = new Date(t.getTime() + n * DAY); return `2000-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  store.set("annivs", [
    { id: uid(), name: "엄마", relation: "mom", kind: "birthday", date: md(12), daysBefore: 7, channels: ["email", "sms"] },
    { id: uid(), name: "지우", relation: "lover", kind: "anniversary", date: md(33), daysBefore: 3, channels: ["sms"] },
  ]);
  store.set("seeded", true);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!currentUser()) return; // anniversary alerts are a member feature
  seedDemo();
  setTimeout(() => runNotifications(false), 900);
});
