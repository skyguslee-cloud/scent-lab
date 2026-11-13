/* ============ SCENT LAB — Admin: orders, production sheet, shipping ============
   Access is enforced on the server: only users in public.admins can read all orders
   (RLS) or change shipping info (admin_update_order function).
*/
(async function () {
  const root = $("#adminRoot");
  const SHIP = { PAID: "결제완료", MAKING: "제작중", SHIPPING: "배송중", DELIVERED: "배송완료", CANCELED: "취소" };
  const PAY = { DONE: "결제됨", READY: "결제 미완료", FAILED: "결제 실패" };
  const CARRIERS = ["CJ대한통운", "한진택배", "롯데택배", "우체국택배", "로젠택배", "직접 전달"];
  const TABS = [
    { id: "todo", label: "처리 대기", test: (o) => o.status === "DONE" && ["PAID", "MAKING"].includes(o.ship_status) },
    { id: "SHIPPING", label: "배송중", test: (o) => o.status === "DONE" && o.ship_status === "SHIPPING" },
    { id: "DELIVERED", label: "배송완료", test: (o) => o.status === "DONE" && o.ship_status === "DELIVERED" },
    { id: "CANCELED", label: "취소", test: (o) => o.status === "DONE" && o.ship_status === "CANCELED" },
    { id: "paid", label: "결제 완료 전체", test: (o) => o.status === "DONE" },
    { id: "unpaid", label: "미결제·실패", test: (o) => o.status !== "DONE" },
  ];
  let orders = [];
  let profiles = {};
  let tab = "todo";
  let q = "";

  const deny = (msg, link) => {
    root.innerHTML = `<div class="empty"><p class="h2" style="margin-bottom:14px">${msg}</p>${link || ""}</div>`;
  };
  const me = currentUser();
  if (!me) return deny("관리자 로그인이 필요해요", `<a class="btn" href="login.html?next=admin.html">로그인</a>`);
  if (!sb) return deny("서버에 연결할 수 없어요", "");
  if (!(await checkAdmin())) return deny("관리자만 볼 수 있는 페이지예요", `<a class="btn btn-ghost" href="index.html">홈으로</a>`);
  $("#adminWho").textContent = `${me.name || me.email} · 관리자`;

  const dt = (s) => { if (!s) return "—"; const d = new Date(s); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
  const day = (s) => { const d = new Date(s); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const stBadge = (o) => o.status !== "DONE" ? `<span class="st ${o.status}">${PAY[o.status]}</span>` : `<span class="st ${o.ship_status}">${SHIP[o.ship_status]}</span>`;
  const itemTitle = (it) => it.type === "custom" ? it.recipe?.name || "커스텀 퍼퓸" : (productById(it.id)?.name || it.id);
  const customer = (o) => profiles[o.user_id]?.name || o.order_data?.fill?.name || "—";

  async function load() {
    const [p1, p2] = await Promise.all([
      sb.from("payments").select("*").order("created_at", { ascending: false }).limit(500),
      sb.from("profiles").select("id, name, phone, birthday, created_at"),
    ]);
    if (p1.error) return deny("주문을 불러오지 못했어요", `<p class="muted">${esc(p1.error.message)}</p>`);
    orders = p1.data;
    profiles = Object.fromEntries((p2.data || []).map((p) => [p.id, p]));
    render();
  }

  function kpis() {
    const paid = orders.filter((o) => o.status === "DONE" && o.ship_status !== "CANCELED");
    const now = new Date();
    const today = paid.filter((o) => day(o.approved_at || o.created_at) === day(now));
    const month = paid.filter((o) => { const d = new Date(o.approved_at || o.created_at); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); });
    const sum = (a) => a.reduce((s, o) => s + o.amount, 0);
    const todo = orders.filter(TABS[0].test).length;
    return `
      <div class="kpis">
        <div class="kpi"><span class="eyebrow">오늘 매출</span><div class="v">${won(sum(today))}</div><div class="s">${today.length}건</div></div>
        <div class="kpi"><span class="eyebrow">이번 달 매출</span><div class="v">${won(sum(month))}</div><div class="s">${month.length}건</div></div>
        <div class="kpi"><span class="eyebrow">처리 대기</span><div class="v" style="color:${todo ? "var(--gold)" : "inherit"}">${todo}건</div><div class="s">결제완료 · 제작중</div></div>
        <div class="kpi"><span class="eyebrow">회원 수</span><div class="v">${Object.keys(profiles).length}명</div><div class="s">가입한 전체 회원</div></div>
      </div>`;
  }

  function filtered() {
    const t = TABS.find((x) => x.id === tab);
    const s = q.trim().toLowerCase();
    return orders.filter(t.test).filter((o) => !s || [o.order_id, o.order_name, customer(o), o.order_data?.to, o.order_data?.fill?.phone, o.tracking_no].join(" ").toLowerCase().includes(s));
  }

  function render() {
    const list = filtered();
    root.innerHTML = `
      ${kpis()}
      <div class="shop-bar" style="position:static;margin-bottom:0">
        <div class="tabs-line" id="tabs">${TABS.map((t) => `<button data-tab="${t.id}" class="${t.id === tab ? "on" : ""}">${t.label} <span class="gold">${orders.filter(t.test).length}</span></button>`).join("")}</div>
        <div class="row">
          <input class="input" id="search" placeholder="주문번호·이름·연락처·송장 검색" value="${esc(q)}" aria-label="주문 검색">
          <button class="btn btn-ghost btn-sm" id="reload">새로고침</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="orders">
          <thead><tr><th>주문일시</th><th>주문번호</th><th>주문자</th><th>받는 분</th><th>상품</th><th style="text-align:right">금액</th><th>상태</th><th>송장</th></tr></thead>
          <tbody>${list.length ? list.map((o) => `
            <tr data-id="${esc(o.order_id)}">
              <td style="white-space:nowrap">${dt(o.approved_at || o.created_at)}</td>
              <td style="white-space:nowrap">${esc(o.order_id)}</td>
              <td>${esc(customer(o))}</td>
              <td>${esc(o.order_data?.gift ? (o.order_data?.to || "") + " (선물)" : o.order_data?.to || "본인")}</td>
              <td>${esc(o.order_name)}</td>
              <td class="num">${won(o.amount)}</td>
              <td>${stBadge(o)}</td>
              <td style="white-space:nowrap">${o.tracking_no ? esc((o.carrier || "") + " " + o.tracking_no) : "—"}</td>
            </tr>`).join("") : `<tr><td colspan="8" class="center muted" style="padding:50px">해당하는 주문이 없어요.</td></tr>`}</tbody>
        </table>
      </div>
      <p class="muted" style="font-size:12px;margin-top:14px">주문을 누르면 제작 정보(향료 비율·병·각인·포장)와 배송 처리 화면이 열려요.</p>`;
    $("#tabs").onclick = (e) => { const b = e.target.closest("[data-tab]"); if (b) { tab = b.dataset.tab; render(); } };
    $("#search").oninput = (e) => { q = e.target.value; const pos = e.target.selectionStart; render(); const s = $("#search"); s.focus(); s.setSelectionRange(pos, pos); };
    $("#reload").onclick = () => { toast("주문을 다시 불러왔어요", "↻"); load(); };
    $(".orders tbody").onclick = (e) => { const tr = e.target.closest("tr[data-id]"); if (tr) openDetail(tr.dataset.id); };
  }

  /* ---------- production sheet for one item ---------- */
  function itemBlock(it) {
    if (it.type !== "custom") {
      const p = productById(it.id);
      return `<div class="recipe"><div class="media">${p ? productVisual(p) : ""}</div><div>
        <div class="serif" style="font-size:20px">${esc(p?.name || it.id)} × ${it.qty}</div>
        <div class="muted" style="font-size:12px">${esc(p ? p.ko + " · " + p.sub : "")}${it.size ? ` · ${it.size}ml` : ""}</div>
        <div style="font-size:13px;margin-top:8px">${won(it.price)} / 개</div></div></div>`;
    }
    const r = it.recipe;
    const pct = notePercents(r.notes);
    const rows = TIERS.map((t) => Object.keys(pct).filter((k) => noteById(k)?.tier === t.id).sort((a, b) => pct[b] - pct[a]).map((k) => {
      const n = noteById(k);
      return `<div class="note-row"><span>${n.name}</span><span class="bar"><i style="width:${pct[k]}%;background:${n.color}"></i></span><span style="text-align:right">${Math.round(pct[k])}%</span></div>`;
    }).join("")).join("");
    const g = r.gift || {};
    return `<div class="recipe">
      <div class="media">${renderBottle({ shape: r.bottle, cap: r.cap, notes: r.notes, label: r.label?.text, labelFont: r.label?.font, size: r.size, animate: false })}</div>
      <div>
        <div class="serif" style="font-size:20px">${esc(r.name)} <span class="pill">Custom</span> × ${it.qty}</div>
        <div style="margin:10px 0">${rows}</div>
        <dl class="kv">
          <dt>병 · 캡 · 용량</dt><dd>${esc(byId(BOTTLES, r.bottle)?.name)} · ${esc(byId(CAPS, r.cap)?.name)} · ${r.size}ml</dd>
          <dt>라벨 각인</dt><dd>${r.label?.text ? `“${esc(r.label.text)}” (${esc(byId(LABEL_FONTS, r.label.font)?.name || "")})` : "없음"}</dd>
          <dt>액세서리</dt><dd>${(r.acc || []).map((a) => esc(byId(ACCESSORIES, a)?.name)).join(", ") || "없음"}</dd>
          <dt>포장</dt><dd>${g.wrap && g.wrap !== "none" ? `${esc(byId(WRAPS, g.wrap)?.name)} 포장지 + ${esc(byId(RIBBONS, g.ribbon)?.name)} 리본` : "포장 안 함"} · ${esc(byId(BOXES, g.box)?.name || "기본 케이스")}</dd>
          <dt>메시지 카드</dt><dd style="white-space:pre-wrap;font-family:var(--hand);font-size:18px;line-height:1.3">${g.card ? esc(g.cardText || "(빈 카드)") : "<span style='font-family:var(--sans);font-size:13px'>없음</span>"}</dd>
        </dl>
      </div></div>`;
  }

  function openDetail(id) {
    const o = orders.find((x) => x.order_id === id);
    if (!o) return;
    const d = o.order_data || {};
    const prof = profiles[o.user_id] || {};
    const paid = o.status === "DONE";
    openModal(`
      <div class="detail">
        <span class="eyebrow">Order · 제작 지시서</span>
        <h2 class="h2" style="margin:8px 0 4px">${esc(o.order_id)}</h2>
        <p>${stBadge(o)} <span class="muted" style="font-size:12px;margin-left:8px">${dt(o.created_at)} 주문${o.approved_at ? ` · ${dt(o.approved_at)} 결제` : ""}</span></p>

        <h3>주문 · 결제</h3>
        <dl class="kv">
          <dt>주문자</dt><dd>${esc(prof.name || d.fill?.name || "—")} · ${esc(d.fill?.phone || prof.phone || "—")}</dd>
          <dt>결제 금액</dt><dd><b>${won(o.amount)}</b>${d.coupon ? ` (쿠폰 ${esc(d.coupon)})` : ""}</dd>
          <dt>결제 수단</dt><dd>${esc(o.method || (paid ? "토스페이먼츠" : "—"))}${o.receipt_url ? ` · <a class="link" style="font-size:10px" href="${esc(o.receipt_url)}" target="_blank" rel="noopener">영수증</a>` : ""}</dd>
          ${o.fail_reason ? `<dt>실패 사유</dt><dd style="color:var(--danger)">${esc(o.fail_reason)}</dd>` : ""}
        </dl>

        <h3>받는 분 · 배송지</h3>
        <dl class="kv">
          <dt>받는 분</dt><dd>${esc(d.to || "—")}${d.gift ? " <span class='pill'>선물 · 가격 숨김</span>" : ""}</dd>
          <dt>배송지</dt><dd>${esc(d.addr || "—")}</dd>
          <dt>희망 도착일</dt><dd>${esc(d.wantDate || "—")}</dd>
          <dt>배송 메모</dt><dd>${esc(d.memo || "—")}</dd>
        </dl>

        <h3>상품 (${(d.items || []).reduce((s, i) => s + i.qty, 0)}개)</h3>
        ${(d.items || []).map(itemBlock).join("") || `<p class="muted">상품 정보가 없어요.</p>`}

        ${paid ? `
        <h3 class="no-print">배송 처리</h3>
        <form id="shipForm" class="no-print">
          <div class="grid grid-2" style="gap:0 16px">
            <div class="field"><label>배송 상태</label><select class="input" name="status">${Object.entries(SHIP).map(([k, v]) => `<option value="${k}" ${o.ship_status === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>
            <div class="field"><label>택배사</label><select class="input" name="carrier"><option value="">선택 안 함</option>${CARRIERS.map((c) => `<option ${o.carrier === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
          </div>
          <div class="field"><label>송장번호</label><input class="input" name="tracking" maxlength="40" value="${esc(o.tracking_no || "")}" placeholder="예) 6012-3456-7890"></div>
          <div class="field"><label>관리자 메모 (고객에게 보이지 않음)</label><textarea class="input" name="memo" maxlength="500" style="min-height:70px">${esc(o.admin_memo || "")}</textarea></div>
          <div class="row wrap">
            <button class="btn" type="submit">저장</button>
            <button class="btn btn-ghost" type="button" id="printBtn">제작 지시서 인쇄</button>
          </div>
        </form>` : `<p class="muted no-print" style="margin-top:20px">결제가 끝나지 않은 주문이라 배송 처리를 할 수 없어요.</p>`}
      </div>`);

    const f = $("#shipForm");
    if (!f) return;
    $("#printBtn").onclick = () => {
      document.body.classList.add("print-mode");
      window.print();
      setTimeout(() => document.body.classList.remove("print-mode"), 500);
    };
    f.onsubmit = async (e) => {
      e.preventDefault();
      if (f.status.value === "SHIPPING" && !f.tracking.value.trim()) {
        if (!confirm("송장번호 없이 '배송중'으로 바꿀까요?")) return;
      }
      const btn = $("button[type=submit]", f);
      btn.disabled = true; btn.textContent = "저장 중…";
      const { data, error } = await sb.rpc("admin_update_order", {
        p_order_id: o.order_id, p_ship_status: f.status.value, p_carrier: f.carrier.value, p_tracking_no: f.tracking.value, p_memo: f.memo.value,
      });
      btn.disabled = false; btn.textContent = "저장";
      if (error) return toast("저장하지 못했어요: " + error.message, "!");
      Object.assign(o, data);
      toast(`${o.order_id} → ${SHIP[o.ship_status]}`, "✓");
      closeModal();
      render();
    };
  }

  load();
})();
