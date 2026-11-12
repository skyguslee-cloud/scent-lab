/* ============ SCENT LAB — Gift Finder ============ */
(function () {
  const sel = { who: qs("who") || null, occ: qs("occ") || null, mood: null, budget: "b4" };
  const SRC = {
    who: RECIPIENTS.map((x) => ({ id: x.id, t: `${x.emoji} ${x.ko}` })),
    occ: OCCASIONS.map((x) => ({ id: x.id, t: `${x.emoji} ${x.ko}` })),
    mood: MOODS.map((x) => ({ id: x.id, t: x.ko })),
    budget: BUDGETS.map((x) => ({ id: x.id, t: x.ko })),
  };
  function renderChips() {
    $$("[data-key]").forEach((box) => {
      const k = box.dataset.key;
      box.innerHTML = SRC[k].map((o) => `<button class="chip ${sel[k] === o.id ? "on" : ""}" data-v="${o.id}">${o.t}</button>`).join("");
    });
  }
  $("#form").addEventListener("click", (e) => {
    const c = e.target.closest("[data-v]");
    if (!c) return;
    const k = c.parentElement.dataset.key;
    sel[k] = sel[k] === c.dataset.v && k === "mood" ? null : c.dataset.v;
    renderChips();
  });

  function giftRecipe(p, style, name) {
    const r = productToRecipe(p.notes ? p : productById("aube"));
    r.label.text = name ? `For ${name}` : "";
    r.label.font = "hand";
    r.gift = { wrap: style.wrap, ribbon: style.ribbon, box: style.box, card: true, cardText: (name ? `${name}에게,\n` : "") + style.card };
    if (sel.occ === "birthday" || sel.occ === "anniversary") r.acc = ["candle"];
    return r;
  }

  $("#findBtn").addEventListener("click", () => {
    if (!sel.who || !sel.occ) return toast("받는 사람과 어떤 날인지 골라 주세요", "!");
    const recs = recommend(sel, 3);
    const style = OCCASION_STYLE[sel.occ];
    const name = $("#toName").value.trim();
    const w = byId(RECIPIENTS, sel.who), o = byId(OCCASIONS, sel.occ);
    $("#resTitle").textContent = `${name || w.ko}의 ${o.ko}을 위한 세 가지 향`;
    $("#results").style.display = "block";

    $("#recList").innerHTML = recs.length ? recs.map((x, i) => {
      const p = x.product;
      return `<div class="rec-card reveal">
        <a class="media" href="product.html?id=${p.id}">${productVisual(p)}</a>
        <div>
          <div class="rank">No. 0${i + 1} · 적합도 ${Math.min(99, Math.round(x.score * 11))}%</div>
          <div class="h3" style="margin-top:6px">${p.name}</div>
          <div class="muted" style="font-size:12px">${p.ko} · ${p.sub}</div>
          <p class="reason">${x.reason}</p>
          <div class="row wrap">
            <span class="serif" style="font-size:20px;margin-right:auto">${won(p.price)}</span>
            ${p.cat === "accessory" ? `<button class="btn btn-sm" data-quick="${p.id}">담기</button>` :
              `<button class="btn btn-sm btn-ghost" data-custom="${p.id}">포장까지 맞춤</button><button class="btn btn-sm" data-quick="${p.id}">바로 담기</button>`}
          </div>
        </div>
      </div>`;
    }).join("") : `<p class="empty">조건에 맞는 상품이 없어요. 예산을 넓혀 보세요.</p>`;

    $("#wrapPreview").innerHTML = renderGiftBox({ wrap: style.wrap, ribbon: style.ribbon, box: style.box, tag: name ? `To. ${name}` : "To. ♥", attrs: 'style="height:100%;margin:auto"' });
    $("#wrapDesc").innerHTML = `${byId(WRAPS, style.wrap).name} 포장지 · ${byId(RIBBONS, style.ribbon).name} 리본 · ${byId(BOXES, style.box).name}<br>‘포장까지 맞춤’을 누르면 이 포장과 카드가 아틀리에에 그대로 적용돼요.`;
    $("#cardPreview").textContent = (name ? `${name}에게,\n` : "") + style.card;
    const kind = sel.occ === "birthday" ? "birthday" : sel.occ === "anniversary" ? "anniversary" : sel.occ === "graduation" ? "graduation" : "etc";
    $("#annivLink").href = `mypage.html?add=1&name=${encodeURIComponent(name || w.ko)}&rel=${sel.who}&kind=${kind}#anniv`;
    $("#annivLink").style.display = sel.who === "me" ? "none" : "";

    $$("[data-custom]").forEach((b) => b.addEventListener("click", () => openInLab(giftRecipe(productById(b.dataset.custom), style, name))));
    initReveal();
    $("#results").scrollIntoView({ behavior: "smooth" });
  });

  renderChips();
  if (sel.who) setTimeout(() => toast(`${byId(RECIPIENTS, sel.who)?.ko}에게 줄 선물이군요. 어떤 날인지 골라 주세요`, "🎁"), 300);
  const mq = matchMedia("(max-width: 860px)");
  const fit = () => ($("#resGrid").style.gridTemplateColumns = mq.matches ? "1fr" : "minmax(0,1.4fr) minmax(0,1fr)");
  fit(); mq.addEventListener("change", fit);
})();
