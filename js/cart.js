/* ============ SCENT LAB — Bag & checkout (demo, no real payment) ============ */
(function () {
  const COUPONS = {
    SCENT10: { rate: 0.1, label: "선물 쿠폰 10%" },
    BDAY20: { rate: 0.2, label: "생일 쿠폰 20%" },
    WELCOME: { amount: 5000, label: "첫 구매 5,000원" },
  };
  let coupon = null;
  let pay = "card";
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
        media: renderBottle({ shape: r.bottle, cap: r.cap, notes: r.notes, label: r.label.text, labelFont: r.label.font, size: r.size, animate: false }),
        name: esc(r.name) + ' <span class="pill" style="vertical-align:middle;margin-left:6px">Custom</span>',
        opts: `${notes}<br>${extras.join("<br>")}`,
      };
    }
    const p = productById(it.id);
    return { media: productVisual(p), name: p.name, opts: `${p.ko} · ${p.sub}${it.size ? ` · ${it.size}ml` : ""}` };
  }

  function totals() {
    const items = cart.items();
    const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
    let disc = 0;
    if (coupon) disc = COUPONS[coupon].rate ? Math.round(sub * COUPONS[coupon].rate) : Math.min(sub, COUPONS[coupon].amount);
    const ship = sub - disc >= 100000 || sub === 0 ? 0 : 3000;
    return { items, sub, disc, ship, total: sub - disc + ship };
  }

  function render() {
    const t = totals();
    if (!t.items.length) {
      root.innerHTML = `<div class="empty"><p class="h2" style="margin-bottom:14px">장바구니가 비어 있어요</p><p style="margin-bottom:30px">나만의 향을 만들거나 컬렉션을 둘러보세요.</p>
        <div class="row" style="justify-content:center"><a class="btn" href="lab.html">향 만들기</a><a class="btn btn-ghost" href="shop.html">컬렉션</a></div></div>`;
      return;
    }
    const p = profile();
    root.innerHTML = `
      <div class="cart">
        <div>
          <div id="items">${t.items.map((it) => {
            const v = itemView(it);
            return `<div class="cart-item" data-key="${it.key}">
              <div class="media">${v.media}</div>
              <div><div class="serif" style="font-size:22px;line-height:1.2">${v.name}</div><div class="opts" style="margin:6px 0 12px">${v.opts}</div>
                <div class="row"><div class="qty"><button data-q="-1" aria-label="수량 줄이기">−</button><span>${it.qty}</span><button data-q="1" aria-label="수량 늘리기">+</button></div>
                ${it.type === "custom" ? `<button class="link" data-edit style="font-size:10px">수정</button>` : ""}
                <button class="link" data-del style="font-size:10px">삭제</button></div></div>
              <div class="serif" style="font-size:20px">${won(it.price * it.qty)}</div>
            </div>`;
          }).join("")}</div>

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
            <h3 class="eyebrow" style="margin:30px 0 14px">결제 수단 (데모 · 실제 결제 없음)</h3>
            <div class="pay-opts" id="payOpts">
              ${[["card", "신용카드"], ["kakao", "카카오페이"], ["naver", "네이버페이"], ["toss", "토스페이"], ["bank", "무통장입금"], ["phone", "휴대폰"]].map(([id, l]) => `<button type="button" class="chip ${pay === id ? "on" : ""}" data-pay="${id}">${l}</button>`).join("")}
            </div>
            <label class="check" style="margin-top:24px"><input type="checkbox" name="agree" required> 주문 내용을 확인했으며 데모 결제에 동의합니다 *</label>
          </form>
        </div>

        <aside class="summary">
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
          <button class="btn btn-block" id="payBtn" style="margin-top:18px">${won(t.total)} 결제하기</button>
          <p class="muted center" style="font-size:11px;margin-top:12px">과제용 데모 · 실제로 결제되지 않아요</p>
        </aside>
      </div>`;
    bind();
  }

  function bind() {
    $("#items").onclick = (e) => {
      const row = e.target.closest(".cart-item");
      if (!row) return;
      const items = cart.items();
      const it = items.find((i) => i.key === row.dataset.key);
      const q = e.target.closest("[data-q]");
      if (q) { it.qty = Math.max(1, Math.min(9, it.qty + Number(q.dataset.q))); cart.save(items); render(); }
      if (e.target.closest("[data-del]")) { cart.save(items.filter((i) => i !== it)); toast("삭제했어요", "×"); render(); }
      if (e.target.closest("[data-edit]")) { cart.save(items.filter((i) => i !== it)); openInLab(it.recipe); }
    };
    $("#applyCoupon").onclick = () => {
      const c = $("#couponIn").value.trim().toUpperCase();
      if (!COUPONS[c]) return toast("유효하지 않은 쿠폰이에요", "!");
      coupon = c; toast(`${COUPONS[c].label} 할인이 적용됐어요`, "🏷"); render();
    };
    $("#isGift").onchange = (e) => ($("#giftFields").style.display = e.target.checked ? "" : "none");
    $("#remember").onchange = (e) => ($("#rememberFields").style.display = e.target.checked ? "" : "none");
    $("#payOpts").onclick = (e) => { const b = e.target.closest("[data-pay]"); if (b) { pay = b.dataset.pay; $$("#payOpts .chip").forEach((x) => x.classList.toggle("on", x === b)); } };
    $("#payBtn").onclick = placeOrder;
  }

  function placeOrder() {
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
    if (!f.agree.checked) return toast("주문 확인에 동의해 주세요", "!");
    const t = totals();
    const no = "SL" + fmtDate(today()).replace(/\./g, "").slice(2) + "-" + Math.floor(1000 + Math.random() * 9000);
    const orders = store.get("orders", []);
    orders.unshift({ no, at: fmtDate(today()), atTime: today().getTime(), items: t.items, total: t.total, pay, gift, to: gift ? f.rname.value : f.name.value, addr: f.addr.value });
    store.set("orders", orders);
    const pr = profile();
    if (!pr.name) store.set("profile", { ...pr, name: f.name.value, phone: f.phone.value });
    if ($("#remember").checked && f.adate.value) {
      const list = annivs();
      list.push({ id: uid(), name: gift ? f.rname.value : f.name.value, relation: "friend", kind: f.akind.value, date: f.adate.value, daysBefore: 7, channels: ["email", "sms"] });
      store.set("annivs", list);
    }
    cart.save([]);
    if (window.confetti) {
      const c = ["#b0905f", "#d8c3a0", "#111111", "#e9c3c0"];
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: c });
      setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0 }, colors: c }), 250);
      setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1 }, colors: c }), 400);
    }
    render();
    openModal(`<div class="center">
      <span class="eyebrow">Merci</span>
      <h2 class="h2" style="margin:12px 0">주문이 완료되었어요</h2>
      <p class="muted">주문번호 <b class="serif" style="font-size:20px;color:var(--ink)">${no}</b></p>
      <p style="margin:18px 0 6px">${won(t.total)} · ${esc(gift ? f.rname.value + "님께 선물" : "본인 수령")}</p>
      <p class="muted" style="font-size:12px">조향사가 레시피대로 블렌딩한 뒤 2~3일 내 출고됩니다 (데모)</p>
      <div class="row" style="justify-content:center;margin-top:28px"><a class="btn btn-ghost btn-sm" href="index.html">홈으로</a><a class="btn btn-sm" href="mypage.html#orders">주문 내역 보기</a></div>
    </div>`);
  }

  render();
})();
