/* ============ SCENT LAB — static data ============ */

const FAMILIES = [
  { id: "citrus", ko: "시트러스" },
  { id: "floral", ko: "플로럴" },
  { id: "woody", ko: "우디" },
  { id: "spicy", ko: "스파이시" },
  { id: "musk", ko: "머스크" },
  { id: "fresh", ko: "프레시" },
];

const TIERS = [
  { id: "top", ko: "탑 노트", en: "Top", hint: "첫 15분, 첫인상을 만드는 향" },
  { id: "mid", ko: "미들 노트", en: "Heart", hint: "2~4시간, 향의 중심이 되는 성격" },
  { id: "base", ko: "베이스 노트", en: "Base", hint: "하루 종일 남는 잔향" },
];

const NOTES = [
  // top
  { id: "bergamot", tier: "top", name: "베르가못", en: "Bergamot", color: "#e6c84f", fam: { citrus: 3, fresh: 1 }, desc: "밝고 쌉싸름한 이탈리아 시트러스" },
  { id: "lemon", tier: "top", name: "레몬 제스트", en: "Lemon Zest", color: "#f1df63", fam: { citrus: 3, fresh: 2 }, desc: "막 짜낸 레몬 껍질의 산뜻함" },
  { id: "pinkpepper", tier: "top", name: "핑크 페퍼", en: "Pink Pepper", color: "#d9858a", fam: { spicy: 3, floral: 1 }, desc: "톡 쏘면서도 장밋빛인 스파이스" },
  { id: "greentea", tier: "top", name: "그린 티", en: "Green Tea", color: "#9dbf87", fam: { fresh: 3, floral: 1 }, desc: "차분하고 투명한 찻잎" },
  { id: "seasalt", tier: "top", name: "씨 솔트", en: "Sea Salt", color: "#86b6cb", fam: { fresh: 3, musk: 1 }, desc: "바닷바람과 젖은 돌의 미네랄" },
  { id: "pear", tier: "top", name: "화이트 페어", en: "White Pear", color: "#d2e07f", fam: { fresh: 2, citrus: 1, floral: 1 }, desc: "물기 머금은 서양배의 달콤함" },
  // heart
  { id: "rose", tier: "mid", name: "다마스크 로즈", en: "Damask Rose", color: "#d77d92", fam: { floral: 3, spicy: 1 }, desc: "벨벳처럼 짙은 장미 꽃잎" },
  { id: "jasmine", tier: "mid", name: "자스민", en: "Jasmine Sambac", color: "#efe0ae", fam: { floral: 3, musk: 1 }, desc: "한밤에 피어나는 하얀 꽃" },
  { id: "iris", tier: "mid", name: "아이리스", en: "Orris Butter", color: "#a99bd3", fam: { floral: 2, musk: 2 }, desc: "파우더리하고 우아한 뿌리 향" },
  { id: "lavender", tier: "mid", name: "라벤더", en: "Lavender", color: "#9890d4", fam: { floral: 2, fresh: 2 }, desc: "프로방스의 허브 들판" },
  { id: "fig", tier: "mid", name: "피그 리프", en: "Fig Leaf", color: "#8faa6c", fam: { fresh: 2, woody: 2 }, desc: "그늘진 무화과나무의 초록빛" },
  { id: "cinnamon", tier: "mid", name: "시나몬", en: "Cinnamon Bark", color: "#b96d3f", fam: { spicy: 3, woody: 1 }, desc: "따뜻하게 그을린 나무껍질" },
  // base
  { id: "sandalwood", tier: "base", name: "샌달우드", en: "Sandalwood", color: "#c99c6c", fam: { woody: 3, musk: 1 }, desc: "크리미하고 부드러운 나무" },
  { id: "vetiver", tier: "base", name: "베티버", en: "Vetiver", color: "#7d6c4b", fam: { woody: 3, fresh: 1 }, desc: "흙내음 섞인 스모키 뿌리" },
  { id: "vanilla", tier: "base", name: "바닐라", en: "Bourbon Vanilla", color: "#e8cf9f", fam: { musk: 2, spicy: 1 }, desc: "포근하고 달콤한 크림" },
  { id: "whitemusk", tier: "base", name: "화이트 머스크", en: "White Musk", color: "#ece4dc", fam: { musk: 3, fresh: 1 }, desc: "갓 세탁한 리넨의 살결 향" },
  { id: "amber", tier: "base", name: "앰버", en: "Golden Amber", color: "#d49b3f", fam: { musk: 2, spicy: 2 }, desc: "노을빛 레진의 따스함" },
  { id: "oud", tier: "base", name: "우드", en: "Agarwood Oud", color: "#5d3c2b", fam: { woody: 3, spicy: 2 }, desc: "깊고 신비로운 침향" },
];

const BOTTLES = [
  { id: "classic", name: "클래식", en: "Classic", price: 0, desc: "단정한 직사각 플라콘" },
  { id: "moon", name: "문", en: "Moon", price: 8000, desc: "달처럼 둥근 실루엣" },
  { id: "spire", name: "스파이어", en: "Spire", price: 12000, desc: "길고 가는 우아한 기둥" },
  { id: "prism", name: "프리즘", en: "Prism", price: 18000, desc: "빛을 가르는 팔각 컷 크리스탈" },
];

const CAPS = [
  { id: "black", name: "매트 블랙", price: 0, color: "#1b1b1b", hi: "#4a4a4a" },
  { id: "silver", name: "실버", price: 4000, color: "#b9bcc0", hi: "#f1f2f4" },
  { id: "gold", name: "골드", price: 6000, color: "#b48f52", hi: "#f2dca6" },
  { id: "crystal", name: "크리스탈", price: 15000, color: "#dfe8ee", hi: "#ffffff", glass: true },
];

const SIZES = [
  { id: 30, name: "30ml", price: 59000 },
  { id: 50, name: "50ml", price: 89000 },
  { id: 100, name: "100ml", price: 139000 },
];

const LABEL_FONTS = [
  { id: "serif", name: "세리프", css: "Cormorant Garamond, serif" },
  { id: "hand", name: "손글씨", css: "Nanum Pen Script, cursive" },
  { id: "sans", name: "모던", css: "Noto Sans KR, sans-serif" },
];
const ENGRAVE_PRICE = 5000;

const ACCESSORIES = [
  { id: "rollon", name: "미니 롤온 10ml", price: 19000, desc: "같은 향을 휴대용 롤온으로", icon: "rollon" },
  { id: "atomizer", name: "트래블 아토마이저", price: 12000, desc: "가죽 케이스 리필 스프레이", icon: "atomizer" },
  { id: "discovery", name: "디스커버리 세트", price: 25000, desc: "시그니처 8종 2ml 샘플", icon: "discovery" },
  { id: "pouch", name: "벨벳 파우치", price: 15000, desc: "병을 감싸는 이니셜 파우치", icon: "pouch" },
  { id: "candle", name: "센티드 캔들", price: 32000, desc: "같은 레시피로 만든 캔들 180g", icon: "candle" },
  { id: "diffuser", name: "리드 디퓨저", price: 39000, desc: "공간을 채우는 200ml 디퓨저", icon: "diffuser" },
];

const WRAPS = [
  { id: "none", name: "포장 안 함", price: 0, color: null },
  { id: "ivory", name: "아이보리", price: 3000, color: "#efe6d6" },
  { id: "noir", name: "누아르", price: 3000, color: "#1d1c1b" },
  { id: "blush", name: "블러쉬", price: 3000, color: "#e9c3c0" },
  { id: "sage", name: "세이지", price: 3000, color: "#a9b79c" },
  { id: "navy", name: "미드나잇", price: 3000, color: "#1f2b45" },
];
const RIBBONS = [
  { id: "gold", name: "골드", color: "#c4a064" },
  { id: "black", name: "블랙", color: "#111111" },
  { id: "ivory", name: "아이보리", color: "#f6efe2" },
  { id: "burgundy", name: "버건디", color: "#7a2233" },
];
const BOXES = [
  { id: "none", name: "기본 케이스", price: 0, desc: "종이 슬리브" },
  { id: "signature", name: "시그니처 박스", price: 5000, desc: "자석 여닫이 하드 박스" },
  { id: "wood", name: "우드 박스", price: 15000, desc: "각인 가능한 오크 원목" },
  { id: "velvet", name: "벨벳 케이스", price: 22000, desc: "주얼리 케이스 스타일" },
];
const CARD_PRICE = 2000;

/* ---------- gift finder ---------- */
const RECIPIENTS = [
  { id: "lover", ko: "연인", emoji: "💌" },
  { id: "mom", ko: "엄마", emoji: "🌷" },
  { id: "dad", ko: "아빠", emoji: "🎩" },
  { id: "friend", ko: "친구", emoji: "🥂" },
  { id: "coworker", ko: "동료·상사", emoji: "💼" },
  { id: "me", ko: "나 자신", emoji: "🕯" },
];
const OCCASIONS = [
  { id: "birthday", ko: "생일", emoji: "🎂" },
  { id: "anniversary", ko: "기념일", emoji: "💍" },
  { id: "graduation", ko: "졸업·입학", emoji: "🎓" },
  { id: "promotion", ko: "승진·이직", emoji: "📈" },
  { id: "apology", ko: "화해", emoji: "🤝" },
  { id: "comfort", ko: "위로", emoji: "🫶" },
  { id: "thanks", ko: "감사", emoji: "🙏" },
  { id: "just", ko: "그냥", emoji: "✨" },
];
const MOODS = [
  { id: "clean", ko: "깨끗한" },
  { id: "romantic", ko: "로맨틱한" },
  { id: "deep", ko: "깊고 시크한" },
  { id: "fresh", ko: "상쾌한" },
  { id: "warm", ko: "따뜻한" },
  { id: "calm", ko: "차분한" },
  { id: "sweet", ko: "달콤한" },
  { id: "soft", ko: "부드러운" },
];
const BUDGETS = [
  { id: "b1", ko: "~ 7만원", max: 70000 },
  { id: "b2", ko: "7 ~ 12만원", max: 120000 },
  { id: "b3", ko: "12 ~ 18만원", max: 180000 },
  { id: "b4", ko: "상관없음", max: Infinity },
];

/* default gift styling + card copy per occasion */
const OCCASION_STYLE = {
  birthday: { wrap: "blush", ribbon: "gold", box: "signature", card: "생일 축하해!\n오늘 하루가 이 향처럼\n은은하고 오래 기억되길." },
  anniversary: { wrap: "noir", ribbon: "burgundy", box: "velvet", card: "함께한 모든 날이\n내게는 가장 좋은 향기였어.\n앞으로도 잘 부탁해." },
  graduation: { wrap: "ivory", ribbon: "gold", box: "signature", card: "졸업 축하해!\n새로운 시작에\n너만의 향을 더해 줄게." },
  promotion: { wrap: "navy", ribbon: "gold", box: "wood", card: "승진을 진심으로 축하드립니다.\n늘 멋진 모습, 응원합니다." },
  apology: { wrap: "sage", ribbon: "ivory", box: "signature", card: "그때는 미안했어.\n말로 다 못 한 마음을\n향기로 대신 전해." },
  comfort: { wrap: "ivory", ribbon: "ivory", box: "none", card: "괜찮아, 잘하고 있어.\n지칠 때 이 향을 맡으며\n잠깐 쉬어 가." },
  thanks: { wrap: "sage", ribbon: "gold", box: "signature", card: "늘 고마워요.\n작은 마음이지만\n향기로 전합니다." },
  just: { wrap: "ivory", ribbon: "black", box: "none", card: "그냥, 네 생각이 나서." },
};

/* ---------- products ---------- */
const PRODUCTS = [
  {
    id: "aube", cat: "perfume", name: "Aube Blanche", ko: "오브 블랑슈", sub: "새벽의 흰빛 · 오 드 퍼퓸", price: 89000, badge: "Best",
    notes: { bergamot: 40, pear: 20, jasmine: 60, whitemusk: 70, sandalwood: 20 }, bottle: "classic", cap: "silver",
    tags: { who: ["mom", "friend", "coworker", "me"], occ: ["birthday", "thanks", "just", "graduation"], mood: ["clean", "soft", "calm"] },
    story: "커튼 사이로 스며드는 새벽빛, 갓 다린 흰 셔츠. 누구에게나 잘 어울리는 맑은 살결의 향.",
  },
  {
    id: "velours", cat: "perfume", name: "Velours Rose", ko: "벨루르 로즈", sub: "장미 벨벳 · 오 드 퍼퓸", price: 99000, badge: "New",
    notes: { pinkpepper: 40, rose: 80, jasmine: 20, vanilla: 40, amber: 20 }, bottle: "moon", cap: "gold",
    tags: { who: ["lover", "mom"], occ: ["anniversary", "birthday", "apology"], mood: ["romantic", "sweet", "warm"] },
    story: "붉은 벨벳 위에 흩어진 장미 꽃잎. 고백하고 싶은 날을 위한 가장 로맨틱한 한 병.",
  },
  {
    id: "noirsantal", cat: "perfume", name: "Noir Santal", ko: "누아르 상탈", sub: "검은 백단 · 퍼퓸", price: 129000,
    notes: { bergamot: 30, iris: 30, cinnamon: 20, sandalwood: 70, oud: 40 }, bottle: "prism", cap: "black",
    tags: { who: ["dad", "lover", "coworker"], occ: ["promotion", "anniversary", "birthday"], mood: ["deep", "warm"] },
    story: "늦은 밤 서재의 가죽 의자와 타오르는 나무. 묵직하고 시크한 잔향을 남깁니다.",
  },
  {
    id: "seldemer", cat: "perfume", name: "Sel de Mer", ko: "셀 드 메르", sub: "바다의 소금 · 오 드 뚜왈렛", price: 79000,
    notes: { seasalt: 70, lemon: 20, lavender: 40, vetiver: 40, whitemusk: 20 }, bottle: "spire", cap: "silver",
    tags: { who: ["friend", "dad", "me", "coworker"], occ: ["graduation", "just", "comfort", "promotion"], mood: ["fresh", "clean", "calm"] },
    story: "파도가 부서지는 절벽 위의 바람. 머리를 맑게 깨우는 시원한 미네랄 향.",
  },
  {
    id: "figue", cat: "perfume", name: "Jardin de Figue", ko: "자르댕 드 피그", sub: "무화과 정원 · 오 드 퍼퓸", price: 92000, badge: "Best",
    notes: { pear: 40, greentea: 20, fig: 80, whitemusk: 30, sandalwood: 20 }, bottle: "classic", cap: "gold",
    tags: { who: ["friend", "me", "coworker", "mom"], occ: ["graduation", "just", "thanks", "comfort"], mood: ["calm", "fresh", "soft"] },
    story: "여름 오후 무화과나무 그늘 아래. 초록 잎과 달콤한 과육이 어우러진 정원.",
  },
  {
    id: "ambrenuit", cat: "perfume", name: "Ambre Nuit", ko: "앙브르 뉘", sub: "밤의 호박 · 퍼퓸", price: 119000, badge: "Limited",
    notes: { pinkpepper: 30, cinnamon: 50, rose: 20, amber: 70, vanilla: 40 }, bottle: "moon", cap: "black",
    tags: { who: ["lover", "dad", "me"], occ: ["anniversary", "comfort", "birthday"], mood: ["warm", "deep", "sweet"] },
    story: "벽난로 앞 담요 속의 온기. 겨울밤처럼 깊고 달콤하게 감싸 안는 앰버.",
  },
  {
    id: "thevert", cat: "perfume", name: "Thé Vert Lumière", ko: "떼 베르 뤼미에르", sub: "빛의 녹차 · 오 드 뚜왈렛", price: 75000,
    notes: { greentea: 70, bergamot: 30, jasmine: 40, whitemusk: 50 }, bottle: "spire", cap: "crystal",
    tags: { who: ["mom", "coworker", "me", "friend"], occ: ["comfort", "thanks", "promotion", "just"], mood: ["calm", "clean", "fresh"] },
    story: "아침 햇살이 드는 다실의 첫 잔. 마음을 가라앉히는 고요한 향.",
  },
  {
    id: "irispoudre", cat: "perfume", name: "Iris Poudré", ko: "이리스 뿌드레", sub: "분 바른 아이리스 · 오 드 퍼퓸", price: 109000,
    notes: { lemon: 20, iris: 80, rose: 20, sandalwood: 30, vanilla: 40 }, bottle: "prism", cap: "gold",
    tags: { who: ["mom", "lover", "friend"], occ: ["birthday", "graduation", "anniversary", "thanks"], mood: ["soft", "romantic", "sweet"] },
    story: "할머니의 화장대와 실크 스카프. 우아하고 포근한 파우더리 플로럴.",
  },
  // accessories
  { id: "acc-rollon", cat: "accessory", acc: "rollon", name: "Mini Roll-on", ko: "미니 롤온", sub: "10ml · 시그니처 8종 중 선택", price: 19000,
    tags: { who: ["friend", "coworker", "me"], occ: ["thanks", "just"], mood: ["clean"] }, story: "주머니에 쏙, 언제든 덧바르는 휴대용 향." },
  { id: "acc-candle", cat: "accessory", acc: "candle", name: "Scented Candle", ko: "센티드 캔들", sub: "180g · 소이 왁스", price: 32000, badge: "Best",
    tags: { who: ["mom", "friend", "coworker", "me"], occ: ["thanks", "comfort", "just", "birthday"], mood: ["warm", "calm"] }, story: "약 45시간 타오르는 소이 캔들. 시그니처 향으로 공간을 채웁니다." },
  { id: "acc-diffuser", cat: "accessory", acc: "diffuser", name: "Reed Diffuser", ko: "리드 디퓨저", sub: "200ml · 라탄 스틱 포함", price: 39000,
    tags: { who: ["mom", "coworker", "friend"], occ: ["promotion", "thanks", "graduation"], mood: ["calm", "clean"] }, story: "새 집, 새 사무실을 위한 은은한 공간의 향." },
  { id: "acc-discovery", cat: "accessory", acc: "discovery", name: "Discovery Set", ko: "디스커버리 세트", sub: "2ml × 8종", price: 25000,
    tags: { who: ["friend", "me", "lover"], occ: ["just", "birthday"], mood: ["fresh", "sweet"] }, story: "나에게 맞는 향을 찾는 가장 쉬운 방법." },
  { id: "acc-pouch", cat: "accessory", acc: "pouch", name: "Velvet Pouch", ko: "벨벳 파우치", sub: "이니셜 자수 무료", price: 15000,
    tags: { who: ["lover", "friend"], occ: ["just", "birthday"], mood: ["soft"] }, story: "향수를 안전하게, 그리고 아름답게." },
  // sets
  { id: "set-duo", cat: "set", name: "Duo for Two", ko: "커플 듀오 세트", sub: "30ml × 2 · 벨벳 케이스", price: 139000, badge: "Gift",
    notes: { rose: 50, sandalwood: 50, pinkpepper: 20 }, bottle: "moon", cap: "gold", wrap: "noir", ribbon: "burgundy",
    tags: { who: ["lover"], occ: ["anniversary", "birthday"], mood: ["romantic", "warm"] }, story: "서로 다른 두 향이 레이어링되면 하나의 이야기가 됩니다." },
  { id: "set-bday", cat: "set", name: "Birthday Box", ko: "버스데이 박스", sub: "50ml + 캔들 + 손편지 카드", price: 129000, badge: "Gift",
    notes: { bergamot: 30, jasmine: 50, vanilla: 40 }, bottle: "classic", cap: "gold", wrap: "blush", ribbon: "gold",
    tags: { who: ["mom", "friend", "lover"], occ: ["birthday"], mood: ["sweet", "soft"] }, story: "생일에 필요한 모든 것을 한 상자에." },
  { id: "set-home", cat: "set", name: "Maison Set", ko: "메종 홈 세트", sub: "디퓨저 + 캔들", price: 65000, badge: "Gift",
    notes: { fig: 50, whitemusk: 50 }, bottle: "classic", cap: "silver", wrap: "sage", ribbon: "ivory",
    tags: { who: ["mom", "coworker", "friend"], occ: ["promotion", "thanks", "graduation"], mood: ["calm", "clean"] }, story: "집들이와 새 출발을 위한 공간의 향 세트." },
];

const REVIEWS = [
  { who: "민*지", stars: 5, text: "엄마 생일에 선물했는데 라벨에 이름 새긴 걸 보시고 우셨어요. 포장도 너무 고급스러워요.", product: "aube" },
  { who: "J***", stars: 5, text: "직접 비율을 조절하니 정말 제 향이 생긴 기분. 액체 색이 바뀌는 게 너무 신기해요.", product: "custom" },
  { who: "서*운", stars: 4, text: "누아르 상탈 잔향이 하루 종일 가요. 남자친구가 엄청 좋아했어요.", product: "noirsantal" },
  { who: "이*호", stars: 5, text: "기념일 알림 문자 덕분에 결혼기념일 안 까먹었습니다… 살았다.", product: "custom" },
  { who: "k**", stars: 5, text: "떼 베르는 사무실용으로 최고. 향이 과하지 않고 차분해요.", product: "thevert" },
  { who: "윤*아", stars: 4, text: "벨루르 로즈 병이 동그래서 화장대에 두기만 해도 예뻐요.", product: "velours" },
];

/* ---------- quiz ---------- */
const QUIZ = [
  { q: "완벽한 주말 아침, 당신은 어디에 있나요?", a: [
    { t: "햇살 가득한 테라스 카페", e: "☀️", f: { citrus: 2, fresh: 1 } },
    { t: "꽃시장 골목을 산책 중", e: "💐", f: { floral: 3 } },
    { t: "오래된 서점의 구석 자리", e: "📚", f: { woody: 3 } },
    { t: "아직 포근한 이불 속", e: "🛏", f: { musk: 3 } },
  ] },
  { q: "가장 끌리는 색 조합은?", a: [
    { t: "레몬 옐로 & 화이트", e: "🍋", f: { citrus: 3 } },
    { t: "로즈 핑크 & 골드", e: "🌹", f: { floral: 2, spicy: 1 } },
    { t: "올리브 & 브라운", e: "🌿", f: { woody: 2, fresh: 1 } },
    { t: "버건디 & 블랙", e: "🍷", f: { spicy: 3 } },
  ] },
  { q: "여행을 간다면?", a: [
    { t: "지중해의 작은 섬", e: "🏝", f: { fresh: 2, citrus: 1 } },
    { t: "교토의 정원과 다도", e: "🍵", f: { fresh: 2, woody: 1 } },
    { t: "마라케시의 향신료 시장", e: "🕌", f: { spicy: 3 } },
    { t: "파리의 오래된 아파트", e: "🗼", f: { floral: 2, musk: 1 } },
  ] },
  { q: "친구들이 말하는 당신의 첫인상은?", a: [
    { t: "밝고 에너지 넘침", e: "⚡️", f: { citrus: 3 } },
    { t: "다정하고 포근함", e: "🧸", f: { musk: 2, floral: 1 } },
    { t: "신비롭고 시크함", e: "🖤", f: { woody: 2, spicy: 1 } },
    { t: "자유롭고 쿨함", e: "🌊", f: { fresh: 3 } },
  ] },
  { q: "좋아하는 디저트는?", a: [
    { t: "레몬 마들렌", e: "🧁", f: { citrus: 2, musk: 1 } },
    { t: "바닐라 크렘 브륄레", e: "🍮", f: { musk: 3 } },
    { t: "시나몬 롤", e: "🥐", f: { spicy: 2, woody: 1 } },
    { t: "말차 아이스크림", e: "🍵", f: { fresh: 3 } },
  ] },
  { q: "향수를 뿌리는 이유는?", a: [
    { t: "기분 전환", e: "🎈", f: { citrus: 2, fresh: 1 } },
    { t: "나를 기억하게 하려고", e: "💋", f: { spicy: 2, floral: 1 } },
    { t: "나만 아는 편안함", e: "🫧", f: { musk: 2, woody: 1 } },
    { t: "특별한 날의 의식", e: "🥂", f: { floral: 3 } },
  ] },
  { q: "하루의 마무리로 가장 좋은 것은?", a: [
    { t: "와인 한 잔과 재즈", e: "🎷", f: { spicy: 1, woody: 2 } },
    { t: "따뜻한 욕조와 캔들", e: "🛁", f: { musk: 2, floral: 1 } },
    { t: "밤 산책과 선선한 바람", e: "🌙", f: { fresh: 2, citrus: 1 } },
    { t: "꽃 한 송이를 꽂은 식탁", e: "🌼", f: { floral: 3 } },
  ] },
];

const QUIZ_RESULTS = {
  citrus: { title: "The Sunlit", ko: "햇살 같은 낙천가", desc: "당신이 들어서면 공기가 밝아져요. 생기 있고 투명한 시트러스가 당신의 에너지를 닮았습니다.", product: "seldemer",
    notes: { bergamot: 60, lemon: 40, greentea: 20, jasmine: 30, whitemusk: 40 } },
  floral: { title: "The Romantic", ko: "낭만을 아는 사람", desc: "섬세하고 다정한 감성의 소유자. 꽃잎처럼 부드럽게 기억에 남는 향이 어울려요.", product: "velours",
    notes: { pear: 30, rose: 60, jasmine: 40, iris: 20, whitemusk: 40 } },
  woody: { title: "The Quiet Mind", ko: "고요한 지성", desc: "말보다 깊이로 이야기하는 사람. 나무와 흙의 차분한 잔향이 당신을 완성합니다.", product: "noirsantal",
    notes: { bergamot: 30, fig: 40, iris: 20, sandalwood: 60, vetiver: 40 } },
  spicy: { title: "The Bold", ko: "대담한 존재감", desc: "한 번 보면 잊히지 않는 사람. 따뜻하고 관능적인 스파이스가 당신의 무기예요.", product: "ambrenuit",
    notes: { pinkpepper: 50, cinnamon: 50, rose: 20, amber: 50, oud: 30 } },
  musk: { title: "The Tender", ko: "포근한 위로", desc: "곁에 있으면 편안해지는 사람. 살결 같은 머스크와 바닐라가 잘 어울립니다.", product: "aube",
    notes: { pear: 30, iris: 40, jasmine: 20, whitemusk: 60, vanilla: 40 } },
  fresh: { title: "The Free Spirit", ko: "자유로운 바람", desc: "어디로든 떠날 수 있는 가벼운 마음. 바다와 초록의 청량함이 당신을 닮았어요.", product: "figue",
    notes: { seasalt: 50, greentea: 30, lavender: 30, fig: 30, vetiver: 30 } },
};

const NAME_PARTS = {
  a: ["Velvet", "Silent", "Golden", "Midnight", "Morning", "Wild", "Secret", "Lunar", "Soft", "Hidden", "Little", "Endless"],
  b: ["Garden", "Letter", "Bloom", "Harbor", "Memory", "Promise", "Hour", "Dune", "Whisper", "Atlas", "Muse", "Ember"],
};
