/* ============ SCENT LAB — Atelier (custom builder) ============ */
(function () {
  let r = loadInitial();
  let step = 0;
  let view = "bottle";
  let chart;

  function loadInitial() {
    const m = location.hash.match(/r=([^&]+)/);
    if (m) { const d = decodeRecipe(decodeURIComponent(m[1])); if (d) return merge(d); }
    try {
      const pre = sessionStorage.getItem("sl_labPreset");
      if (pre) { sessionStorage.removeItem("sl_labPreset"); return merge(JSON.parse(pre)); }
    } catch (e) { /* ignore */ }
    const fresh = newRecipe();
    fresh.notes = { bergamot: 50, jasmine: 50, sandalwood: 60 };
    fresh.name = randomName();
    return fresh;
  }
  function merge(d) {
    const base = newRecipe();
    return { ...base, ...d, label: { ...base.label, ...(d.label || {}) }, gift: { ...base.gift, ...(d.gift || {}) }, acc: d.acc || [], name: d.name || randomName() };
  }

  /* ---------- step 1: notes ---------- */
  function renderTiers() {
    $("#tiers").innerHTML = TIERS.map((t) => `
      <div class="tier" data-tier="${t.id}">
        <div class="tier-head"><div class="h3">${t.en} Notes<span>${t.ko} · ${t.hint}</span></div><span class="muted" style="font-size:12px" data-count="${t.id}"></span></div>
        <div class="note-grid">
          ${NOTES.filter((n) => n.tier === t.id).map((n) => `
            <button class="note" style="--c:${n.color}" data-note="${n.id}">
              <div class="dot"></div><div class="n">${n.name}</div><div class="e">${n.en}</div><div class="d">${n.desc}</div>
            </button>`).join("")}
        </div>
        <div class="mix" data-mix="${t.id}"></div>
      </div>`).join("");
    TIERS.forEach((t) => renderMix(t.id));
  }
  function renderMix(tier) {
    const ids = Object.keys(r.notes).filter((k) => r.notes[k] > 0 && noteById(k)?.tier === tier);
    $(`[data-count="${tier}"]`).textContent = `${ids.length} / 3`;
    $$(`[data-tier="${tier}"] .note`).forEach((b) => b.classList.toggle("on", ids.includes(b.dataset.note)));
    $(`[data-mix="${tier}"]`).innerHTML = ids.map((id) => {
      const n = noteById(id);
      return `<div class="mix-row" style="--c:${n.color}"><span class="lbl"><i></i>${n.name}</span>
        <input type="range" min="5" max="100" value="${r.notes[id]}" data-slider="${id}" aria-label="${n.name} 비율">
        <span class="pct" data-pct="${id}"></span></div>`;
    }).join("");
    updatePct();
  }
  function updatePct() {
    const pct = notePercents(r.notes);
    $$("[data-pct]").forEach((el) => (el.textContent = Math.round(pct[el.dataset.pct] || 0) + "%"));
  }
  $("#tiers").addEventListener("click", (e) => {
    const b = e.target.closest("[data-note]");
    if (!b) return;
    const id = b.dataset.note, tier = noteById(id).tier;
    if (r.notes[id] > 0) delete r.notes[id];
    else {
      const count = Object.keys(r.notes).filter((k) => noteById(k)?.tier === tier).length;
      if (count >= 3) return toast("한 층에는 최대 3개까지 고를 수 있어요", "!");
      r.notes[id] = 50;
    }
    renderMix(tier);
    update();
  });
  $("#tiers").addEventListener("input", (e) => {
    const s = e.target.closest("[data-slider]");
    if (!s) return;
    r.notes[s.dataset.slider] = Number(s.value);
    updatePct();
    update();
  });

  /* ---------- step 2: bottle ---------- */
  function renderBottleStep() {
    $("#bottleOpts").innerHTML = BOTTLES.map((b) => `
      <button class="opt ${r.bottle === b.id ? "on" : ""}" data-bottle="${b.id}"><span class="chk">✓</span>
        ${renderBottle({ shape: b.id, cap: r.cap, notes: r.notes, animate: false })}
        <div class="n">${b.name}</div><div class="p">${b.desc}<br>${b.price ? "+" + won(b.price) : "기본"}</div></button>`).join("");
    $("#capOpts").innerHTML = CAPS.map((c) => `
      <button class="opt ${r.cap === c.id ? "on" : ""}" data-cap="${c.id}"><span class="chk">✓</span>
        <svg viewBox="0 0 60 60" style="height:44px"><defs><linearGradient id="cp${c.id}" x1="0" x2="1"><stop offset="0" stop-color="${shade(c.color, -0.25)}"/><stop offset=".4" stop-color="${c.hi}"/><stop offset="1" stop-color="${shade(c.color, -0.3)}"/></linearGradient></defs><rect x="14" y="8" width="32" height="44" rx="3" fill="url(#cp${c.id})" ${c.glass ? 'opacity=".7" stroke="#9fb4c2"' : ""}/></svg>
        <div class="n">${c.name}</div><div class="p">${c.price ? "+" + won(c.price) : "기본"}</div></button>`).join("");
    $("#sizeOpts").innerHTML = SIZES.map((s) => `<button class="chip ${r.size === s.id ? "on" : ""}" data-size="${s.id}">${s.name} · ${won(s.price)}</button>`).join("");
    $("#fontOpts").innerHTML = LABEL_FONTS.map((f) => `<button class="chip ${r.label.font === f.id ? "on" : ""}" data-font="${f.id}" style="font-family:${f.css}">${f.name}</button>`).join("");
    $("#labelText").value = r.label.text;
  }
  $(".lab-panel").addEventListener("click", (e) => {
    const t = e.target.closest("[data-bottle],[data-cap],[data-size],[data-font],[data-acc],[data-wrap],[data-ribbon],[data-box],[data-tpl]");
    if (!t) return;
    const d = t.dataset;
    if (d.bottle) r.bottle = d.bottle;
    if (d.cap) r.cap = d.cap;
    if (d.size) r.size = Number(d.size);
    if (d.font) r.label.font = d.font;
    if (d.acc) { r.acc = r.acc.includes(d.acc) ? r.acc.filter((x) => x !== d.acc) : [...r.acc, d.acc]; if (view === "bottle" && r.acc.length) setView("set"); }
    if (d.wrap) { r.gift.wrap = d.wrap; setView("gift"); }
    if (d.ribbon) { r.gift.ribbon = d.ribbon; setView("gift"); }
    if (d.box) { r.gift.box = d.box; setView("gift"); }
    if (d.tpl) { r.gift.cardText = OCCASION_STYLE[d.tpl].card; $("#cardText").value = r.gift.cardText; }
    if (d.bottle || d.cap || d.size || d.font) renderBottleStep();
    if (d.acc) renderAccStep();
    if (d.wrap || d.ribbon || d.box || d.tpl) renderGiftStep();
    update();
  });
  $("#labelText").addEventListener("input", (e) => { r.label.text = e.target.value; update(); });

  /* ---------- step 3: accessories ---------- */
  function renderAccStep() {
    const col = blendColor(r.notes);
    $("#accOpts").innerHTML = ACCESSORIES.map((a) => `
      <button class="opt ${r.acc.includes(a.id) ? "on" : ""}" data-acc="${a.id}"><span class="chk">✓</span>
        ${renderAccessory(a.icon, col)}
        <div class="n">${a.name}</div><div class="p">${a.desc}<br>+${won(a.price)}</div></button>`).join("");
  }

  /* ---------- step 4: gift ---------- */
  function renderGiftStep() {
    $("#wrapOpts").innerHTML = WRAPS.map((w) => `<button class="swatch ${r.gift.wrap === w.id ? "on" : ""}" data-wrap="${w.id}" title="${w.name}" aria-label="${w.name}"
      style="background:${w.color || "repeating-linear-gradient(45deg,var(--bg),var(--bg) 4px,var(--line) 4px,var(--line) 5px)"}"></button>`).join("");
    $("#wrapName").textContent = byId(WRAPS, r.gift.wrap).name;
    $("#ribbonOpts").innerHTML = RIBBONS.map((x) => `<button class="swatch ${r.gift.ribbon === x.id ? "on" : ""}" data-ribbon="${x.id}" title="${x.name}" aria-label="${x.name} 리본" style="background:${x.color}"></button>`).join("");
    $("#boxOpts").innerHTML = BOXES.map((b) => `
      <button class="opt ${r.gift.box === b.id ? "on" : ""}" data-box="${b.id}"><span class="chk">✓</span>
        ${renderGiftBox({ box: b.id, wrap: "none" })}
        <div class="n">${b.name}</div><div class="p">${b.desc}<br>${b.price ? "+" + won(b.price) : "무료"}</div></button>`).join("");
    $("#cardOn").checked = r.gift.card;
    $("#cardArea").style.display = r.gift.card ? "block" : "none";
    $("#cardTpl").innerHTML = OCCASIONS.map((o) => `<button class="chip" data-tpl="${o.id}">${o.emoji} ${o.ko}</button>`).join("");
    $("#cardText").value = r.gift.cardText;
    $("#cardPreview").textContent = r.gift.cardText || "여기에 메시지가 손글씨로 보여요.";
  }
  $("#cardOn").addEventListener("change", (e) => { r.gift.card = e.target.checked; renderGiftStep(); update(); });
  $("#cardText").addEventListener("input", (e) => { r.gift.cardText = e.target.value; $("#cardPreview").textContent = e.target.value || " "; });

  /* ---------- preview ---------- */
  function setView(v) {
    view = v;
    $$("#viewToggle button").forEach((b) => b.classList.toggle("on", b.dataset.view === v));
    renderStage();
  }
  $("#viewToggle").addEventListener("click", (e) => { const b = e.target.closest("[data-view]"); if (b) setView(b.dataset.view); });

  function renderStage() {
    const label = r.label.text || "";
    const bottle = (attrs) => renderBottle({ shape: r.bottle, cap: r.cap, notes: r.notes, label, labelFont: r.label.font, size: r.size, attrs });
    let html;
    if (view === "gift") {
      html = renderGiftBox({ wrap: r.gift.wrap, ribbon: r.gift.ribbon, box: r.gift.box, tag: r.gift.card ? "To. ♥" : "", });
    } else if (view === "set") {
      const col = blendColor(r.notes);
      const accs = r.acc.map((id) => byId(ACCESSORIES, id));
      const slots = [[10, 170], [290, 170], [0, 60], [300, 60], [60, 210], [240, 210]];
      html = `<svg viewBox="0 0 400 330">
        ${accs.map((a, i) => { const [x, y] = slots[i]; return renderAccessory(a.icon, col, `x="${x}" y="${y}" width="100" height="130"`); }).join("")}
        ${bottle('x="100" y="0" width="200" height="320"')}
        ${!accs.length ? '<text x="200" y="326" text-anchor="middle" font-size="11" fill="#8f8a83">03 단계에서 액세서리를 추가해 보세요</text>' : ""}
      </svg>`;
    } else {
      html = bottle('');
    }
    $("#stage").innerHTML = html;
  }

  function renderRadar() {
    const prof = famProfile(r.notes);
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--muted").trim(), line = css.getPropertyValue("--line").trim();
    const col = blendColor(r.notes);
    const data = FAMILIES.map((f) => prof[f.id]);
    if (!window.Chart) return;
    if (!chart) {
      chart = new Chart($("#radar"), {
        type: "radar",
        data: { labels: FAMILIES.map((f) => f.ko), datasets: [{ data, borderWidth: 1.5, pointRadius: 2 }] },
        options: {
          maintainAspectRatio: false, animation: { duration: 500 },
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { r: { min: 0, max: 100, ticks: { display: false, stepSize: 25 }, pointLabels: { font: { size: 11, family: "Noto Sans KR" } } } },
        },
      });
    }
    const ds = chart.data.datasets[0];
    ds.data = data;
    ds.borderColor = shade(col, -0.3);
    ds.backgroundColor = col + "88";
    ds.pointBackgroundColor = shade(col, -0.3);
    chart.options.scales.r.grid = { color: line };
    chart.options.scales.r.angleLines = { color: line };
    chart.options.scales.r.pointLabels.color = ink;
    chart.update();
  }

  function update() {
    renderStage();
    $("#rName").textContent = r.name || "Untitled";
    $("#rDesc").textContent = describeRecipe(r.notes);
    renderRadar();
    const { lines, total } = recipePrice(r);
    $("#total").textContent = won(total);
    $("#breakdown").innerHTML = lines.map(([l, p]) => `<div><span>${esc(l)}</span><span>${won(p)}</span></div>`).join("");
    history.replaceState(null, "", "#r=" + encodeURIComponent(encodeRecipe(r)));
  }
  $("#priceToggle").addEventListener("click", () => $("#breakdown").classList.toggle("open"));
  $("#nameBtn").addEventListener("click", () => { r.name = randomName(); update(); });
  $("#rName").addEventListener("dblclick", () => {
    const n = prompt("향수 이름을 지어 주세요", r.name);
    if (n) { r.name = n.slice(0, 24); update(); }
  });

  /* ---------- steps nav ---------- */
  function goStep(i, quiet) {
    step = Math.max(0, Math.min(3, i));
    $$("#stepper button").forEach((b) => b.classList.toggle("on", Number(b.dataset.step) === step));
    $$(".step").forEach((s) => s.classList.toggle("on", Number(s.dataset.step) === step));
    $("#prevBtn").style.visibility = step === 0 ? "hidden" : "visible";
    $("#nextBtn").textContent = step === 3 ? "장바구니 담기" : "다음 단계";
    if (step === 1) renderBottleStep();
    if (step === 2) renderAccStep();
    if (step === 3) { renderGiftStep(); setView("gift"); }
    else if (view === "gift") setView(step === 2 ? "set" : "bottle");
    if (step === 2 && r.acc.length) setView("set");
    if (quiet) return;
    if (innerWidth < 1080) $(".lab-panel").scrollIntoView({ behavior: "smooth" });
    else scrollTo({ top: 0, behavior: "smooth" });
  }
  $("#stepper").addEventListener("click", (e) => { const b = e.target.closest("[data-step]"); if (b) goStep(Number(b.dataset.step)); });
  $("#prevBtn").addEventListener("click", () => goStep(step - 1));
  $("#nextBtn").addEventListener("click", () => {
    if (step === 0 && !Object.keys(r.notes).length) return toast("향료를 하나 이상 골라 주세요", "!");
    if (step === 3) addToCart(); else goStep(step + 1);
  });

  /* ---------- actions ---------- */
  function addToCart() {
    if (!Object.keys(r.notes).length) return toast("향료를 하나 이상 골라 주세요", "!");
    const { total } = recipePrice(r);
    cart.add({ type: "custom", recipe: JSON.parse(JSON.stringify(r)), price: total, qty: 1 });
    openModal(`
      <div class="center">
        <div style="height:220px;display:grid;place-items:center">${renderBottle({ shape: r.bottle, cap: r.cap, notes: r.notes, label: r.label.text, labelFont: r.label.font, size: r.size, attrs: 'style="height:100%"' })}</div>
        <span class="eyebrow">Added to bag</span>
        <h2 class="h2" style="margin:10px 0 6px">${esc(r.name)}</h2>
        <p class="muted">${won(total)} · 장바구니에 담았어요</p>
        <div class="row" style="justify-content:center;margin-top:26px">
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">계속 만들기</button>
          <a class="btn btn-sm" href="cart.html">장바구니 보기</a>
        </div>
      </div>`);
  }
  $("#addBtn").addEventListener("click", addToCart);
  $("#saveBtn").addEventListener("click", () => {
    const list = store.get("recipes", []);
    list.unshift({ id: uid(), savedAt: fmtDate(today()), recipe: JSON.parse(JSON.stringify(r)) });
    store.set("recipes", list.slice(0, 30));
    toast(`'${esc(r.name)}' 레시피를 마이페이지에 저장했어요`, "✎");
  });
  $("#shareBtn").addEventListener("click", async () => {
    const url = location.href.split("#")[0] + "#r=" + encodeURIComponent(encodeRecipe(r));
    let copied = false;
    try { await navigator.clipboard.writeText(url); copied = true; } catch (e) { /* ignore */ }
    openModal(`<span class="eyebrow">Share your recipe</span><h2 class="h2" style="margin:10px 0 16px">레시피 공유</h2>
      <p class="muted" style="margin-bottom:14px">${copied ? "링크를 클립보드에 복사했어요. " : ""}이 링크를 열면 같은 향·병·포장이 그대로 열려요.</p>
      <input class="input" readonly value="${esc(url)}" onclick="this.select()">`);
  });
  document.addEventListener("themechange", renderRadar);

  /* ---------- init ---------- */
  renderTiers();
  goStep(0, true);
  update();
  if (location.hash || r.name) {
    TIERS.forEach((t) => renderMix(t.id));
  }
})();
