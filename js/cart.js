/* ============ SCENT LAB — Bag & checkout (Toss Payments test mode) ============ */
(function () {
  const COUPONS = {
    SCENT10: { rate: 0.1, label: "선물 쿠폰 10%" },
    BDAY20: { rate: 0.2, label: "생일 쿠폰 20%" },
    WELCOME: { amount: 5000, label: "첫 구매 5,000원" },
  };
  let coupon = null;
  let widgets = null;      // Toss payment widget instance (members only)
  let widgetReady = false;
  const root = $("#cartRoot");

  function itemView(it) {
    if (it.type === "custom") {
      const r = it.recipe;
      const notes = Object.keys(r.notes).map((k) => noteById(k)?.name).filter(Boolean).join(" · ");
      const extras = [
        `${byId(BOTTLES, r.bottle)?.name} 보틀 · ${byId(CAPS, r.cap)?.name} 캡 · ${r.size}ml`,
        r.label.text ? `각인 “${esc(r.label.text)}”` : "",
        r.acc.length ? "액세서리: " + r.acc.map((a) => byId(ACCESSORIES, a)?.name).join(", ") : "",
        r.gift.wrap !== "none" ? `포장: ${byId(WRAPS, r.gift.wrap)?.name} + ${byId(RIBBONS, r.gift.ribbon)?.name} 리본` : "",
        r.gift.box !== "none" ? byId(BOXES, r.gift.box)?.name : "",
        r.gift.card ? "메시지 카드 포함" : "",
      ].filter(Boolean);
      return {
        title: r.name,
        media: renderBottle({ shape: r.bottle, cap: r.cap, notes: r.notes, label: r.label.text, labelFont: r.label.font, size: r.size, animate: false }),
        name: esc(r.name) + ' <span class="pill" style="vertical-align:middle;margin-left:6px">Custom</span>',
        opts: `${notes}<br>${extras.join("<br>")}`,
      };
    }
    const p = productById(it.id);
    return { title: p.name, media: productVisual(p), name: p.name, opts: `${p.ko} · ${p.sub}${it.size ? ` · ${it.size}ml` : ""}` };
  }

  function totals() {
    const items = cart.items();
    const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
    let disc = 0;
    if (coupon) disc = COUPONS[coupon].rate ? Math.round(sub * COUPONS[coupon].rate) : Math.min(sub, COUPONS[coupon].amount);
    const ship = sub - disc >= 100000 || sub === 0 ? 0 : 3000;
    return { items, sub, disc, ship, total: sub - disc + ship };
  }

  /* ---------- full layout (built once; parts are refreshed in place so typed form values survive) ---------- */
  function render() {
    const t = totals();
    if (!t.items.length) {
      root.innerHTML = `<div class="empty"><p class="h2" style="margin-bottom:14px">장바구니가 비어 있어요</p><p style="margin-bottom:30px">나만의 향을 만들거나 컬렉션을 둘러보세요.</p>
        <div class="row" style="justify-content:center"><a class="btn" href="lab.html">향 만들기</a><a class="btn btn-ghost" href="shop.html">컬렉션</a></div></div>`;
      return;
    }
    const p = profile();
    const me = currentUser();
    root.innerHTML = `
      <div class="cart">
        <div>
          <div id="items"></div>
          <form id="checkout" class="section-sm" novalidate>
            <h2 class="h2" style="margin-bottom:28px">주문 정보</h2>
            <div class="grid grid-2" style="gap:0 20px">
              <div class="field"><label>주문자 이름 *</label><input class="input" name="name" required value="${esc(p.name)}"></div>
              <div class="field"><label>연락처 *</label><input class="input" name="phone" required placeholder="010-0000-0000" value="${esc(p.phone)}"></div>
            </div>
            <label class="check" style="margin:6px 0 22px"><input type="checkbox" id="isGift" checked> 선물로 보내기 (받는 분께 가격이 표시되지 않아요)</label>
            <div id="giftFields">
              <div class="grid grid-2" style="gap:0 20px">
                <div class="field"><label>받는 분 이름 *</label><input class="input" name="rname" required></div>
                <div class="field"><label>받는 분 연락처 *</label><input class="input" name="rphone" required placeholder="010-0000-0000"></div>
              </div>
            </div>
            <div class="field"><label>배송지 *</label><input class="input" name="addr" required placeholder="예) 서울시 성동구 성수이로 00"></div>
            <div class="grid grid-2" style="gap:0 20px">
              <div class="field"><label>희망 도착일</label><input class="input" type="date" name="date"></div>
              <div class="field"><label>배송 메모</label><input class="input" name="memo" placeholder="문 앞에 놓아 주세요"></div>
            </div>
            <div class="box" style="margin-top:8px">
              <label class="check"><input type="checkbox" id="remember"> 받는 분의 생일·기념일을 등록하고 내년에도 알림 받기</label>
              <div id="rememberFields" style="display:none;margin-top:16px" class="grid grid-2">
                <div class="field" style="margin:0"><label>날짜</label><input class="input" type="date" name="adate"></div>
                <div class="field" style="margin:0"><label>종류</label><select class="input" name="akind"><option value="birthday">생일</option><option value="anniversary">기념일</option><option value="etc">특별한 날</option></select></div>
              </div>
            </div>
            <div class="row between wrap" style="margin:34px 0 10px">
              <h3 class="eyebrow">결제 수단 · 토스페이먼츠</h3>
              <span class="pill wait">테스트 모드 · 실제 출금 없음</span>
            </div>
            ${me ? `<div id="payment-method"></div><div id="agreement"></div>
                    <p class="muted" id="widgetMsg" style="font-size:12px">결제 수단을 불러오는 중…</p>`
                 : `<div class="box center"><p class="muted" style="margin-bottom:16px">로그인하면 카드·간편결제·계좌이체 등 토스페이먼츠 결제 수단이 나타나요.<br>장바구니는 그대로 옮겨 드려요.</p>
                    <a class="btn btn-sm" href="login.html?next=cart.html">로그인 / 회원가입</a></div>`}
          </form>
        </div>
        <aside class="summary" id="summary"></aside>
      </div>`;
    renderItems(t);
    renderSummary(t);
    bindForm();
    if (me) initWidget(t.total);
  }

  function renderItems(t = totals()) {
    $("#items").innerHTML = t.items.map((it) => {
      const v = itemView(it);
      return `<div class="cart-item" data-key="${it.key}">
        <div class="media">${v.media}</div>
        <div><div class="serif" style="font-size:22px;line-height:1.2">${v.name}</div><div class="opts" style="margin:6px 0 12px">${v.opts}</div>
          <div class="row"><div class="qty"><button data-q="-1" aria-label="수량 줄이기">−</button><span>${it.qty}</span><button data-q="1" aria-label="수량 늘리기">+</button></div>
          ${it.type === "custom" ? `<button class="link" data-edit style="font-size:10px">수정</button>` : ""}
          <button class="link" data-del style="font-size:10px">삭제</button></div></div>
        <div class="serif" style="font-size:20px">${won(it.price * it.qty)}</div>
      </div>`;
    }).join("");
  }

  function renderSummary(t = totals()) {
    $("#summary").innerHTML = `
      <span class="eyebrow">Order Summary</span>
      <div style="margin:22px 0">
        <div class="line"><span>상품 금액</span><span>${won(t.sub)}</span></div>
        <div class="line"><span>쿠폰 할인 ${coupon ? `<span class="gold" style="font-size:11px">${COUPONS[coupon].label}</span>` : ""}</span><span>${t.disc ? "−" + won(t.disc) : won(0)}</span></div>
        <div class="line"><span>배송비</span><span>${t.ship ? won(t.ship) : "무료"}</span></div>
        ${t.ship ? `<p class="muted" style="font-size:11px">${won(100000 - (t.sub - t.disc))} 더 담으면 무료배송</p>` : ""}
      </div>
      <div class="row" style="margin-bottom:22px">
        <input class="input" id="couponIn" placeholder="쿠폰 코드" value="${coupon || ""}" style="padding:10px 12px">
        <button class="btn btn-ghost btn-sm" id="applyCoupon">적용</button>
      </div>
      <p class="muted" style="font-size:11px;margin:-12px 0 20px">사용 가능: SCENT10 · BDAY20 · WELCOME</p>
      <div class="line" style="border-top:1px solid var(--line);padding-top:18px;align-items:baseline"><span class="upper">Total</span><span class="total">${won(t.total)}</span></div>
      <button class="btn btn-block" id="payBtn" style="margin-top:18px">${currentUser() ? won(t.total) + " 결제하기" : "로그인하고 결제하기"}</button>
      <p class="muted center" style="font-size:11px;margin-top:12px">토스페이먼츠 테스트 결제 · 실제로 돈이 나가지 않아요</p>`;
    $("#applyCoupon").onclick = () => {
      const c = $("#couponIn").value.trim().toUpperCase();
      if (!COUPONS[c]) return toast("유효하지 않은 쿠폰이에요", "!");
      coupon = c;
      toast(`${COUPONS[c].label} 할인이 적용됐어요`, "🏷");
      refresh();
    };
    $("#payBtn").onclick = placeOrder;
  }

  /* qty / delete / coupon: refresh parts and keep the widget amount in sync */
  function refresh() {
    const t = totals();
    if (!t.items.length) { render(); return; }
    renderItems(t);
    renderSummary(t);
    if (widgets && widgetReady) widgets.setAmount({ currency: "KRW", value: t.total }).catch(() => {});
  }

  function bindForm() {
    $("#items").onclick = (e) => {
      const row = e.target.closest(".cart-item");
      if (!row) return;
      const items = cart.items();
      const it = items.find((i) => i.key === row.dataset.key);
      if (e.target.closest("[data-q]")) { it.qty = Math.max(1, Math.min(9, it.qty + Number(e.target.closest("[data-q]").dataset.q))); cart.save(items); refresh(); }
      if (e.target.closest("[data-del]")) { cart.save(items.filter((i) => i !== it)); toast("삭제했어요", "×"); refresh(); }
      if (e.target.closest("[data-edit]")) { cart.save(items.filter((i) => i !== it)); openInLab(it.recipe); }
    };
    $("#isGift").onchange = (e) => ($("#giftFields").style.display = e.target.checked ? "" : "none");
    $("#remember").onchange = (e) => ($("#rememberFields").style.display = e.target.checked ? "" : "none");
  }

  /* ---------- Toss payment widget ---------- */
  async function initWidget(amount) {
    const msg = $("#widgetMsg");
    if (!window.TossPayments) { msg.textContent = "결제 모듈을 불러오지 못했어요. 새로고침해 주세요."; return; }
    try {
      const tp = TossPayments(TOSS_CLIENT_KEY);
      widgets = tp.widgets({ customerKey: currentUser().id });
      await widgets.setAmount({ currency: "KRW", value: amount });
      await Promise.all([
        widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
        widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
      ]);
      widgetReady = true;
      msg.textContent = "테스트 결제예요. 카드 정보를 입력해도 실제로 청구되지 않아요.";
    } catch (err) {
      console.warn(err);
      msg.textContent = "결제 수단을 불러오지 못했어요: " + (err.message || err);
    }
  }

  async function placeOrder() {
    if (!currentUser()) {
      toast("주문하려면 로그인해 주세요. 장바구니는 그대로 옮겨 드려요", "🔒");
      setTimeout(() => (location.href = "login.html?next=cart.html"), 900);
      return;
    }
    const f = $("#checkout");
    const gift = $("#isGift").checked;
    const need = ["name", "phone", "addr", ...(gift ? ["rname", "rphone"] : [])];
    const missing = need.filter((n) => !f[n].value.trim());
    if (missing.length) { f[missing[0]].focus(); f[missing[0]].style.borderColor = "var(--danger)"; return toast("필수 정보를 입력해 주세요", "!"); }
    if (!widgetReady) return toast("결제 수단을 불러오는 중이에요. 잠시만 기다려 주세요", "…");

    const t = totals();
    const me = currentUser();
    const orderId = "SL" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    const first = itemView(t.items[0]).title;
    const count = t.items.reduce((s, i) => s + i.qty, 0);
    const orderName = (count > 1 ? `${first} 외 ${count - 1}건` : first).slice(0, 100);
    const snap = {
      no: orderId, at: fmtDate(today()), atTime: today().getTime(), items: t.items, total: t.total, coupon,
      gift, to: gift ? f.rname.value.trim() : f.name.value.trim(), addr: f.addr.value.trim(), memo: f.memo.value.trim(), wantDate: f.date.value,
      fill: { name: f.name.value.trim(), phone: f.phone.value.trim() },
      remember: $("#remember").checked && f.adate.value ? { name: gift ? f.rname.value.trim() : f.name.value.trim(), kind: f.akind.value, date: f.adate.value } : null,
    };

    const btn = $("#payBtn");
    btn.disabled = true; btn.textContent = "결제창을 여는 중…";
    // 1) save orderId + amount on the server first so the confirm step can verify them
    const { error } = await sb.from("payments").insert({ order_id: orderId, user_id: me.id, amount: t.total, order_name: orderName, order_data: snap });
    if (error) {
      btn.disabled = false; btn.textContent = won(t.total) + " 결제하기";
      return toast("주문을 저장하지 못했어요: " + error.message, "!");
    }
    try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(snap)); } catch (e) { /* ignore */ }

    // 2) open Toss checkout; it redirects to pay-success.html or pay-fail.html
    const phone = f.phone.value.replace(/\D/g, "");
    try {
      await widgets.requestPayment({
        orderId, orderName,
        successUrl: siteBase() + "pay-success.html",
        failUrl: siteBase() + "pay-fail.html",
        customerEmail: profile().email || me.email,
        customerName: f.name.value.trim().slice(0, 100),
        ...(/^\d{8,15}$/.test(phone) ? { customerMobilePhone: phone } : {}),
      });
    } catch (err) {
      // user closed the window, etc.
      btn.disabled = false; btn.textContent = won(t.total) + " 결제하기";
      toast(err.code === "USER_CANCEL" ? "결제를 취소했어요" : "결제를 열지 못했어요: " + (err.message || err), "!");
    }
  }

  render();
})();
