// Ask: voice or typed questions. Common questions are answered instantly on the device from the
// student's own schedule, deadlines, budget and campus data. Anything else goes to an AI model
// on the server with a short summary of the student's day.
(() => {
"use strict";
const App = window.App, { esc, svg, fmt, mins, DAY, money, store } = App;
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let chat = store.get("bjb-chat", []);
let speak = store.get("bjb-speak", true);
let listening = false, rec = null;

const SUGGEST = ["What's my plan for today?","Where is my next class?","What's due this week?","Is the gym open?","Cheap veg food near me under $10","How much budget do I have left?","How do I get to Penn Station?","What core courses do I still need?","Any student discounts on food delivery?","I lost my J-Card"];

App.views.ask = () => {
  if (App.pendingAsk) setTimeout(() => { const q = App.pendingAsk; App.pendingAsk = null; ask(q); }, 50);
  return `<section class="page ask">
  ${App.head("Ask Blue Jay Buddy", "Tap the mic and ask anything about your day, classes, food or campus.")}
  <div class="chat" id="chat" aria-live="polite">${chat.length ? chat.map(bubble).join("") : `<div class="hello"><p>Try one of these:</p><div class="chips-row">${SUGGEST.map(s => `<button class="chip" type="button" data-suggest="${esc(s)}">${esc(s)}</button>`).join("")}</div></div>`}</div>
  <form class="ask-bar" id="askForm">
    <button class="mic ${listening ? "on" : ""}" type="button" id="micBtn" aria-label="${SR ? "Ask with your voice" : "Voice isn't supported in this browser"}" ${SR ? "" : "disabled"}>${svg("mic")}</button>
    <input id="askInput" placeholder="${SR ? "Ask, or tap the mic…" : "Type your question…"}" autocomplete="off" aria-label="Your question">
    <button class="btn primary" type="submit" aria-label="Send">${svg("send")}</button>
  </form>
  <div class="ask-opts"><label class="switch"><input type="checkbox" id="speakToggle" ${speak ? "checked" : ""}><span>Read answers aloud</span></label>${chat.length ? `<button class="linkbtn" type="button" data-clear-chat>Clear chat</button>` : ""}</div>
  ${SR ? "" : `<p class="note">Voice input works in Chrome, Edge and Safari. You can still type here.</p>`}
  </section>`;
};
const bubble = m => `<div class="msg ${m.who}">${m.who === "me" ? esc(m.text) : m.html}${m.links?.length ? `<div class="row wrap">${m.links.map(l => l.hash ? `<a class="btn sm soft" href="#${l.hash}">${esc(l.t)}</a>` : `<a class="btn sm soft" href="${esc(l.u)}" target="_blank" rel="noopener">${esc(l.t)} ${svg("open")}</a>`).join("")}</div>` : ""}</div>`;
const save = () => store.set("bjb-chat", chat.slice(-30));

/* ---------- local answers ---------- */
const has = (q, ...ws) => ws.some(w => q.includes(w));
const todayClasses = (d = new Date().getDay()) => App.S.classes.filter(c => c.days.includes(d)).sort((a, b) => mins(a.start) - mins(b.start));
const clsLine = c => `<li><b>${esc(c.name)}</b> ${fmt(c.start)}–${fmt(c.end)} · ${esc(App.where(c))}</li>`;
function dueLines(days){
  const up = App.upcoming(days);
  if (!App.canvas.feed && !(App.canvas.manual || []).length) return { say: "Canvas isn't connected yet, so I can't see your deadlines.", html: `<p>Connect Canvas and I'll know every deadline.</p>`, links: [{ t: "Connect Canvas", hash: "classes/due" }] };
  if (!up.length) return { say: `Nothing due in the next ${days} days.`, html: `<p>Nothing due in the next ${days} days. 🎉</p>` };
  return { say: `You have ${up.length} thing${up.length > 1 ? "s" : ""} due. ` + up.slice(0, 3).map(d => `${d.title}, ${App.relTime(d.due)}`).join(". "),
    html: `<ul class="ans">${up.slice(0, 8).map(d => `<li><b>${esc(d.title)}</b> · ${esc(d.courseShort || "")} · <span class="${new Date(d.due) < Date.now() ? "bad" : ""}">${App.relTime(d.due)}</span></li>`).join("")}</ul>`, links: [{ t: "All deadlines", hash: "classes/due" }] };
}
function localAnswer(raw){
  const q = raw.toLowerCase();
  const now = new Date();
  // Today / plan
  if (has(q, "plan for today", "my day", "today's plan", "schedule today", "what do i have today", "my schedule")){
    const cl = todayClasses(), r = App.recToday(), dl = App.upcoming(1);
    return { say: `${cl.length ? `You have ${cl.length} class${cl.length > 1 ? "es" : ""}: ` + cl.map(c => `${c.name} at ${fmt(c.start)}`).join(", ") : "No classes today"}. ${dl.length ? `${dl.length} deadline${dl.length > 1 ? "s" : ""} in the next day.` : ""} The gym is ${r.open ? "open now" : "closed now"}.`,
      html: `<p><b>Classes</b></p>${cl.length ? `<ul class="ans">${cl.map(clsLine).join("")}</ul>` : "<p>No classes today.</p>"}
        <p><b>Due in the next 24 hours</b></p>${dl.length ? `<ul class="ans">${dl.map(d => `<li>${esc(d.title)} · ${App.relTime(d.due)}</li>`).join("")}</ul>` : `<p>${App.canvas.feed || (App.canvas.manual || []).length ? "Nothing." : "Connect Canvas to see deadlines."}</p>`}
        <p><b>Gym</b> ${r.open ? "open now" : "closed now"} · ${esc(r.hours)}</p><p><b>Food budget</b> ${money(App.budgetLeft())} left this week</p>`, links: [{ t: "Open Today", hash: "today" }] };
  }
  // Next class / where is my class
  if (has(q, "next class", "where is my class", "where's my class", "class today", "classes today", "my class", "lecture")){
    const n = App.nextClass();
    if (!n) return { say: "You don't have any classes saved. Upload your schedule and I'll know.", html: `<p>No classes saved yet.</p>`, links: [{ t: "Upload schedule", hash: "classes/schedule" }] };
    return { say: `${n.c.name}, ${n.when}, ${App.where(n.c)}.`, html: `<p><b>${esc(n.c.name)}</b><br>${esc(n.when)} · ${esc(App.where(n.c))}</p>`,
      links: n.c.mode === "online" ? (n.c.link ? [{ t: "Join class", u: n.c.link }] : []) : (n.c.bldg ? [{ t: "Walk there", u: App.walkTo(n.c.bldg + ", Johns Hopkins Homewood, Baltimore") }] : []) };
  }
  if (has(q, "tomorrow") && has(q, "class")){
    const cl = todayClasses((now.getDay() + 1) % 7);
    return { say: cl.length ? "Tomorrow: " + cl.map(c => `${c.name} at ${fmt(c.start)}`).join(", ") : "No classes tomorrow.", html: cl.length ? `<ul class="ans">${cl.map(clsLine).join("")}</ul>` : `<p>No classes tomorrow.</p>` };
  }
  // Deadlines
  if (has(q, "late", "overdue", "missing")){
    const late = App.deadlines().filter(d => !d.isDone && new Date(d.due) < now && now - new Date(d.due) < 14 * 864e5);
    return late.length ? { say: `${late.length} item${late.length > 1 ? "s are" : " is"} past due: ` + late.slice(0, 3).map(d => d.title).join(", "), html: `<ul class="ans">${late.map(d => `<li class="bad"><b>${esc(d.title)}</b> · was due ${App.relTime(d.due)}</li>`).join("")}</ul>`, links: [{ t: "Review deadlines", hash: "classes/due" }] }
      : { say: "Nothing is late. Nice.", html: "<p>Nothing is late. Nice.</p>" };
  }
  if (has(q, "due", "deadline", "assignment", "homework", "hw", "exam", "quiz", "midterm")) return dueLines(has(q, "today", "tonight") ? 1 : has(q, "month") ? 30 : 7);
  if (has(q, "grade", "score", "gpa")){
    const cs = App.canvas.courses || [];
    if (!App.canvas.token) return { say: "Add your Canvas token in Classes, Grades, and I can read your scores.", html: "<p>I need a Canvas access token to see grades.</p>", links: [{ t: "Set up grades", hash: "classes/grades" }] };
    return { say: cs.map(c => `${c.name}: ${c.score != null ? Math.round(c.score) + " percent" : "no score yet"}`).join(". "), html: `<ul class="ans">${cs.map(c => `<li><b>${esc(c.name)}</b> · ${c.score != null ? Math.round(c.score * 10) / 10 + "%" : "—"}</li>`).join("")}</ul>`, links: [{ t: "Grades", hash: "classes/grades" }] };
  }
  // Gym
  if (has(q, "gym", "rec center", "o'connor", "oconnor", "workout", "pool")){
    const r = App.recToday();
    return { say: `The O'Connor Rec Center is ${r.open ? "open now" : r.opensLater ? "opening later today" : "closed now"}. Today's hours: ${r.hours}.`, html: `<p>O'Connor Rec Center is <b>${r.open ? "open now" : r.opensLater ? "opening later today" : "closed now"}</b>. Today: ${esc(r.hours)}.</p>`, links: [{ t: "Gym page", hash: "campus/gym" }] };
  }
  // Budget
  if (has(q, "budget", "spent", "money left", "how much can i spend", "afford")){
    const left = App.budgetLeft();
    return { say: `You have ${money(left)} left of your ${money(App.budget.weekly)} weekly food budget.`, html: `<p><b>${money(left)}</b> left of ${money(App.budget.weekly)} this week.</p>`, links: [{ t: "Plan my week", hash: "food/plan" }] };
  }
  // Food
  if (has(q, "food", "eat", "hungry", "lunch", "dinner", "breakfast", "veg", "pizza", "coffee", "restaurant", "snack", "meal")){
    const cap = (q.match(/\$\s?(\d+)/) || q.match(/under (\d+)/) || [])[1];
    const lim = cap ? +cap : Math.max(8, App.budgetLeft() / 4);
    const veg = has(q, "veg", "vegetarian", "vegan") || App.budget.diet !== "nonveg";
    const vegan = has(q, "vegan") || App.budget.diet === "vegan";
    const F = window.BJB_FOOD;
    let opts = F.places.filter(p => !p.swipe && p.lo <= lim && (!veg || p.diet.includes("v") || p.diet.includes("vg")) && (!vegan || p.diet.includes("vg")));
    if (has(q, "breakfast", "coffee", "bagel")) opts = opts.filter(p => /breakfast|coffee|bagel|caf/i.test(p.cui + p.tag));
    opts = opts.sort((a, b) => a.lo - b.lo).slice(0, 4);
    if (!opts.length) return { say: `I couldn't find a spot under ${money(lim)}. Campus dining or Too Good To Go might work.`, html: `<p>Nothing under ${money(lim)} on my list. Try campus dining, the Hopkins Food Pantry or Too Good To Go.</p>`, links: [{ t: "Eat nearby", hash: "food/nearby" }] };
    return { say: "Try " + opts.map(p => `${p.n}, about ${money(p.lo)} to ${money(p.hi)}`).join("; ") + ".",
      html: `<ul class="ans">${opts.map(p => `<li><b>${esc(p.n)}</b> · ${money(p.lo)}–${money(p.hi)} · ${esc(veg ? p.vegPick : p.pick)}</li>`).join("")}</ul><p class="note">${money(App.budgetLeft())} left in your weekly budget.</p>`, links: [{ t: "Nearby with directions", hash: "food/nearby" }] };
  }
  // Getting around
  if (has(q, "penn station", "train", "amtrak", "shuttle", "jimmy", "jhmi", "bus", "medical campus", "peabody", "night ride", "get home")){
    if (has(q, "night", "late", "home", "safe")) return { say: "Request a free Blue Jay Shuttle night ride in the TransLoc app, or call the safety escort at 410 516 4600.", html: `<p>Request a free <b>Blue Jay Shuttle night ride</b> in TransLoc, or call the safety escort.</p>`, links: [{ t: "Night ride guide", hash: "campus/move" }] };
    return { say: "Take the free JHMI shuttle, the Jimmy, from the Interfaith Center, Scott-Bates Commons or the bookstore. It goes to Penn Station, Peabody and the medical campus. Track it live in TransLoc.", html: `<p>Take the free <b>JHMI shuttle (“the Jimmy”)</b> from the Interfaith Center, Scott-Bates Commons or the JHU Bookstore. It runs to Penn Station, Peabody and the medical campus. Track it live in TransLoc.</p>`, links: [{ t: "Shuttles", hash: "campus/move" }] };
  }
  // Program
  if (has(q, "core", "elective", "requirement", "graduate", "courses left", "still need", "degree")){
    const prof = App.S.profile || {}, prog = window.BJB_PROGRAMS.list.find(p => p.id === prof.program);
    if (!prog) return { say: "Pick your program in Classes, My program, and I'll track your requirements.", html: "<p>Pick your program first.</p>", links: [{ t: "My program", hash: "classes/program" }] };
    return { say: "Here's your requirement tracker.", html: `<p>Open your tracker to see each core area and elective, and what's left.</p>`, links: [{ t: "My program", hash: "classes/program" }] };
  }
  // Emergency
  if (has(q, "emergency", "unsafe", "danger", "police", "escort")) return { say: "For an emergency on campus call 410 516 7777, or 911. For a walking escort call 410 516 4600.", html: `<p><b>Emergency:</b> 410-516-7777 or 911<br><b>Safety escort:</b> 410-516-4600</p>`, links: [{ t: "Safety", hash: "campus/safety" }] };
  if (has(q, "discount", "deal", "free ", "student price", "cheap")) return { say: "Here are the student deals I know about.", html: `<p>DashPass and Uber One both have $4.99 student plans; Prime Student starts with a 6-month free trial. See all deals with how to verify.</p>`, links: [{ t: "Deals & apps", hash: "food/deals" }] };
  // Fallback: search links and guides
  const words = q.replace(/[?.!,]/g, "").split(/\s+/).filter(w => w.length > 2 && !["the","how","what","where","can","does","for","and","you","my","do","is","get","i'm","need"].includes(w));
  if (words.length){
    const score = s => words.filter(w => s.toLowerCase().includes(w)).length;
    const G = App.G, best = [
      ...Object.entries(G).map(([id, g]) => ({ s: score(`${g.title} ${g.who} ${(g.steps || []).join(" ")}`) * 1.2, guide: id, t: g.title, d: g.who })),
      ...App.D.items.map(it => ({ s: score(`${it.t} ${it.d} ${it.k || ""}`), it })),
    ].filter(x => x.s >= Math.min(2, words.length)).sort((a, b) => b.s - a.s).slice(0, 3);
    if (best.length){
      const top = best[0];
      return { say: top.it ? `${top.it.t}: ${top.it.d}` : `Here's a step-by-step guide: ${top.t}.`, html: `<ul class="ans">${best.map(b => b.it ? `<li><b>${esc(b.it.t)}</b> · ${esc(b.it.d)}</li>` : `<li><b>${esc(b.t)}</b> · step-by-step guide</li>`).join("")}</ul>`,
        links: best.map(b => b.it ? (b.it.u ? { t: b.it.t, u: b.it.u } : null) : { t: "Open guide: " + b.t, guide: b.guide }).filter(Boolean), guides: best.filter(b => b.guide).map(b => b.guide), weak: true };
    }
  }
  return null;
}

/* ---------- server answer ---------- */
function summary(){
  const n = App.nextClass(), up = App.upcoming(7).slice(0, 6), prof = App.S.profile || {};
  return [
    `Now: ${new Date().toLocaleString("en-US", { weekday: "long", hour: "numeric", minute: "2-digit" })}`,
    prof.level ? `Student: ${prof.level}${prof.program ? ", program " + prof.program : ""}${prof.intl ? ", international" : ""}` : "",
    `Classes: ${App.S.classes.filter(c => !c.ex).map(c => `${c.name} ${c.days.map(d => DAY[d].slice(0, 3)).join("/")} ${fmt(c.start)} ${App.where(c)}`).join("; ") || "none saved"}`,
    n ? `Next class: ${n.c.name}, ${n.when}` : "",
    `Due soon: ${up.map(d => `${d.title} (${d.courseShort}) ${App.relTime(d.due)}`).join("; ") || "none known"}`,
    `Food: ${App.budget.diet}, ${money(App.budgetLeft())} left of ${money(App.budget.weekly)} weekly budget`,
    `Gym today: ${App.recToday().hours}`,
  ].filter(Boolean).join("\n");
}
async function serverAnswer(q){
  const r = await App.api("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ q, context: summary(), history: chat.slice(-6).map(m => ({ who: m.who, text: m.text || m.say || "" })) }) });
  return r;
}

async function ask(q){
  q = q.trim(); if (!q) return;
  chat.push({ who: "me", text: q });
  const thinking = { who: "bot", html: `<p class="note">Thinking…</p>` }; chat.push(thinking); App.render(); scroll();
  let a = localAnswer(q);
  if ((!a || a.weak) && App.S.hasServer){
    try { const r = await serverAnswer(q); if (r.answer) a = { say: r.answer, html: `<p>${esc(r.answer).replace(/\n+/g, "</p><p>")}</p>`, links: a?.links || [] }; }
    catch (e) { if (!a) a = { say: "I couldn't reach the assistant right now.", html: `<p>I couldn't reach the assistant right now. Try searching instead.</p>`, links: [] }; }
  }
  if (!a) a = { say: "I'm not sure about that one yet. Try the search bar, or send feedback so I can learn it.", html: `<p>I'm not sure about that one yet. Try the search bar, or <a href="mailto:${App.D.contact}?subject=${encodeURIComponent("Blue Jay Buddy should answer: " + q)}">tell us</a> so it gets added.</p>` };
  chat.pop();
  chat.push({ who: "bot", html: a.html + (a.guides?.length ? `<div class="row wrap">${a.guides.map(g => `<button class="btn sm soft" type="button" data-guide="${g}">Step-by-step: ${esc(App.G[g].title)}</button>`).join("")}</div>` : ""), say: a.say, links: (a.links || []).filter(l => !l.guide), text: a.say });
  save(); App.render(); scroll();
  if (speak && a.say && "speechSynthesis" in window){ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(a.say.replace(/\$(\d+)/g, "$1 dollars")); u.rate = 1.03; speechSynthesis.speak(u); }
}
App.ask = ask;
const scroll = () => { const c = App.$("#chat"); if (c) c.scrollTop = c.scrollHeight; window.scrollTo({ top: document.body.scrollHeight, behavior: App.reduced() ? "auto" : "smooth" }); };

function listen(){
  if (!SR) return;
  if (listening){ rec?.stop(); return; }
  rec = new SR(); rec.lang = "en-US"; rec.interimResults = true; rec.maxAlternatives = 1;
  listening = true; App.$("#micBtn")?.classList.add("on");
  const input = App.$("#askInput");
  rec.onresult = e => { const t = [...e.results].map(r => r[0].transcript).join(""); if (input) input.value = t; if (e.results[e.results.length - 1].isFinal){ rec.stop(); ask(t); } };
  rec.onerror = e => { if (e.error === "not-allowed") App.toast("Allow microphone access to use voice"); };
  rec.onend = () => { listening = false; App.$("#micBtn")?.classList.remove("on"); };
  speechSynthesis?.cancel?.();
  rec.start();
}

document.addEventListener("submit", e => { if (e.target.id === "askForm"){ e.preventDefault(); const i = App.$("#askInput"); const v = i.value; i.value = ""; ask(v); } });
document.addEventListener("click", e => {
  const t = e.target;
  if (t.closest("#micBtn")) listen();
  const s = t.closest("[data-suggest]"); if (s) ask(s.dataset.suggest);
  if (t.closest("[data-clear-chat]")) { chat = []; save(); App.render(); }
});
document.addEventListener("change", e => { if (e.target.id === "speakToggle"){ speak = e.target.checked; store.set("bjb-speak", speak); if (!speak) speechSynthesis?.cancel?.(); } });
})();
