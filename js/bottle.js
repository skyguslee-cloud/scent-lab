/* ============ SCENT LAB — SVG renderers (bottle, gift box, accessories) ============ */

const BOTTLE_GEOM = {
  classic: {
    body: (a) => `<rect x="40" y="110" width="120" height="190" rx="12" ${a}/>`,
    box: { x1: 40, x2: 160, y1: 110, y2: 300 },
    neck: { x: 84, y: 90, w: 32, h: 22 },
    label: { x: 58, y: 178, w: 84, h: 62 },
    cap: (f, s) => `<rect x="68" y="38" width="64" height="54" rx="4" fill="${f}" stroke="${s}" stroke-width="1"/>`,
  },
  moon: {
    body: (a) => `<circle cx="100" cy="212" r="88" ${a}/>`,
    box: { x1: 12, x2: 188, y1: 124, y2: 300 },
    neck: { x: 86, y: 108, w: 28, h: 20 },
    label: { x: 60, y: 192, w: 80, h: 52 },
    cap: (f, s) => `<circle cx="100" cy="80" r="30" fill="${f}" stroke="${s}" stroke-width="1"/>`,
  },
  spire: {
    body: (a) => `<rect x="64" y="92" width="72" height="208" rx="8" ${a}/>`,
    box: { x1: 64, x2: 136, y1: 92, y2: 300 },
    neck: { x: 88, y: 74, w: 24, h: 20 },
    label: { x: 72, y: 170, w: 56, h: 74 },
    cap: (f, s) => `<rect x="80" y="10" width="40" height="66" rx="3" fill="${f}" stroke="${s}" stroke-width="1"/>`,
  },
  prism: {
    body: (a) => `<polygon points="62,110 138,110 172,148 172,262 138,300 62,300 28,262 28,148" ${a}/>`,
    box: { x1: 28, x2: 172, y1: 110, y2: 300 },
    neck: { x: 84, y: 90, w: 32, h: 22 },
    label: { x: 60, y: 180, w: 80, h: 58 },
    cap: (f, s) => `<polygon points="72,36 128,36 142,63 128,92 72,92 58,63" fill="${f}" stroke="${s}" stroke-width="1"/>`,
  },
};

function svgOpen(viewBox, attrs = "") {
  return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" ${attrs}>`;
}

/**
 * opts: shape, cap, notes, label, labelFont, size, animate, attrs
 */
function renderBottle(opts = {}) {
  const id = "b" + uid();
  const g = BOTTLE_GEOM[opts.shape] || BOTTLE_GEOM.classic;
  const cap = byId(CAPS, opts.cap) || CAPS[0];
  const hasNotes = opts.notes && Object.values(opts.notes).some((v) => v > 0);
  const blend = hasNotes ? blendColor(opts.notes) : "#efe4d2";
  const tc = hasNotes ? tierColors(opts.notes) : {};
  const cTop = tc.top || blend, cMid = tc.mid || blend, cBase = tc.base || blend;
  const level = { 30: 0.6, 50: 0.72, 100: 0.84 }[opts.size || 50] || 0.72;
  const { x1, x2, y1, y2 } = g.box;
  const ly = y2 - (y2 - y1) * level;
  const anim = opts.animate !== false;
  const fontCss = (byId(LABEL_FONTS, opts.labelFont) || LABEL_FONTS[0]).css;
  const label = (opts.label || "").slice(0, 18);
  const L = g.label;
  const fs = Math.min(opts.labelFont === "hand" ? 15 : 11, (L.w - 10) / Math.max(1, label.length * (opts.labelFont === "hand" ? 0.42 : 0.5)));

  const capFill = cap.glass ? `url(#${id}cg)` : `url(#${id}cm)`;
  const capStroke = cap.glass ? "rgba(140,160,175,.7)" : "rgba(0,0,0,.25)";

  return `${svgOpen("0 0 200 320", opts.attrs || "")}
    <defs>
      <clipPath id="${id}c">${g.body("")}</clipPath>
      <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${shade(cTop, 0.15)}"/>
        <stop offset=".45" stop-color="${cMid}"/>
        <stop offset="1" stop-color="${shade(cBase, -0.12)}"/>
      </linearGradient>
      <linearGradient id="${id}gl" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity=".55"/>
        <stop offset=".18" stop-color="#fff" stop-opacity=".08"/>
        <stop offset=".8" stop-color="#fff" stop-opacity="0"/>
        <stop offset="1" stop-color="#fff" stop-opacity=".3"/>
      </linearGradient>
      <linearGradient id="${id}cm" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${shade(cap.color, -0.25)}"/>
        <stop offset=".35" stop-color="${cap.hi}"/>
        <stop offset=".6" stop-color="${cap.color}"/>
        <stop offset="1" stop-color="${shade(cap.color, -0.35)}"/>
      </linearGradient>
      <linearGradient id="${id}cg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".95"/>
        <stop offset=".5" stop-color="#cfe0ea" stop-opacity=".55"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity=".85"/>
      </linearGradient>
      <radialGradient id="${id}sh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="100" cy="306" rx="${(x2 - x1) / 1.7}" ry="9" fill="url(#${id}sh)"/>
    <g clip-path="url(#${id}c)">
      ${g.body('fill="rgba(255,255,255,.22)"')}
      <g style="transition:all .6s">
        <rect x="0" y="${ly}" width="200" height="${320 - ly}" fill="url(#${id}l)" opacity="${hasNotes ? 0.92 : 0.45}"/>
        <path d="M0,8 Q25,0 50,8 T100,8 T150,8 T200,8 T250,8 T300,8 T350,8 T400,8 V20 H0 Z" fill="${shade(cTop, 0.25)}" opacity=".9" transform="translate(0 ${ly - 8})">
          ${anim ? `<animateTransform attributeName="transform" type="translate" from="0 ${ly - 8}" to="-100 ${ly - 8}" dur="3.2s" repeatCount="indefinite"/>` : ""}
        </path>
        ${hasNotes && anim ? [0, 1, 2, 3].map((i) => `<circle cx="${x1 + 20 + i * ((x2 - x1 - 40) / 3)}" cy="${y2 - 6}" r="${1.5 + (i % 2)}" fill="#fff" opacity=".6"><animate attributeName="cy" from="${y2 - 6}" to="${ly + 4}" dur="${3 + i * 0.7}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;.5;0" dur="${3 + i * 0.7}s" repeatCount="indefinite"/></circle>`).join("") : ""}
      </g>
      ${g.body(`fill="url(#${id}gl)"`)}
    </g>
    ${g.body('fill="none" stroke="rgba(120,110,100,.45)" stroke-width="1.4"')}
    <rect x="${g.neck.x}" y="${g.neck.y}" width="${g.neck.w}" height="${g.neck.h}" fill="rgba(255,255,255,.35)" stroke="rgba(120,110,100,.45)" stroke-width="1.2"/>
    ${g.cap(capFill, capStroke)}
    ${cap.glass ? `<path d="M100 ${g.neck.y - 4} L100 ${g.neck.y - 40}" stroke="#fff" stroke-opacity=".6"/>` : ""}
    ${label ? `
      <rect x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" fill="#fbf8f2" fill-opacity=".92" stroke="#c9b48e" stroke-width=".6"/>
      <rect x="${L.x + 3}" y="${L.y + 3}" width="${L.w - 6}" height="${L.h - 6}" fill="none" stroke="#c9b48e" stroke-width=".4"/>
      <text x="100" y="${L.y + L.h / 2 - 2}" text-anchor="middle" font-family="${fontCss}" font-size="${fs}" fill="#2a241d" letter-spacing="${opts.labelFont === "hand" ? 0 : 1}">${esc(label)}</text>
      <text x="100" y="${L.y + L.h - 10}" text-anchor="middle" font-family="Noto Sans KR, sans-serif" font-size="4.6" fill="#8a7a62" letter-spacing="1.4">SCENT LAB · ${opts.size || 50} ML</text>` : ""}
  </svg>`;
}

const BOX_COLORS = { none: "#d8c4a2", signature: "#f1ece4", wood: "#b07a4a", velvet: "#5b1f2b" };

/** opts: wrap, ribbon, box, tag (string), attrs */
function renderGiftBox(opts = {}) {
  const id = "g" + uid();
  const wrap = byId(WRAPS, opts.wrap);
  const fill = wrap?.color || BOX_COLORS[opts.box || "none"] || BOX_COLORS.none;
  const rib = opts.wrap && opts.wrap !== "none" ? byId(RIBBONS, opts.ribbon)?.color : opts.box === "signature" ? "#111" : null;
  const dark = hexToRgb(fill).reduce((a, b) => a + b) < 300;
  return `${svgOpen("0 0 240 240", opts.attrs || "")}
    <defs>
      <linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(fill, 0.12)}"/><stop offset="1" stop-color="${shade(fill, -0.12)}"/></linearGradient>
      <radialGradient id="${id}sh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      ${opts.wrap && opts.wrap !== "none" ? `<pattern id="${id}p" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="1" fill="${dark ? "#fff" : "#000"}" opacity=".08"/></pattern>` : ""}
    </defs>
    <ellipse cx="120" cy="214" rx="96" ry="10" fill="url(#${id}sh)"/>
    <rect x="34" y="96" width="172" height="114" fill="url(#${id}f)"/>
    ${opts.wrap && opts.wrap !== "none" ? `<rect x="34" y="96" width="172" height="114" fill="url(#${id}p)"/>` : ""}
    ${opts.box === "wood" && (!opts.wrap || opts.wrap === "none") ? [0, 1, 2, 3, 4].map((i) => `<path d="M34 ${110 + i * 22} Q120 ${104 + i * 22} 206 ${112 + i * 22}" stroke="#8a5a32" stroke-opacity=".35" fill="none"/>`).join("") : ""}
    <rect x="26" y="74" width="188" height="30" fill="${shade(fill, 0.05)}"/>
    <rect x="26" y="100" width="188" height="4" fill="#000" opacity=".08"/>
    ${rib ? `
      <rect x="112" y="74" width="16" height="136" fill="${rib}"/>
      <rect x="26" y="84" width="188" height="10" fill="${rib}" opacity=".95"/>
      <path d="M120 74 C 92 40, 62 52, 80 72 C 90 82, 108 78, 120 74 Z" fill="${rib}"/>
      <path d="M120 74 C 148 40, 178 52, 160 72 C 150 82, 132 78, 120 74 Z" fill="${rib}"/>
      <path d="M118 76 L104 112 L112 108 L116 116 Z" fill="${shade(rib, -0.2)}"/>
      <path d="M122 76 L136 112 L128 108 L124 116 Z" fill="${shade(rib, -0.2)}"/>
      <ellipse cx="120" cy="74" rx="9" ry="7" fill="${shade(rib, -0.1)}"/>` : ""}
    ${!rib ? `<text x="120" y="160" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="13" letter-spacing="4" fill="${dark ? "#e9dcc6" : "#3a2f24"}" opacity=".8">SCENT LAB</text>` : ""}
    ${opts.tag ? `<g transform="rotate(-8 180 180)"><rect x="150" y="150" width="70" height="40" fill="#fbf7f0" stroke="#d8c8ad"/><text x="185" y="175" text-anchor="middle" font-family="Nanum Pen Script, cursive" font-size="14" fill="#3b3127">${esc(opts.tag.slice(0, 8))}</text></g>` : ""}
  </svg>`;
}

/** accessory icons; color = optional liquid / wax tint */
function renderAccessory(kind, color = "#d8c3a0", attrs = "") {
  const id = "a" + uid();
  const glass = 'fill="rgba(255,255,255,.3)" stroke="rgba(120,110,100,.5)" stroke-width="1.3"';
  const sh = `<ellipse cx="100" cy="246" rx="62" ry="7" fill="#000" opacity=".12"/>`;
  const art = {
    rollon: `${sh}<rect x="80" y="70" width="40" height="172" rx="10" ${glass}/><rect x="83" y="130" width="34" height="108" rx="8" fill="${color}" opacity=".85"/><rect x="78" y="22" width="44" height="54" rx="6" fill="#b48f52"/><rect x="88" y="24" width="6" height="50" fill="#f2dca6" opacity=".6"/>`,
    atomizer: `${sh}<rect x="70" y="64" width="60" height="178" rx="8" fill="#6b4a33"/><rect x="74" y="68" width="52" height="170" rx="6" fill="none" stroke="#c9a978" stroke-dasharray="3 3"/><rect x="86" y="40" width="28" height="28" rx="3" fill="#c0c3c7"/><rect x="94" y="28" width="12" height="14" fill="#8a8d91"/><text x="100" y="160" text-anchor="middle" font-family="Cormorant Garamond" font-size="11" fill="#e8d6b8" letter-spacing="2" transform="rotate(-90 100 160)">TRAVEL</text>`,
    discovery: `${sh}<rect x="22" y="150" width="156" height="92" fill="#1d1c1b"/><rect x="22" y="150" width="156" height="14" fill="#2c2a28"/>${[0, 1, 2, 3, 4, 5].map((i) => { const c = NOTES[(i * 3) % NOTES.length].color; return `<rect x="${32 + i * 24}" y="96" width="16" height="70" rx="3" ${glass}/><rect x="${34 + i * 24}" y="122" width="12" height="42" rx="2" fill="${c}"/><rect x="${32 + i * 24}" y="86" width="16" height="12" fill="#111"/>`; }).join("")}<text x="100" y="210" text-anchor="middle" font-family="Cormorant Garamond" font-size="12" letter-spacing="4" fill="#d8c3a0">DISCOVERY</text>`,
    pouch: `${sh}<path d="M50 96 Q46 240 100 244 Q154 240 150 96 Z" fill="#5b1f2b"/><path d="M50 96 Q100 84 150 96 L146 112 Q100 102 54 112 Z" fill="#7a2a3a"/><path d="M60 104 Q100 120 140 104" stroke="#c9a978" stroke-width="2" fill="none"/><path d="M98 112 L88 150 M102 112 L114 148" stroke="#c9a978" stroke-width="2"/><circle cx="88" cy="152" r="4" fill="#c9a978"/><circle cx="114" cy="150" r="4" fill="#c9a978"/><text x="100" y="200" text-anchor="middle" font-family="Cormorant Garamond" font-size="22" fill="#c9a978">S·L</text>`,
    candle: `${sh}<defs><radialGradient id="${id}f" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#fff6c9"/><stop offset=".5" stop-color="#ffc34d"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient></defs><rect x="46" y="110" width="108" height="132" rx="10" ${glass}/><rect x="50" y="128" width="100" height="110" rx="8" fill="${color}" opacity=".9"/><rect x="62" y="166" width="76" height="40" fill="#fbf8f2"/><text x="100" y="191" text-anchor="middle" font-family="Cormorant Garamond" font-size="11" letter-spacing="2" fill="#3a2f24">SCENT LAB</text><line x1="100" y1="128" x2="100" y2="112" stroke="#333" stroke-width="2"/><ellipse cx="100" cy="94" rx="10" ry="22" fill="url(#${id}f)"><animate attributeName="ry" values="22;19;23;20;22" dur="1.6s" repeatCount="indefinite"/><animate attributeName="rx" values="10;8.5;10.5;9;10" dur="1.3s" repeatCount="indefinite"/></ellipse>`,
    diffuser: `${sh}<path d="M58 136 Q58 120 76 116 L88 112 L88 96 L112 96 L112 112 L124 116 Q142 120 142 136 L142 236 Q142 244 134 244 L66 244 Q58 244 58 236 Z" ${glass}/><path d="M60 160 L140 160 L140 236 Q140 242 134 242 L66 242 Q60 242 60 236 Z" fill="${color}" opacity=".8"/><rect x="86" y="88" width="28" height="10" fill="#1b1b1b"/>${[-30, -16, -4, 8, 20, 34].map((a) => `<line x1="100" y1="96" x2="${100 + Math.sin(a * Math.PI / 180) * 90}" y2="${96 - Math.cos(a * Math.PI / 180) * 90}" stroke="#7a5a3a" stroke-width="2.2" stroke-linecap="round"/>`).join("")}`,
  };
  return `${svgOpen("0 0 200 260", attrs)}${art[kind] || art.rollon}</svg>`;
}
