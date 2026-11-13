/* ============ SCENT LAB — shared helpers ============ */

/* ---------- signed-in member (set by auth.js) ---------- */
function currentUser() {
  try { return JSON.parse(localStorage.getItem("sl_currentUser")); } catch (e) { return null; }
}
/* each member gets their own local cache: sl_<userId>:<key>. guests use sl_<key>. */
const GLOBAL_KEYS = ["theme"];
function nsKey(key, user = currentUser()) {
  return "sl_" + (user && !GLOBAL_KEYS.includes(key) ? user.id + ":" : "") + key;
}

/* ---------- storage (safe; members' data is mirrored to the server by auth.js) ---------- */
const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(nsKey(key));
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(nsKey(key), JSON.stringify(value)); } catch (e) { /* ignore */ }
    if (window.syncPush) window.syncPush(key, value);
  },
  remove(key) {
    try { localStorage.removeItem(nsKey(key)); } catch (e) { /* ignore */ }
    if (window.syncRemove) window.syncRemove(key);
  },
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const won = (n) => "₩" + Math.round(n).toLocaleString("ko-KR");
const uid = () => Math.random().toString(36).slice(2, 9);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const byId = (arr, id) => arr.find((x) => x.id === id);
const productById = (id) => byId(PRODUCTS, id);
const noteById = (id) => byId(NOTES, id);
const qs = (k) => new URLSearchParams(location.search).get(k);

/* ---------- demo clock (lets the presenter move "today") ---------- */
function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + (store.get("demoOffset", 0) || 0));
  return d;
}
const fmtDate = (d) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
const DAY = 86400000;

/* ---------- color & recipe math ---------- */
function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbToHex([r, g, b]) { return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join(""); }
function mixColors(pairs) { // [[hex, weight]]
  const total = pairs.reduce((s, p) => s + p[1], 0);
  if (!total) return null;
  const acc = [0, 0, 0];
  pairs.forEach(([hex, w]) => hexToRgb(hex).forEach((v, i) => (acc[i] += v * w / total)));
  return rgbToHex(acc);
}
function shade(hex, amt) { // amt -1..1
  const c = hexToRgb(hex).map((v) => (amt < 0 ? v * (1 + amt) : v + (255 - v) * amt));
  return rgbToHex(c);
}

function notePercents(notes) {
  const entries = Object.entries(notes || {}).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const out = {};
  entries.forEach(([k, v]) => (out[k] = total ? (v / total) * 100 : 0));
  return out;
}
function blendColor(notes) {
  return mixColors(Object.entries(notes || {}).filter(([k, v]) => v > 0 && noteById(k)).map(([k, v]) => [noteById(k).color, v])) || "#e9dcc6";
}
function tierColors(notes) {
  const out = {};
  TIERS.forEach((t) => {
    const pairs = Object.entries(notes || {}).filter(([k, v]) => v > 0 && noteById(k)?.tier === t.id).map(([k, v]) => [noteById(k).color, v]);
    out[t.id] = mixColors(pairs);
  });
  return out;
}
function famProfile(notes) {
  const sc = Object.fromEntries(FAMILIES.map((f) => [f.id, 0]));
  Object.entries(notePercents(notes)).forEach(([k, pct]) => {
    const n = noteById(k);
    if (n) Object.entries(n.fam).forEach(([f, w]) => (sc[f] += pct * w));
  });
  const max = Math.max(1, ...Object.values(sc));
  Object.keys(sc).forEach((k) => (sc[k] = Math.round((sc[k] / max) * 100)));
  return sc;
}
function describeRecipe(notes) {
  const pct = notePercents(notes);
  const keys = Object.keys(pct);
  if (!keys.length) return "향료를 고르면 이곳에 향의 이야기가 그려집니다.";
  const prof = famProfile(notes);
  const fams = Object.entries(prof).sort((a, b) => b[1] - a[1]).filter(([, v]) => v > 30).slice(0, 2).map(([k]) => byId(FAMILIES, k).ko);
  const lead = (tier) => {
    const t = keys.filter((k) => noteById(k).tier === tier).sort((a, b) => pct[b] - pct[a])[0];
    return t ? noteById(t).name : null;
  };
  const parts = [];
  if (lead("top")) parts.push(`${lead("top")}으로 시작해`);
  if (lead("mid")) parts.push(`${lead("mid")}의 마음을 지나`);
  if (lead("base")) parts.push(`${lead("base")}으로 남는`);
  return `${parts.join(" ")} ${fams.join(" · ")} 계열의 향.`;
}
function randomName() {
  const p = (a) => a[Math.floor(Math.random() * a.length)];
  return `${p(NAME_PARTS.a)} ${p(NAME_PARTS.b)}`;
}

/* ---------- recipe & pricing ---------- */
function newRecipe() {
  return {
    name: "", notes: {}, bottle: "classic", cap: "gold", size: 50,
    label: { text: "", font: "serif" }, acc: [],
    gift: { wrap: "none", ribbon: "gold", box: "none", card: false, cardText: "" },
  };
}
function recipePrice(r) {
  const lines = [];
  const size = byId(SIZES, r.size) || SIZES[1];
  lines.push([`커스텀 퍼퓸 ${size.name}`, size.price]);
  const b = byId(BOTTLES, r.bottle); if (b?.price) lines.push([`${b.name} 보틀`, b.price]);
  const c = byId(CAPS, r.cap); if (c?.price) lines.push([`${c.name} 캡`, c.price]);
  if (r.label?.text) lines.push(["라벨 각인", ENGRAVE_PRICE]);
  (r.acc || []).forEach((id) => { const a = byId(ACCESSORIES, id); if (a) lines.push([a.name, a.price]); });
  const w = byId(WRAPS, r.gift?.wrap); if (w?.price) lines.push([`${w.name} 포장`, w.price]);
  const bx = byId(BOXES, r.gift?.box); if (bx?.price) lines.push([bx.name, bx.price]);
  if (r.gift?.card) lines.push(["메시지 카드", CARD_PRICE]);
  return { lines, total: lines.reduce((s, l) => s + l[1], 0) };
}
function productSizePrice(p, size) {
  if (p.cat !== "perfume") return p.price;
  if (size === 30) return Math.round((p.price * 0.68) / 1000) * 1000;
  if (size === 100) return Math.round((p.price * 1.5) / 1000) * 1000;
  return p.price;
}
function productToRecipe(p) {
  const r = newRecipe();
  r.name = p.name;
  r.notes = { ...(p.notes || {}) };
  r.bottle = p.bottle || "classic";
  r.cap = p.cap || "gold";
  return r;
}

/* ---------- share links ---------- */
function encodeRecipe(r) { return btoa(unescape(encodeURIComponent(JSON.stringify(r)))); }
function decodeRecipe(s) { try { return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch (e) { return null; } }
function openInLab(recipe) {
  try { sessionStorage.setItem("sl_labPreset", JSON.stringify(recipe)); } catch (e) { /* ignore */ }
  location.href = "lab.html";
}

/* ---------- cart & wishlist ---------- */
const cart = {
  items() { return store.get("cart", []); },
  save(items) { store.set("cart", items); updateBadges(true); },
  add(item) {
    const items = cart.items();
    const same = items.find((i) => i.type === "product" && item.type === "product" && i.id === item.id && i.size === item.size);
    if (same) same.qty += item.qty || 1;
    else items.push({ key: uid(), qty: 1, ...item });
    cart.save(items);
  },
  count() { return cart.items().reduce((s, i) => s + i.qty, 0); },
};
const wish = {
  list() { return store.get("wish", []); },
  has(id) { return wish.list().includes(id); },
  toggle(id) {
    const l = wish.list();
    const i = l.indexOf(id);
    if (i >= 0) l.splice(i, 1); else l.push(id);
    store.set("wish", l);
    updateBadges();
    return i < 0;
  },
};

/* ---------- toast & modal ---------- */
function toast(msg, icon = "✓") {
  let box = $(".toasts");
  if (!box) { box = document.createElement("div"); box.className = "toasts"; document.body.appendChild(box); }
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<span class="ti">${icon}</span><span>${msg}</span>`;
  box.appendChild(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 400); }, 3600);
}
function openModal(html) {
  let bg = $("#modal");
  if (!bg) {
    bg = document.createElement("div");
    bg.id = "modal";
    bg.className = "modal-bg";
    bg.innerHTML = `<div class="modal"><button class="icon-btn close" aria-label="닫기">${ICON.close}</button><div class="modal-body"></div></div>`;
    document.body.appendChild(bg);
    bg.addEventListener("click", (e) => { if (e.target === bg || e.target.closest(".close")) closeModal(); });
  }
  $(".modal-body", bg).innerHTML = html;
  requestAnimationFrame(() => bg.classList.add("open"));
  return bg;
}
function closeModal() { $("#modal")?.classList.remove("open"); }
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

/* ---------- icons ---------- */
const ICON = {
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  bag: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>',
  sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M4 8h16M4 16h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" style="width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.3"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};

/* ---------- header / footer ---------- */
const NAV = [
  { href: "shop.html", label: "Collection" },
  { href: "lab.html", label: "Atelier" },
  { href: "gift.html", label: "Gift Finder" },
  { href: "quiz.html", label: "Scent Test" },
];
function renderChrome() {
  const page = location.pathname.split("/").pop() || "index.html";
  const hdr = $(".site-header");
  const me = currentUser();
  if (hdr) {
    hdr.innerHTML = `
      <div class="container">
        <div class="row">
          <button class="icon-btn burger" aria-label="메뉴">${ICON.menu}</button>
          <nav class="nav">${NAV.map((n) => `<a href="${n.href}" class="${page === n.href ? "active" : ""}">${n.label}</a>`).join("")}${me?.isAdmin ? `<a href="admin.html" class="${page === "admin.html" ? "active" : ""}" style="color:var(--gold)">Admin</a>` : ""}</nav>
        </div>
        <a href="index.html" class="logo">SCENT LAB<small>MAISON DE PARFUM</small></a>
        <div class="header-icons">
          <button class="icon-btn hide-m" id="themeBtn" aria-label="다크 모드">${ICON.moon}</button>
          <a class="icon-btn hide-m" href="mypage.html#wish" aria-label="위시리스트">${ICON.heart}<span class="badge" id="wishBadge"></span></a>
          <a class="icon-btn" href="mypage.html#alerts" aria-label="알림">${ICON.bell}<span class="badge" id="bellBadge"></span></a>
          ${me ? `<a class="icon-btn hide-m" href="mypage.html" aria-label="마이페이지" title="${esc(me.name || me.email)}님">${ICON.user}</a>`
               : `<a class="hide-m upper" href="login.html" style="font-size:10px;padding:0 10px;align-self:center">Login</a>`}
          <a class="icon-btn" href="cart.html" aria-label="장바구니">${ICON.bag}<span class="badge" id="cartBadge"></span></a>
        </div>
      </div>`;
    const mnav = document.createElement("nav");
    mnav.className = "mobile-nav";
    mnav.innerHTML = NAV.map((n) => `<a href="${n.href}">${n.label}</a>`).join("") +
      (me ? `${me.isAdmin ? `<a href="admin.html" style="color:var(--gold)">Admin</a>` : ""}<a href="mypage.html">My Page</a><a href="#" id="logoutM">Logout</a>` : `<a href="login.html">Login · Join</a>`) +
      `<button class="btn btn-ghost" id="themeBtnM">다크 모드 전환</button>`;
    document.body.appendChild(mnav);
    $(".burger", hdr).addEventListener("click", () => mnav.classList.toggle("open"));
    $("#themeBtn").addEventListener("click", toggleTheme);
    $("#themeBtnM").addEventListener("click", toggleTheme);
    $("#logoutM")?.addEventListener("click", (e) => { e.preventDefault(); window.logout?.(); });

    if (document.body.dataset.page === "home") {
      const onScroll = () => hdr.classList.toggle("transparent", scrollY < innerHeight * 0.6);
      onScroll();
      addEventListener("scroll", onScroll, { passive: true });
      hdr.style.color = "";
      const tint = () => { hdr.style.color = hdr.classList.contains("transparent") ? "#f4efe8" : ""; };
      tint(); addEventListener("scroll", tint, { passive: true });
    }
  }
  const ftr = $(".site-footer");
  if (ftr) {
    ftr.innerHTML = `
      <div class="container">
        <div class="cols">
          <div>
            <div class="logo" style="text-align:left;padding:0;font-size:22px">SCENT LAB</div>
            <p style="margin-top:14px;max-width:320px">세상에 단 하나뿐인 향을 짓는 아틀리에.<br>당신의 이야기를 한 병에 담아 드립니다.</p>
            <p style="margin-top:18px"><span class="demo-note">과제용 데모 사이트 · 실제 판매·결제·발송 없음</span></p>
          </div>
          <div><h4>Shop</h4><ul><li><a href="shop.html">컬렉션</a></li><li><a href="shop.html?cat=set">기프트 세트</a></li><li><a href="shop.html?cat=accessory">액세서리</a></li></ul></div>
          <div><h4>Atelier</h4><ul><li><a href="lab.html">나만의 향 만들기</a></li><li><a href="gift.html">선물 추천</a></li><li><a href="quiz.html">향 성향 테스트</a></li></ul></div>
          <div><h4>Service</h4><ul><li><a href="mypage.html#anniv">기념일 알림</a></li><li><a href="mypage.html#orders">주문 조회</a></li><li><a href="mypage.html#recipes">내 레시피</a></li></ul></div>
        </div>
        <div class="bottom"><span>© 2026 SCENT LAB. Student demo project.</span><span>CRAFTED WITH CARE · SEOUL</span></div>
      </div>`;
  }
  updateBadges();
}
function updateBadges(bump) {
  const set = (id, n) => {
    const b = document.getElementById(id);
    if (!b) return;
    b.textContent = n;
    b.classList.toggle("show", n > 0);
    b.classList.remove("bump");
    if (bump && n > 0) { void b.offsetWidth; b.classList.add("bump"); }
  };
  set("cartBadge", cart.count());
  set("wishBadge", wish.list().length);
  set("bellBadge", (store.get("notiLog", []) || []).filter((n) => !n.read).length);
}

/* ---------- theme ---------- */
function applyTheme() {
  const t = store.get("theme", null);
  if (t) document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
  const btn = $("#themeBtn");
  if (btn) btn.innerHTML = document.documentElement.dataset.theme === "dark" ? ICON.sun : ICON.moon;
}
function toggleTheme() {
  store.set("theme", document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  applyTheme();
  document.dispatchEvent(new CustomEvent("themechange"));
}
applyTheme();

/* ---------- scroll reveal ---------- */
function initReveal() {
  const els = $$(".reveal:not(.in)");
  if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach((e) => io.observe(e));
}

/* ---------- shared product card ---------- */
function productVisual(p, opts = {}) {
  if (p.cat === "accessory") return renderAccessory(p.acc);
  if (p.cat === "set") return renderGiftBox({ wrap: p.wrap, ribbon: p.ribbon, box: "signature" });
  return renderBottle({ shape: p.bottle, cap: p.cap, notes: p.notes, label: p.name, labelFont: "serif", animate: opts.animate });
}
function productCard(p) {
  return `
    <div class="p-card reveal">
      <a href="product.html?id=${p.id}" class="media">
        ${p.badge ? `<span class="tag">${p.badge}</span>` : ""}
        ${productVisual(p)}
      </a>
      <button class="icon-btn wish wish-btn ${wish.has(p.id) ? "on" : ""}" data-wish="${p.id}" aria-label="위시리스트">${ICON.heart}</button>
      <button class="btn btn-sm btn-block quick" data-quick="${p.id}">장바구니 담기</button>
      <a href="product.html?id=${p.id}" class="info">
        <div class="name">${p.name}</div>
        <div class="sub">${p.ko} · ${p.sub}</div>
        <div class="price">${won(p.price)}</div>
      </a>
    </div>`;
}
document.addEventListener("click", (e) => {
  const w = e.target.closest("[data-wish]");
  if (w) {
    e.preventDefault();
    const on = wish.toggle(w.dataset.wish);
    w.classList.toggle("on", on);
    toast(on ? "위시리스트에 담았어요" : "위시리스트에서 뺐어요", on ? "♥" : "♡");
  }
  const q = e.target.closest("[data-quick]");
  if (q) {
    e.preventDefault();
    const p = productById(q.dataset.quick);
    cart.add({ type: "product", id: p.id, size: p.cat === "perfume" ? 50 : null, price: p.price, qty: 1 });
    toast(`${p.name}을(를) 장바구니에 담았어요`, "🛍");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  initReveal();
});
