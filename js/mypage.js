/* ============ SCENT LAB — My Page (alerts, anniversaries, orders, recipes, wishlist, profile) ============ */
document.addEventListener("DOMContentLoaded", () => {
  if (!currentUser()) {
    location.replace("login.html?next=" + encodeURIComponent("mypage.html" + location.search + location.hash));
    return;
  }
  const KIND_KO = { birthday: "생일", anniversary: "기념일", graduation: "졸업", etc: "특별한 날" };
  const CH = (c) => (c === "sms" ? "문자" : "메일");

  /* ---------- tabs ---------- */
  function showTab(t) {
    if (!$(`[data-pane="${t}"]`)) t = "alerts";
    $$("#side button").forEach((b) => b.classList.toggle("on", b.dataset.tab === t));
    $$(".mp-pane").forEach((p) => p.classList.toggle("on", p.dataset.pane === t));
    if (location.hash !== "#" + t) history.replaceState(null, "", location.pathname + location.search + "#" + t);
    if (t === "alerts") markRead();
  }
  $("#side").onclick = (e) => { const b = e.target.closest("[data-tab]"); if (b) showTab(b.dataset.tab); };
  addEventListener("hashchange", () => showTab(location.hash.slice(1)));

  function counts() {
    const set = (k, n) => ($(`[data-cnt="${k}"]`).textContent = n || "");
    set("alerts", store.get("notiLog", []).filter((n) => !n.read).length);
    set("anniv", annivs().length);
    set("orders", store.get("orders", []).length);
    set("recipes", store.get("recipes", []).length);
    set("wish", wish.list().length);
    const n = profile().name;
    $("#hello").textContent = n ? `${n}님, 반가워요` : "마이페이지";
  }

  /* ---------- alerts ---------- */
  function renderAlerts() {
    $("#clock").textContent = `${fmtDate(today())} (${["일", "월", "화", "수", "목", "금", "토"][today().getDay()]})${store.get("demoOffset", 0) ? ` · 실제보다 +${store.get("demoOffset", 0)}일` : ""}`;
    const ev = allEvents().filter((e) => !e.sent);
    $("#upcoming").innerHTML = ev.length ? ev.map((e) => `
      <div class="tl-item" data-preview-ev="${e.logKey}">
        <span class="muted" style="font-size:12px">${fmtDate(e.send)} 발송</span>
        <div><div class="t">${e.self ? "내 생일 쿠폰" : `${esc(honor(e.name, e.relation))}의 ${KIND_KO[e.kind]} D-${e.days}`}</div>
          <div class="muted" style="font-size:12px">${e.self ? "🎂" : "📅"} ${fmtDate(e.occ)} · 미리보기 클릭</div></div>
        <span class="pill wait">예정 · ${Math.max(0, Math.round((e.send - today()) / DAY))}일 후</span>
      </div>`).join("") : `<p class="muted" style="padding:20px 0">예정된 알림이 없어요. 기념일을 등록해 보세요.</p>`;
    const log = store.get("notiLog", []);
    $("#sentList").innerHTML = log.length ? log.map((n, i) => `
      <div class="tl-item ${n.read ? "" : "unread"}" data-log="${i}">
        <span class="muted" style="font-size:12px">${n.at}</span>
        <div><div class="t">${esc(n.title)}</div><div class="muted" style="font-size:12px">→ ${n.channels.map((c) => (c === "sms" ? esc(n.to.phone) : esc(n.to.email))).join(" · ")}</div></div>
        <span>${n.channels.map((c) => `<span class="pill sent">${CH(c)} 발송됨</span>`).join(" ")}</span>
      </div>`).join("") : `<p class="muted" style="padding:20px 0">아직 발송된 알림이 없어요. 위의 ‘다음 알림일로 이동’을 눌러 보세요.</p>`;
  }
  function markRead() {
    setTimeout(() => {
      const log = store.get("notiLog", []);
      if (log.some((n) => !n.read)) { log.forEach((n) => (n.read = true)); store.set("notiLog", log); updateBadges(); counts(); }
    }, 2500);
  }
  function previewModal(msg, channels, to, sentAt) {
    const p = msg.email.productId ? productById(msg.email.productId) : null;
    openModal(`
      <span class="eyebrow">${sentAt ? `Sent · ${sentAt}` : "Preview"}</span>
      <h2 class="h2" style="margin:8px 0 24px">${esc(msg.title)}</h2>
      ${channels.includes("sms") ? `<p class="upper muted" style="margin-bottom:10px">문자 → ${esc(to.phone)}</p>
        <div class="phone" style="margin-bottom:30px"><div class="from">SCENT LAB</div><div class="bubble">${esc(msg.sms)}</div></div>` : ""}
      ${channels.includes("email") ? `<p class="upper muted" style="margin-bottom:10px">메일 → ${esc(to.email)}</p>
        <div class="mail"><div class="mh"><b>제목</b> ${esc(msg.email.subject)}<br><b>보낸이</b> SCENT LAB &lt;hello@scentlab.demo&gt;</div>
          <div class="mbody">
            <div class="logo">SCENT LAB</div>
            <div style="font-family:var(--serif);font-size:40px;line-height:1">${esc(msg.email.heading)}</div>
            <p style="margin:16px 0;font-size:14px;color:#444">${msg.email.body}</p>
            ${p ? `<div style="height:170px;background:#f6f2ed;display:grid;place-items:center;margin:18px 0">${renderBottle({ shape: p.bottle || "classic", cap: p.cap, notes: p.notes, label: p.name, animate: false, attrs: 'style="height:88%"' })}</div>
              <div style="font-family:var(--serif);font-size:20px">${p.name}</div><div style="font-size:12px;color:#777">${won(p.price)}</div>` : ""}
            <div class="coupon">${msg.email.coupon}</div>
            <a class="btn btn-sm" href="${p ? "product.html?id=" + p.id : "lab.html"}" style="background:#111;color:#fff;border-color:#111">선물 고르러 가기</a>
          </div></div>` : ""}
    `);
  }
  $("#upcoming").onclick = (e) => {
    const it = e.target.closest("[data-preview-ev]");
    if (!it) return;
    const ev = allEvents().find((x) => x.logKey === it.dataset.previewEv);
    const p = profile();
    const ch = ev.self ? (p.channels || ["email", "sms"]) : (ev.src.channels || []);
    previewModal(buildMessage(ev), ch, { email: p.email || "(이메일 미등록)", phone: p.phone || "(번호 미등록)" });
  };
  $("#sentList").onclick = (e) => {
    const it = e.target.closest("[data-log]");
    if (!it) return;
    const n = store.get("notiLog", [])[it.dataset.log];
    previewModal(n, n.channels, n.to, n.at);
  };
  function shift(days) {
    store.set("demoOffset", (store.get("demoOffset", 0) || 0) + days);
    const sent = runNotifications(false);
    if (!sent.length) toast(`${fmtDate(today())}로 이동했어요 · 발송할 알림 없음`, "🕰");
    refresh();
  }
  $$("[data-shift]").forEach((b) => (b.onclick = () => shift(Number(b.dataset.shift))));
  $("#jumpNext").onclick = () => {
    const next = allEvents().filter((e) => !e.sent).sort((a, b) => a.send - b.send)[0];
    if (!next) return toast("예정된 알림이 없어요. 기념일을 먼저 등록해 주세요", "!");
    shift(Math.max(0, Math.round((next.send - today()) / DAY)));
  };
  $("#resetClock").onclick = () => { store.set("demoOffset", 0); toast("오늘 날짜로 되돌렸어요", "🕰"); refresh(); };

  /* ---------- anniversaries ---------- */
  const form = $("#annivForm");
  form.relation.innerHTML = RECIPIENTS.filter((r) => r.id !== "me").map((r) => `<option value="${r.id}">${r.emoji} ${r.ko}</option>`).join("");
  if (qs("add")) {
    form.name.value = qs("name") || "";
    if (qs("rel")) form.relation.value = qs("rel");
    if (qs("kind")) form.kind.value = qs("kind");
    setTimeout(() => form.date.focus(), 400);
  }
  form.onsubmit = (e) => {
    e.preventDefault();
    if (!form.name.value.trim() || !form.date.value) return toast("이름과 날짜를 입력해 주세요", "!");
    const channels = [form.email.checked && "email", form.sms.checked && "sms"].filter(Boolean);
    if (!channels.length) return toast("알림 채널을 하나 이상 골라 주세요", "!");
    const list = annivs();
    list.push({ id: uid(), name: form.name.value.trim(), relation: form.relation.value, kind: form.kind.value, date: form.date.value, daysBefore: Number(form.daysBefore.value), channels });
    store.set("annivs", list);
    form.reset();
    toast("기념일을 등록했어요. 날짜가 다가오면 알려 드릴게요", "📅");
    runNotifications(false);
    refresh();
  };
  function renderAnniv() {
    const evs = allEvents().filter((e) => !e.self);
    $("#annivList").innerHTML = evs.length ? evs.map((e) => {
      const a = e.src;
      const r = byId(RECIPIENTS, a.relation);
      const occ = KIND[a.kind]?.occ || "thanks";
      return `<div class="anniv">
        <div class="dday ${e.dday <= 14 ? "soon" : ""}">${e.dday === 0 ? "D-Day" : "D-" + e.dday}<small>${e.occ.getMonth() + 1}.${e.occ.getDate()}</small></div>
        <div><div class="serif" style="font-size:22px">${esc(a.name)} <span class="muted" style="font-size:13px;font-family:var(--sans)">${r?.emoji || ""} ${r?.ko || ""} · ${KIND_KO[a.kind]}</span></div>
          <div class="muted" style="font-size:12px;margin-top:4px">${a.daysBefore}일 전 ${a.channels.map(CH).join("·")} 알림 · <span class="pill ${e.sent ? "sent" : "wait"}">${e.sent ? "올해 발송됨" : fmtDate(e.send) + " 발송 예정"}</span></div></div>
        <div class="row"><a class="btn btn-sm btn-ghost" href="gift.html?who=${a.relation}&occ=${occ}">선물 추천</a><button class="link" data-del-anniv="${a.id}" style="font-size:10px">삭제</button></div>
      </div>`;
    }).join("") : `<p class="empty">등록된 기념일이 없어요.</p>`;
  }
  $("#annivList").onclick = (e) => {
    const d = e.target.closest("[data-del-anniv]");
    if (!d) return;
    store.set("annivs", annivs().filter((a) => a.id !== d.dataset.delAnniv));
    toast("기념일을 삭제했어요", "×");
    refresh();
  };

  /* ---------- orders ---------- */
  const STAGES = ["결제 완료", "제작 중", "배송 중", "배송 완료"];
  const SHIP_IDX = { PAID: 0, MAKING: 1, SHIPPING: 2, DELIVERED: 3 };
  let shipInfo = {}; // order_id -> shipping info the admin set (from the server)
  async function loadShipInfo() {
    const u = currentUser();
    if (!u || typeof sb === "undefined" || !sb) return;
    const { data, error } = await sb.from("payments")
      .select("order_id, ship_status, carrier, tracking_no, shipped_at")
      .eq("user_id", u.id).eq("status", "DONE");
    if (error || !data) return;
    shipInfo = Object.fromEntries(data.map((r) => [r.order_id, r]));
    renderOrders();
  }
  function renderOrders() {
    const orders = store.get("orders", []);
    $("#orderList").innerHTML = orders.length ? orders.map((o) => {
      const s = shipInfo[o.no];
      const canceled = s?.ship_status === "CANCELED";
      // real status from the admin when the order went through Toss; demo orders follow the demo clock
      const st = s ? (SHIP_IDX[s.ship_status] ?? 0) : Math.min(3, Math.max(0, Math.round((today().getTime() - (o.atTime || today().getTime())) / DAY)));
      return `<div class="box">
        <div class="row between wrap"><div><span class="eyebrow">${o.at} · ${o.no}</span><div class="serif" style="font-size:22px;margin-top:4px">${o.items.length}개 상품 · ${won(o.total)}</div></div>
          <span class="pill ${canceled ? "" : st === 3 ? "sent" : "wait"}" ${canceled ? 'style="color:var(--danger);border-color:var(--danger)"' : ""}>${canceled ? "주문 취소" : STAGES[st]}</span></div>
        ${canceled ? "" : `
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:22px 0 8px">${STAGES.map((x, i) => `<div style="height:3px;background:${i <= st ? "var(--gold)" : "var(--line)"}"></div>`).join("")}</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);font-size:11px" class="muted">${STAGES.map((x, i) => `<span style="${i === st ? "color:var(--ink)" : ""}">${x}</span>`).join("")}</div>`}
        ${s?.tracking_no ? `<p style="font-size:13px;margin-top:16px">🚚 ${esc(s.carrier || "택배")} · 송장번호 <b>${esc(s.tracking_no)}</b></p>` : ""}
        <p class="muted" style="font-size:12px;margin-top:${s?.tracking_no ? 6 : 16}px">${o.gift ? "🎁 " + esc(o.to) + "님께 선물" : "본인 수령"} · ${esc(o.addr)}${o.method ? ` · 결제 ${esc(o.method)}` : ""}${o.receiptUrl ? ` · <a class="link" style="font-size:10px" href="${esc(o.receiptUrl)}" target="_blank" rel="noopener">영수증</a>` : ""}</p>
        <p class="muted" style="font-size:11px;margin-top:4px">${s ? "배송 상태는 SCENT LAB에서 처리하면 바로 바뀌어요." : "데모 주문이라 데모 시계를 하루씩 옮기면 배송 단계가 진행돼요."}</p>
      </div>`;
    }).join("") : `<div class="empty">아직 주문 내역이 없어요.<br><br><a class="btn" href="shop.html">쇼핑하러 가기</a></div>`;
  }

  /* ---------- recipes & wish ---------- */
  function renderRecipes() {
    const list = store.get("recipes", []);
    $("#recipeList").innerHTML = list.length ? list.map((x, i) => `
      <div class="box" style="margin:0;text-align:center">
        <div style="height:200px">${renderBottle({ shape: x.recipe.bottle, cap: x.recipe.cap, notes: x.recipe.notes, label: x.recipe.label.text, labelFont: x.recipe.label.font, size: x.recipe.size, animate: false, attrs: 'style="height:100%;margin:auto"' })}</div>
        <div class="serif" style="font-size:22px;margin-top:12px">${esc(x.recipe.name)}</div>
        <p class="muted" style="font-size:11px">${x.savedAt} · ${won(recipePrice(x.recipe).total)}</p>
        <div class="row" style="justify-content:center;margin-top:14px"><button class="btn btn-sm" data-open-r="${i}">열기</button><button class="btn btn-sm btn-ghost" data-del-r="${i}">삭제</button></div>
      </div>`).join("") : `<div class="empty" style="grid-column:1/-1">저장한 레시피가 없어요.<br><br><a class="btn" href="lab.html">향 만들기</a></div>`;
  }
  $("#recipeList").onclick = (e) => {
    const list = store.get("recipes", []);
    const o = e.target.closest("[data-open-r]"), d = e.target.closest("[data-del-r]");
    if (o) openInLab(list[o.dataset.openR].recipe);
    if (d) { list.splice(d.dataset.delR, 1); store.set("recipes", list); refresh(); }
  };
  function renderWish() {
    const l = wish.list().map(productById).filter(Boolean);
    $("#wishList").innerHTML = l.length ? l.map(productCard).join("") : `<div class="empty" style="grid-column:1/-1">위시리스트가 비어 있어요.</div>`;
    initReveal();
  }
  document.addEventListener("click", (e) => { if (e.target.closest("[data-wish]") && $('[data-pane="wish"]').classList.contains("on")) setTimeout(() => { renderWish(); counts(); }, 50); });

  /* ---------- profile ---------- */
  const pf = $("#profileForm");
  function fillProfile() {
    const p = profile();
    pf.name.value = p.name; pf.email.value = p.email; pf.phone.value = p.phone; pf.birthday.value = p.birthday || "";
    pf.cemail.checked = (p.channels || []).includes("email"); pf.csms.checked = (p.channels || []).includes("sms");
  }
  pf.onsubmit = (e) => {
    e.preventDefault();
    store.set("profile", { name: pf.name.value.trim(), email: pf.email.value.trim(), phone: pf.phone.value.trim(), birthday: pf.birthday.value, channels: [pf.cemail.checked && "email", pf.csms.checked && "sms"].filter(Boolean) });
    saveProfileRow(profile());
    toast("내 정보를 저장했어요", "✓");
    runNotifications(false);
    refresh();
  };
  $("#resetAll").onclick = () => {
    if (!confirm("이 계정의 장바구니·주문·기념일·알림 등 데모 데이터를 모두 지울까요? (회원 정보는 남아요)")) return;
    ["cart", "wish", "orders", "recipes", "annivs", "notiLog", "demoOffset", "seeded", "quizResult"].forEach((k) => store.remove(k));
    setTimeout(() => location.reload(), 400);
  };
  $("#logoutBtn").onclick = () => window.logout();

  function refresh() { renderAlerts(); renderAnniv(); renderOrders(); renderRecipes(); renderWish(); counts(); updateBadges(); }

  runNotifications(false);
  fillProfile();
  loadShipInfo();
  refresh();
  showTab(location.hash.slice(1) || "alerts");
});
