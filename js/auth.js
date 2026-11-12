/* ============ SCENT LAB — membership (Supabase Auth) & server sync ============
   - Each member's cart, wishlist, orders, recipes, anniversaries and alerts live in
     public.user_store (one row per key) and are cached in localStorage under sl_<userId>:<key>.
   - Row level security on the server means a member can only ever read/write their own rows.
*/
const SYNC_KEYS = ["cart", "wish", "orders", "recipes", "annivs", "notiLog", "profile", "demoOffset", "seeded", "quizResult"];

const sb = window.supabase && typeof SUPABASE_URL !== "undefined"
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      global: {
        // keepalive lets a save finish even if the page navigates right after (body must stay < 64KB)
        fetch: (url, opts = {}) => fetch(url, { ...opts, keepalive: !opts.body || (typeof opts.body === "string" && opts.body.length < 60000) }),
      },
    })
  : null;

/* ---------- push / pull ---------- */
window.syncPush = function (key, value) {
  const u = currentUser();
  if (!u || !sb || !SYNC_KEYS.includes(key)) return;
  sb.from("user_store")
    .upsert({ user_id: u.id, key, value, updated_at: new Date().toISOString() })
    .then(({ error }) => { if (error) console.warn("sync failed", key, error.message); });
};
window.syncRemove = function (key) {
  const u = currentUser();
  if (!u || !sb || !SYNC_KEYS.includes(key)) return;
  sb.from("user_store").delete().eq("user_id", u.id).eq("key", key)
    .then(({ error }) => { if (error) console.warn("delete failed", key, error.message); });
};

/* pull every saved key from the server into this browser's cache. returns true if anything changed */
async function syncPull(user) {
  const { data, error } = await sb.from("user_store").select("key, value");
  if (error) { console.warn("pull failed", error.message); return false; }
  let changed = false;
  const remote = new Set();
  data.forEach(({ key, value }) => {
    remote.add(key);
    const k = nsKey(key, user);
    const json = JSON.stringify(value);
    if (localStorage.getItem(k) !== json) { localStorage.setItem(k, json); changed = true; }
  });
  // anything only cached locally (e.g. made while offline) goes up to the server
  SYNC_KEYS.filter((k) => !remote.has(k)).forEach((k) => {
    const v = localStorage.getItem(nsKey(k, user));
    if (v !== null) window.syncPush(k, JSON.parse(v));
  });
  return changed;
}

/* bring a guest's cart & wishlist along when they sign in */
function mergeGuestData() {
  const read = (k) => { try { return JSON.parse(localStorage.getItem("sl_" + k)) || []; } catch (e) { return []; } };
  const gCart = read("cart"), gWish = read("wish");
  if (gCart.length) store.set("cart", [...store.get("cart", []), ...gCart]);
  if (gWish.length) store.set("wish", [...new Set([...store.get("wish", []), ...gWish])]);
  localStorage.removeItem("sl_cart");
  localStorage.removeItem("sl_wish");
  return gCart.length;
}

/* ---------- auth actions ---------- */
function setUser(session, extra = {}) {
  const u = { id: session.user.id, email: session.user.email, name: session.user.user_metadata?.name || "", ...extra };
  localStorage.setItem("sl_currentUser", JSON.stringify(u));
  try { sessionStorage.setItem("sl_synced_" + u.id, "1"); } catch (e) { /* ignore */ }
  return u;
}
async function afterSignIn(session) {
  const u = setUser(session);
  await syncPull(u);
  // make sure the alert profile has the account's email & name
  const p = store.get("profile", null);
  const meta = session.user.user_metadata || {};
  if (!p) store.set("profile", { name: meta.name || "", email: u.email, phone: meta.phone || "", birthday: meta.birthday || "", channels: ["email", "sms"] });
  else if (!p.email) store.set("profile", { ...p, email: u.email });
  return { user: u, merged: mergeGuestData() };
}

async function signUp({ name, email, password, phone, birthday }) {
  if (!sb) throw new Error("서버에 연결할 수 없어요. 인터넷 연결을 확인해 주세요.");
  const { data, error } = await sb.auth.signUp({
    email, password,
    options: {
      data: { name, phone, birthday },
      emailRedirectTo: location.protocol.startsWith("http") ? location.origin + location.pathname.replace(/[^/]*$/, "") + "login.html" : undefined,
    },
  });
  if (error) throw error;
  if (!data.session) return { needsConfirm: true };
  const res = await afterSignIn(data.session);
  store.set("profile", { name, email, phone: phone || "", birthday: birthday || "", channels: ["email", "sms"] });
  return res;
}
async function signIn(email, password) {
  if (!sb) throw new Error("서버에 연결할 수 없어요. 인터넷 연결을 확인해 주세요.");
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return afterSignIn(data.session);
}
window.logout = async function () {
  try { await sb?.auth.signOut(); } catch (e) { /* ignore */ }
  localStorage.removeItem("sl_currentUser");
  location.href = "index.html";
};

/* save name / phone / birthday to the profiles table too (the member list in the dashboard) */
async function saveProfileRow(p) {
  const u = currentUser();
  if (!u || !sb) return;
  const { error } = await sb.from("profiles").update({ name: p.name || "", phone: p.phone || "", birthday: p.birthday || null, updated_at: new Date().toISOString() }).eq("id", u.id);
  if (error) console.warn("profile save failed", error.message);
  localStorage.setItem("sl_currentUser", JSON.stringify({ ...u, name: p.name || "" }));
}

/* translate common Supabase auth errors */
function authErrorKo(err) {
  const m = (err?.message || "").toLowerCase();
  if (m.includes("invalid login")) return "이메일 또는 비밀번호가 맞지 않아요.";
  if (m.includes("already registered") || m.includes("already been registered")) return "이미 가입된 이메일이에요. 로그인해 주세요.";
  if (m.includes("email not confirmed")) return "메일 인증이 아직 안 됐어요. 받은 메일의 링크를 눌러 주세요.";
  if (m.includes("password") && m.includes("6")) return "비밀번호는 6자 이상이어야 해요.";
  if (m.includes("rate limit")) return "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.";
  if (m.includes("invalid") && m.includes("email")) return "이메일 형식을 확인해 주세요.";
  if (m.includes("failed to fetch")) return "서버에 연결할 수 없어요. 인터넷 연결을 확인해 주세요.";
  return err?.message || "알 수 없는 오류가 발생했어요.";
}

/* ---------- on every page: verify session, refresh data from server once per browser session ---------- */
(async function verify() {
  const u = currentUser();
  if (!u || !sb) return;
  const { data } = await sb.auth.getSession();
  if (!data.session || data.session.user.id !== u.id) {
    localStorage.removeItem("sl_currentUser");
    location.reload();
    return;
  }
  const flag = "sl_synced_" + u.id;
  let synced = false;
  try { synced = sessionStorage.getItem(flag) === "1"; sessionStorage.setItem(flag, "1"); } catch (e) { /* ignore */ }
  if (!synced && (await syncPull(u))) location.reload();
})();
