// Schedule import: read an SIS schedule PDF, a screenshot or a photo ON THE DEVICE,
// find course codes, days, times and rooms, then let the student confirm before saving.
(() => {
"use strict";
const App = window.App, { esc, svg, fmt } = App;

const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const TESS = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";

const loaded = {};
const loadScript = src => loaded[src] ||= new Promise((ok, bad) => {
  const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => bad(new Error("Could not load " + src)); document.head.appendChild(s);
});

async function pdfText(file, onStep){
  await loadScript(PDFJS);
  const lib = window.pdfjsLib; lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  const doc = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
  let text = "";
  for (let p = 1; p <= doc.numPages; p++){
    onStep(`Reading page ${p} of ${doc.numPages}…`);
    const page = await doc.getPage(p);
    const c = await page.getTextContent();
    // Rebuild lines from text positions so table rows stay together.
    const rows = {};
    c.items.forEach(it => { const y = Math.round(it.transform[5] / 3); (rows[y] ||= []).push(it); });
    text += Object.keys(rows).sort((a, b) => b - a).map(y => rows[y].sort((a, b) => a.transform[4] - b.transform[4]).map(i => i.str).join(" ")).join("\n") + "\n";
  }
  if (text.replace(/\s/g, "").length > 40) return text;
  // Scanned PDF: render pages and run OCR on them.
  let ocr = "";
  for (let p = 1; p <= Math.min(doc.numPages, 4); p++){
    onStep(`Scanning page ${p} (this PDF is an image)…`);
    const page = await doc.getPage(p), vp = page.getViewport({ scale: 2 });
    const cv = document.createElement("canvas"); cv.width = vp.width; cv.height = vp.height;
    await page.render({ canvasContext: cv.getContext("2d"), viewport: vp }).promise;
    ocr += await imageText(cv, onStep) + "\n";
  }
  return ocr;
}
async function imageText(img, onStep){
  await loadScript(TESS);
  const { data } = await window.Tesseract.recognize(img, "eng", { logger: m => m.status === "recognizing text" && onStep(`Reading text… ${Math.round(m.progress * 100)}%`) });
  return data.text;
}

/* ---------- parsing ---------- */
const DAYMAP = { m:1, mo:1, mon:1, monday:1, t:2, tu:2, tue:2, tues:2, tuesday:2, w:3, we:3, wed:3, wednesday:3, th:4, r:4, thu:4, thur:4, thurs:4, thursday:4, f:5, fr:5, fri:5, friday:5, sa:6, sat:6, saturday:6, su:0, sun:0, sunday:0 };
function parseDays(s){
  s = s.trim();
  // Words: "Mon Wed", "Tuesday/Thursday"
  const words = s.toLowerCase().match(/\b(mon(day)?|tue(s(day)?)?|wed(nesday)?|thu(r(s(day)?)?)?|fri(day)?|sat(urday)?|sun(day)?)\b/g);
  if (words) return [...new Set(words.map(w => DAYMAP[w.slice(0, 3)] ?? DAYMAP[w]))].filter(d => d !== undefined);
  // Compact: MW, TTh, MWF, TR, M/W
  const compact = s.replace(/[\/,\s]/g, "").match(/^(M|Tu|T|W|Th|R|F|Sa|Su)+$/);
  if (!compact) return [];
  const out = []; const re = /Th|Tu|Sa|Su|M|T|W|R|F/g; let m;
  while ((m = re.exec(s.replace(/[\/,\s]/g, "")))) out.push(DAYMAP[m[0].toLowerCase()]);
  return [...new Set(out)];
}
const to24 = (h, m, ap) => { h = +h; ap = (ap || "").toLowerCase(); if (ap.startsWith("p") && h < 12) h += 12; if (ap.startsWith("a") && h === 12) h = 0; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); };

App.parseSchedule = text => {
  const buildings = App.D.buildings.map(([b]) => b);
  const short = { "malone":"Malone Hall","hackerman":"Hackerman Hall","shaffer":"Shaffer Hall","hodson":"Hodson Hall","gilman":"Gilman Hall","krieger":"Krieger Hall","maryland":"Maryland Hall","latrobe":"Latrobe Hall","barton":"Barton Hall","clark":"Clark Hall","croft":"Croft Hall","olin":"Olin Hall","wyman":"Wyman Park Building","bloomberg":"Bloomberg Center for Physics and Astronomy","mudd":"Mudd Hall","remsen":"Remsen Hall","ames":"Ames Hall","mergenthaler":"Mergenthaler Hall","brody":"Brody Learning Commons","levering":"Levering Hall","mattin":"Mattin Center","shriver":"Shriver Hall","garland":"Garland Hall","mason":"Mason Hall","smokler":"Smokler Center","ntb":"New Teaching Building" };
  const norm = text.replace(/\r/g, "").replace(/[–—]/g, "-").replace(/ /g, " ");
  // Course codes: EN.553.613(.01), AS.110.106, EN553613, EN 553 613
  const codeRe = /\b([A-Z]{2})[.\s]?(\d{3})[.\s]?(\d{3})(?:[.\s](\d{2}))?\b/g;
  const hits = []; let m;
  while ((m = codeRe.exec(norm))) hits.push({ idx: m.index, end: codeRe.lastIndex, code: `${m[1]}.${m[2]}.${m[3]}`, section: m[4] || "" });
  const timeRe = /(\d{1,2}):(\d{2})\s*([AaPp]\.?[Mm]\.?)?\s*-\s*(\d{1,2}):(\d{2})\s*([AaPp]\.?[Mm]\.?)?/;
  const out = [];
  hits.forEach((h, i) => {
    const seg = norm.slice(h.end, i + 1 < hits.length ? hits[i + 1].idx : h.end + 400);
    const segOne = seg.replace(/\n+/g, " ");
    const t = segOne.match(timeRe);
    let start = "", end = "", days = [];
    if (t){
      let ap2 = (t[6] || "").replace(/\./g, ""), ap1 = (t[3] || "").replace(/\./g, "") || ap2;
      // "11:00 - 12:15 PM" -> start AM if 11 and end PM? Keep sensible: start inherits end's AM/PM unless that makes start > end.
      start = to24(t[1], t[2], ap1); end = to24(t[4], t[5], ap2 || ap1);
      if (!t[3] && App.mins(start) > App.mins(end)) start = to24(t[1], t[2], "am");
      if (!ap1 && !ap2 && +t[1] < 8) { start = to24(t[1], t[2], "pm"); end = to24(t[4], t[5], "pm"); }
      // Walk back from the time over tokens that look like days ("M W", "TTh", "Tuesday Thursday").
      const toks = segOne.slice(0, t.index).trim().split(/[\s,\/]+/), dayToks = [];
      for (let k = toks.length - 1; k >= 0 && dayToks.length < 5; k--){
        if (parseDays(toks[k]).length) dayToks.unshift(toks[k]); else if (dayToks.length) break;
      }
      days = [...new Set(dayToks.flatMap(parseDays))].sort();
    }
    if (!days.length){
      const d = segOne.match(/\b((?:M|Tu|T|W|Th|R|F)(?:[\/,]?(?:M|Tu|T|W|Th|R|F)){0,4})\b(?=\s+\d{1,2}:\d{2})/);
      if (d) days = parseDays(d[1]);
    }
    let bldg = "", room = "";
    const low = segOne.toLowerCase();
    const fullB = buildings.find(b => low.includes(b.toLowerCase()));
    if (fullB) bldg = fullB; else { const k = Object.keys(short).find(k => new RegExp("\\b" + k + "\\b").test(low)); if (k) bldg = short[k]; }
    if (bldg){ const rm = segOne.match(new RegExp(bldg.split(" ")[0] + "[A-Za-z ]*?\\s(\\w?\\d{1,4}\\w?)\\b", "i")); if (rm) room = rm[1]; }
    const online = /\bonline\b|\bzoom\b|\bvirtual\b|\bremote\b/i.test(segOne);
    // Title: words right after the code, before days/time/instructor-looking text.
    let title = segOne.replace(/^[\s.\-:]*\d{0,2}\s*/, "").split(/\s{2,}|\b(?:[Mm]on|[Tt]ue|[Ww]ed|[Tt]hu|[Ff]ri)[a-z]*\b|\b(?:M|Tu|T|W|Th|F|MW|TTh|MWF|TR|R)\b(?=[\s\/,]+(?:\d|(?:M|Tu|T|W|Th|F|R)\b))|\d{1,2}:\d{2}|\bLecture\b|\bLec\b|\bSection\b|\bRegistered\b|\bEnrolled\b|\(\d+(\.\d+)?\)/)[0].trim();
    title = title.replace(/\s+\d+(\.\d+)?\s*(credits?|cr)?$/i, "").replace(/\s+(online|lecture|registered)$/i, "").replace(/[|•]+/g, " ").trim().slice(0, 70);
    const prog = window.BJB_PROGRAMS?.titles?.[h.code];
    if ((!title || title.length < 4) && prog) title = prog[0];
    const dup = out.find(o => o.code === h.code && o.start === start && o.days.join() === days.join());
    if (!dup) out.push({ code: h.code, section: h.section, name: title || h.code, days, start, end, bldg, room, mode: online && !bldg ? "online" : "inperson" });
  });
  // Merge multiple meeting rows of the same course (e.g. lecture + section) only when nothing was found for one.
  return out.filter(o => o.days.length || o.start || !out.some(p => p !== o && p.code === o.code));
};

/* ---------- UI ---------- */
App.importSheet = () => App.openSheet(`${App.sheetHead("Add your classes automatically", "Upload your SIS schedule as a PDF, a screenshot, or a photo of your screen.")}
  <ol class="mini-steps">
    <li>In <a href="https://sis.jhu.edu" target="_blank" rel="noopener">SIS</a>, open <b>Registration → Class Schedule</b>.</li>
    <li>Save it as a PDF (Print → Save as PDF) or take a screenshot.</li>
    <li>Upload it here. It's read on your phone and never uploaded.</li>
  </ol>
  <label class="drop" for="impFile">
    ${svg("upload", 'width="28" height="28"')}
    <b>Choose a PDF or image</b><span class="note">PDF, PNG or JPG</span>
    <input id="impFile" type="file" accept="application/pdf,image/*" hidden>
  </label>
  <label class="drop alt" for="impCam">${svg("camera", 'width="22" height="22"')}<b>Take a photo of your screen</b><input id="impCam" type="file" accept="image/*" capture="environment" hidden></label>
  <details class="paste"><summary>Or paste the schedule text</summary>
    <textarea id="impText" rows="5" placeholder="Copy your class schedule table from SIS and paste it here"></textarea>
    <button class="btn soft" type="button" id="impParse">Find my classes</button></details>
  <p class="status" id="impStatus" role="status"></p>`, "tall");

async function handleFile(file){
  const st = App.$("#impStatus"), step = s => { if (st) st.textContent = s; };
  try {
    step("Opening file…");
    let text = "";
    if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) text = await pdfText(file, step);
    else { const url = URL.createObjectURL(file); const img = new Image(); img.src = url; await img.decode(); text = await imageText(img, step); URL.revokeObjectURL(url); }
    showPreview(App.parseSchedule(text), text);
  } catch (e) {
    console.error(e);
    step("Couldn't read that file. Check your internet connection (the reader downloads once), or paste the text instead.");
  }
}
function showPreview(found, raw){
  const enrich = App.S.hasServer ? `<p class="note">Missing times or rooms? We'll look them up from the public SIS class list where possible.</p>` : "";
  App.openSheet(`${App.sheetHead(found.length ? `Found ${found.length} class${found.length > 1 ? "es" : ""}` : "No classes found", found.length ? "Check each one, fix anything wrong, then save." : "Try a clearer screenshot, a PDF from SIS, or paste the text.")}
    ${found.length ? `<form id="impForm" class="imp-list">${found.map((c, i) => `
      <fieldset class="imp-row" data-i="${i}">
        <label class="chk"><input type="checkbox" name="keep" checked> <b>${esc(c.code)}${c.section ? "." + esc(c.section) : ""}</b></label>
        <label>Name<input name="name" value="${esc(c.name)}" maxlength="70"></label>
        <div class="days" role="group" aria-label="Days">${["Mon","Tue","Wed","Thu","Fri"].map((d, k) => `<label><input type="checkbox" name="d${k+1}" ${c.days.includes(k+1) ? "checked" : ""}><span>${d}</span></label>`).join("")}</div>
        <div class="row2"><label>Starts<input type="time" name="start" value="${esc(c.start)}"></label><label>Ends<input type="time" name="end" value="${esc(c.end)}"></label></div>
        <div class="row2"><label>Building<select name="bldg"><option value="">Online / not listed</option>${App.D.buildings.map(([b]) => `<option ${b === c.bldg ? "selected" : ""}>${esc(b)}</option>`).join("")}</select></label><label>Room<input name="room" value="${esc(c.room)}" maxlength="12"></label></div>
      </fieldset>`).join("")}
      ${enrich}
      <div class="row sticky-acts"><button class="btn primary" type="submit">${svg("check")}Save these classes</button><button class="btn ghost" type="button" data-close>Cancel</button></div>
    </form>` : `<details class="paste" open><summary>What we read</summary><pre class="raw">${esc(raw.slice(0, 1200))}</pre></details>
      <div class="row"><button class="btn primary" type="button" data-import>Try another file</button><button class="btn soft" type="button" data-addclass>Add a class by hand</button></div>`}`, "tall");
  const form = App.$("#impForm");
  form?.addEventListener("submit", async e => {
    e.preventDefault();
    const keep = [];
    App.$$("#impForm .imp-row").forEach(row => {
      const f = n => row.querySelector(`[name="${n}"]`);
      if (!f("keep").checked) return;
      const c = found[+row.dataset.i];
      keep.push({ id: Date.now() + Math.random(), code: c.code, name: f("name").value.trim() || c.code,
        days: [1,2,3,4,5].filter(d => f("d" + d).checked), start: f("start").value, end: f("end").value,
        bldg: f("bldg").value, room: f("room").value.trim(), mode: f("bldg").value ? "inperson" : "online", link: "" });
    });
    await App.enrichFromSIS(keep);
    App.S.classes = App.S.classes.filter(c => !c.ex && !keep.some(k => k.code && k.code === c.code)).concat(keep);
    App.saveClasses();
    App.markTakingFromClasses();
    App.closeSheet(); App.toast(`Saved ${keep.length} class${keep.length === 1 ? "" : "es"}`); App.go("classes/schedule");
  });
}
// Fill missing times/rooms from the public SIS class search (server keeps the API key).
App.enrichFromSIS = async list => {
  if (!App.S.hasServer) return;
  const need = list.filter(c => c.code && (!c.start || !c.days.length));
  await Promise.all(need.map(async c => {
    try {
      const r = await App.api(`/api/sis?course=${encodeURIComponent(c.code)}&term=current${c.section ? "&section=" + c.section : ""}`);
      const s = r.current; if (!s) return;
      if (!c.days.length && s.days) c.days = s.days;
      if (!c.start && s.start){ c.start = s.start; c.end = s.end; }
      if (!c.bldg && s.building){ const b = App.D.buildings.find(([n]) => s.building.toLowerCase().includes(n.toLowerCase().split(" ")[0])); if (b){ c.bldg = b[0]; c.mode = "inperson"; } }
      if (!c.room && s.room) c.room = s.room;
    } catch {}
  }));
};

document.addEventListener("change", e => {
  if (e.target.id === "impFile" || e.target.id === "impCam"){ const f = e.target.files?.[0]; if (f) handleFile(f); }
});
document.addEventListener("click", e => {
  if (e.target.closest("[data-import]")) { e.preventDefault(); App.importSheet(); }
  if (e.target.id === "impParse"){ const t = App.$("#impText").value; showPreview(App.parseSchedule(t), t); }
});
})();
