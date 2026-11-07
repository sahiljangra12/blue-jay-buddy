// Groups: study groups per course and interest groups, for signed-in JHU students only.
// Sign-in uses Netlify Identity (email + password). The server only accepts @jh.edu / @jhu.edu / @jhmi.edu.
(() => {
"use strict";
const App = window.App, { esc, svg, store } = App;
const ID = "/.netlify/identity";
const KINDS = [["study","Study group"],["interest","Interest"],["sports","Sports & fitness"],["food","Food buddies"],["housing","Housing & roommates"],["rides","Rides & travel"],["other","Other"]];
const kindLabel = k => (KINDS.find(x => x[0] === k) || KINDS[6])[1];
const JHU = /@(jh|jhu|jhmi)\.edu$/i;

/* ---------- session ---------- */
let S = store.get("bjb-session", null); // { access_token, refresh_token, expires_at, email }
const saveS = s => { S = s; s ? store.set("bjb-session", s) : store.del("bjb-session"); setCookie(); };
function setCookie(){ document.cookie = S ? `nf_jwt=${S.access_token}; path=/; max-age=3600; secure; samesite=lax` : "nf_jwt=; path=/; max-age=0"; }
async function token(){
  if (!S) return null;
  if (Date.now() < S.expires_at - 60000) return S.access_token;
  try {
    const r = await fetch(ID + "/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "grant_type=refresh_token&refresh_token=" + encodeURIComponent(S.refresh_token) });
    if (!r.ok) throw 0;
    const j = await r.json(); saveS({ ...S, access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + j.expires_in * 1000 }); return S.access_token;
  } catch { saveS(null); return null; }
}
async function gapi(path, opts = {}){
  const t = await token();
  return App.api("/api/groups" + path, Object.assign({}, opts, { headers: Object.assign({ "content-type": "application/json" }, t ? { authorization: "Bearer " + t } : {}, opts.headers || {}) }));
}
App.groupsSignedIn = () => !!S;

// Finish email confirmation / password recovery links that land on the site.
App.afterRender.push(async () => {
  const h = location.hash;
  const m = h.match(/(confirmation_token|recovery_token)=([^&]+)/);
  if (!m) return;
  history.replaceState(null, "", location.pathname + "#campus/groups");
  try {
    const r = await fetch(ID + "/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: m[1] === "recovery_token" ? "recovery" : "signup", token: decodeURIComponent(m[2]) }) });
    if (!r.ok) throw new Error((await r.json()).msg || "Link expired");
    const j = await r.json();
    const u = await (await fetch(ID + "/user", { headers: { authorization: "Bearer " + j.access_token } })).json();
    saveS({ access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + j.expires_in * 1000, email: u.email });
    App.toast(m[1] === "recovery_token" ? "Signed in. Set a new password in Settings." : "Email confirmed. You're in!");
  } catch (e) { App.toast("That link didn't work: " + e.message); }
  App.render();
});

/* ---------- views ---------- */
let cache = { list: null, at: 0, err: "" }, detail = {};
App.groupsView = arg => {
  if (!App.S.hasServer) return App.empty("Groups need the online version", "Open Blue Jay Buddy at its main address to use groups.", "");
  if (!S) return signInView();
  if (arg && !arg.startsWith("EN.") && !arg.startsWith("AS.")) return groupDetail(arg);
  if (!cache.list || Date.now() - cache.at > 30000) { loadList(); return `<p class="note">Loading groups…</p>`; }
  const course = arg || "";
  const codes = [...new Set(App.S.classes.filter(c => c.code).map(c => c.code))];
  const mine = cache.list.filter(g => g.member);
  const filterKind = App.groupKind || "all";
  const shown = cache.list.filter(g => (filterKind === "all" || g.kind === filterKind) && (!course || g.course === course));
  return `
  <div class="toolbar"><span class="note">Signed in as ${esc(S.email)}</span><button class="btn sm primary" type="button" data-new-group="${esc(course)}">${svg("plus")}Start a group</button><button class="btn sm ghost" type="button" data-signout>Sign out</button></div>
  ${cache.err ? `<p class="note bad">${esc(cache.err)}</p>` : ""}
  ${codes.length && !course ? `<h3 class="grp">Study groups for your classes</h3><div class="chips-row">${codes.map(c => {
    const n = cache.list.filter(g => g.course === c).length;
    return `<a class="chip ${n ? "" : "ghost"}" href="#campus/groups/${encodeURIComponent(c)}">${esc(c)} · ${n ? n + " group" + (n > 1 ? "s" : "") : "start one"}</a>`; }).join("")}</div>` : ""}
  ${course ? `<p class="note">Showing study groups for <b>${esc(course)}</b>. <a href="#campus/groups">See all groups</a></p>` : ""}
  ${mine.length && !course ? `<h3 class="grp">Your groups</h3><div class="list">${mine.map(card).join("")}</div>` : ""}
  ${course ? "" : `<div class="seg-filter" role="group" aria-label="Group type">${[["all","All"], ...KINDS].map(([v, l]) => `<button type="button" class="${filterKind === v ? "on" : ""}" data-gkind="${v}">${esc(l)}</button>`).join("")}</div>`}
  <div class="list">${shown.map(card).join("") || App.empty("No groups here yet", "Start the first one. It takes 20 seconds.", `<button class="btn primary" type="button" data-new-group="${esc(course)}">${svg("plus")}Start a group</button>`)}</div>
  <p class="note">Be kind. Don't share personal details publicly. Use Report on anything that breaks the <a href="https://studentaffairs.jhu.edu/policies-guidelines/student-code/" target="_blank" rel="noopener">Student Code of Conduct</a>; 3 reports hide a post or group automatically.</p>`;
};
const card = g => `<a class="item tap" href="#campus/groups/${encodeURIComponent(g.id)}"><div class="item-main"><h3>${esc(g.name)}</h3>
  <p>${esc(kindLabel(g.kind))}${g.course ? " · " + esc(g.course) : ""} · ${g.members} member${g.members === 1 ? "" : "s"}${g.member ? " · joined" : ""}</p>${g.about ? `<p class="pick">${esc(g.about)}</p>` : ""}</div><span class="chev">›</span></a>`;

async function loadList(){
  try { const r = await gapi(""); cache = { list: r.groups, at: Date.now(), err: "" }; }
  catch (e) { if (e.status === 401) saveS(null); cache = { list: [], at: Date.now(), err: e.message }; }
  if (App.route().sub === "groups") App.render();
}
function groupDetail(id){
  const d = detail[id];
  if (!d || Date.now() - d.at > 15000) { loadDetail(id); if (!d) return `<p class="note">Loading…</p>`; }
  const g = d.group;
  return `<a class="back" href="#campus/groups">‹ All groups</a>
  <div class="g-head"><div><span class="eyebrow">${esc(kindLabel(g.kind))}${g.course ? " · " + esc(g.course) : ""}</span><h3 class="h3">${esc(g.name)}</h3>
    <p class="note">${g.members} member${g.members === 1 ? "" : "s"} · started ${App.relTime(g.created)}</p>${g.about ? `<p>${esc(g.about)}</p>` : ""}</div>
    <div class="row">${g.member ? `<button class="btn sm ghost" type="button" data-gleave="${esc(id)}">Leave</button>` : `<button class="btn sm primary" type="button" data-gjoin="${esc(id)}">${svg("plus")}Join</button>`}
    ${g.link && g.member ? `<a class="btn sm soft" href="${esc(g.link)}" target="_blank" rel="noopener">Open group chat ${svg("open")}</a>` : ""}
    <button class="btn sm ghost" type="button" data-greport="${esc(id)}" aria-label="Report group">${svg("flag")}Report</button></div></div>
  ${g.link && !g.member ? `<p class="note">Join to see the group chat link.</p>` : ""}
  ${g.member ? `<form class="post-form" id="postForm" data-g="${esc(id)}"><textarea name="text" rows="2" maxlength="600" placeholder="Post to the group: meeting time, question, plan…" required></textarea><button class="btn primary" type="submit">${svg("send")}Post</button></form>` : ""}
  <ul class="posts">${d.posts.map(p => `<li><div><b>${esc(p.by)}</b><span class="note">${App.relTime(p.at)}</span></div><p>${esc(p.text)}</p>
    <button class="linkbtn" type="button" data-greport="${esc(id)}" data-post="${esc(p.id)}">Report</button></li>`).join("") || `<li class="note">No posts yet.${g.member ? " Say hi!" : ""}</li>`}</ul>`;
}
async function loadDetail(id){
  try { const r = await gapi("/" + encodeURIComponent(id)); detail[id] = Object.assign(r, { at: Date.now() }); }
  catch (e) { detail[id] = { at: Date.now(), group: { name: "Couldn't load this group", kind: "other", members: 0, created: Date.now(), about: e.message }, posts: [] }; }
  if (App.route().arg === id) App.render();
}

function signInView(){
  return `<div class="callout big"><div><b>Find your people</b><p>Study groups for each of your classes, plus groups for sports, food, housing and rides. Only JHU students can join: sign in with your @jh.edu email.</p></div></div>
  <form class="form narrow" id="authForm">
    <label class="field">JHU email<input name="email" type="email" required placeholder="jhed@jh.edu" autocomplete="email"></label>
    <label class="field">Password <span class="note">(new password for Blue Jay Buddy, not your JHED password)</span><input name="password" type="password" minlength="8" required autocomplete="current-password"></label>
    <div class="row"><button class="btn primary" type="submit" name="mode" value="login">Sign in</button><button class="btn soft" type="submit" name="mode" value="signup">Create account</button></div>
    <button class="linkbtn" type="button" data-forgot>Forgot password?</button>
    <p class="status" id="authStatus" role="status"></p>
  </form>`;
}
App.newGroupSheet = course => App.openSheet(`${App.sheetHead("Start a group")}
  <form class="form" id="newGroup">
    <label class="field">Name<input name="name" required maxlength="60" placeholder="${course ? esc(course) + " problem set crew" : "e.g. Sunday volleyball"}"></label>
    <label class="field">Type<select name="kind">${KINDS.map(([v, l]) => `<option value="${v}" ${course && v === "study" ? "selected" : ""}>${l}</option>`).join("")}</select></label>
    <label class="field">Course <span class="note">for study groups</span><select name="course"><option value="">—</option>${[...new Set(App.S.classes.filter(c => c.code).map(c => c.code))].map(c => `<option ${c === course ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></label>
    <label class="field">About <span class="note">optional</span><textarea name="about" rows="2" maxlength="200" placeholder="When you meet, what you're after"></textarea></label>
    <label class="field">Group chat link <span class="note">optional: GroupMe, WhatsApp, Discord. Only members see it.</span><input name="link" type="url" placeholder="https://…"></label>
    <div class="row"><button class="btn primary" type="submit">${svg("check")}Create</button></div>
  </form>`);

/* ---------- events ---------- */
document.addEventListener("submit", async e => {
  const f = e.target;
  if (f.id === "authForm"){
    e.preventDefault();
    const fd = new FormData(f), email = fd.get("email").trim().toLowerCase(), password = fd.get("password"), mode = e.submitter?.value || "login", st = App.$("#authStatus");
    if (!JHU.test(email)) { st.textContent = "Use your Johns Hopkins email (@jh.edu)."; return; }
    st.textContent = mode === "signup" ? "Creating your account…" : "Signing in…";
    try {
      if (mode === "signup"){
        const r = await fetch(ID + "/signup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.msg || j.error_description || (r.status === 404 ? "Sign-up isn't switched on yet." : "Couldn't sign up"));
        st.innerHTML = `Check <b>${esc(email)}</b> for a confirmation email, then tap the link. (Look in Junk too.)`;
        return;
      }
      const r = await fetch(ID + "/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: `grant_type=password&username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}` });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error_description || "Wrong email or password, or email not confirmed yet");
      saveS({ access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + j.expires_in * 1000, email });
      cache.list = null; App.toast("Signed in"); App.render();
    } catch (err) { st.textContent = err.message; }
  }
  if (f.id === "newGroup"){
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(f));
    try { const r = await gapi("", { method: "POST", body: JSON.stringify(fd) }); cache.list = null; App.closeSheet(); App.toast("Group created"); App.go("campus/groups/" + r.id); }
    catch (err) { App.toast(err.message); }
  }
  if (f.id === "postForm"){
    e.preventDefault();
    const id = f.dataset.g, text = new FormData(f).get("text").trim(); if (!text) return;
    try { await gapi("/" + encodeURIComponent(id) + "/posts", { method: "POST", body: JSON.stringify({ text }) }); delete detail[id]; App.render(); }
    catch (err) { App.toast(err.message); }
  }
});
document.addEventListener("click", async e => {
  const t = e.target;
  const ng = t.closest("[data-new-group]"); if (ng) App.newGroupSheet(ng.dataset.newGroup);
  if (t.closest("[data-signout]")) { saveS(null); cache.list = null; App.render(); }
  const gk = t.closest("[data-gkind]"); if (gk){ App.groupKind = gk.dataset.gkind; App.render(); }
  const j = t.closest("[data-gjoin]"), l = t.closest("[data-gleave]");
  if (j || l){ const id = (j || l).dataset[j ? "gjoin" : "gleave"]; try { await gapi("/" + encodeURIComponent(id) + (j ? "/join" : "/leave"), { method: "POST" }); delete detail[id]; cache.list = null; App.render(); } catch (err) { App.toast(err.message); } }
  const rp = t.closest("[data-greport]");
  if (rp && confirm("Report this to the moderators? Three reports hide it automatically.")){ try { await gapi("/" + encodeURIComponent(rp.dataset.greport) + "/report", { method: "POST", body: JSON.stringify({ post: rp.dataset.post || "" }) }); App.toast("Reported. Thank you."); } catch (err) { App.toast(err.message); } }
  if (t.closest("[data-forgot]")){
    const email = App.$("#authForm [name=email]").value.trim();
    if (!JHU.test(email)) { App.$("#authStatus").textContent = "Type your @jh.edu email first."; return; }
    await fetch(ID + "/recover", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    App.$("#authStatus").textContent = "If that account exists, a reset link is on its way.";
  }
});
setCookie();
})();
