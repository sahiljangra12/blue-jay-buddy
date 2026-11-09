// Schedule import: reads an SIS class schedule (PDF, screenshot or photo) ON THE DEVICE.
// Text PDFs are read with PDF.js; images and scanned PDFs with Tesseract.js (OCR). Nothing is uploaded.
// The two readers are downloaded only the first time someone uses this.
(() => {
"use strict";
const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const TESS = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";

const loaded = {};
const loadScript = src => loaded[src] ||= new Promise((ok, bad) => {
  const s = document.createElement("script"); s.src = src; s.onload = ok;
  s.onerror = () => { delete loaded[src]; bad(new Error("Couldn't download the reader. Check your internet connection.")); };
  document.head.appendChild(s);
});

async function imageText(img, step){
  await loadScript(TESS);
  const { data } = await window.Tesseract.recognize(img, "eng", { logger: m => m.status === "recognizing text" && step(`Reading text… ${Math.round(m.progress * 100)}%`) });
  return data.text;
}
async function pdfText(file, step){
  await loadScript(PDFJS);
  const lib = window.pdfjsLib; lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  const doc = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
  let text = "";
  for (let p = 1; p <= doc.numPages; p++){
    step(`Reading page ${p} of ${doc.numPages}…`);
    const c = await (await doc.getPage(p)).getTextContent();
    const rows = {}; // rebuild table rows from text positions
    c.items.forEach(it => { const y = Math.round(it.transform[5] / 3); (rows[y] ||= []).push(it); });
    text += Object.keys(rows).sort((a, b) => b - a).map(y => rows[y].sort((a, b) => a.transform[4] - b.transform[4]).map(i => i.str).join(" ")).join("\n") + "\n";
  }
  if (text.replace(/\s/g, "").length > 40) return text;
  let ocr = ""; // scanned PDF: render and OCR the first pages
  for (let p = 1; p <= Math.min(doc.numPages, 4); p++){
    step(`Scanning page ${p}…`);
    const page = await doc.getPage(p), vp = page.getViewport({ scale: 2 });
    const cv = document.createElement("canvas"); cv.width = vp.width; cv.height = vp.height;
    await page.render({ canvasContext: cv.getContext("2d"), viewport: vp }).promise;
    ocr += await imageText(cv, step) + "\n";
  }
  return ocr;
}
async function readFile(file, step = () => {}){
  step("Opening your file…");
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return pdfText(file, step);
  const url = URL.createObjectURL(file);
  try { const img = new Image(); img.src = url; await img.decode(); return await imageText(img, step); }
  finally { URL.revokeObjectURL(url); }
}

/* ---------- parsing ---------- */
const DAYMAP = { m:1, mo:1, mon:1, t:2, tu:2, tue:2, w:3, we:3, wed:3, th:4, r:4, thu:4, f:5, fr:5, fri:5, sa:6, sat:6, su:0, sun:0 };
function parseDays(s){
  s = s.trim();
  const words = s.toLowerCase().match(/\b(mon(day)?|tue(s(day)?)?|wed(nesday)?|thu(r(s(day)?)?)?|fri(day)?|sat(urday)?|sun(day)?)\b/g);
  if (words) return [...new Set(words.map(w => DAYMAP[w.slice(0, 3)]))].filter(d => d !== undefined);
  const flat = s.replace(/[\/,\s]/g, "");
  if (!/^(M|Tu|T|W|Th|R|F|Sa|Su)+$/.test(flat)) return [];
  const out = []; const re = /Th|Tu|Sa|Su|M|T|W|R|F/g; let m;
  while ((m = re.exec(flat))) out.push(DAYMAP[m[0].toLowerCase()]);
  return [...new Set(out)];
}
const to24 = (h, m, ap) => { h = +h; ap = (ap || "").toLowerCase(); if (ap.startsWith("p") && h < 12) h += 12; if (ap.startsWith("a") && h === 12) h = 0; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); };
const mins = hm => { const [h, m] = hm.split(":").map(Number); return h * 60 + m; };

const SHORT = { malone:"Malone Hall", hackerman:"Hackerman Hall", shaffer:"Shaffer Hall", hodson:"Hodson Hall", gilman:"Gilman Hall", krieger:"Krieger Hall", maryland:"Maryland Hall", latrobe:"Latrobe Hall", barton:"Barton Hall", clark:"Clark Hall", croft:"Croft Hall", olin:"Olin Hall", wyman:"Wyman Park Building", bloomberg:"Bloomberg Center for Physics and Astronomy", mudd:"Mudd Hall", remsen:"Remsen Hall", ames:"Ames Hall", mergenthaler:"Mergenthaler Hall", brody:"Brody Learning Commons", levering:"Levering Hall", mattin:"Mattin Center", shriver:"Shriver Hall", garland:"Garland Hall", mason:"Mason Hall" };

function parseSchedule(text, buildings){
  const norm = text.replace(/\r/g, "").replace(/[–—]/g, "-").replace(/ /g, " ");
  const codeRe = /\b([A-Z]{2})[.\s]?(\d{3})[.\s]?(\d{3})(?:[.\s](\d{2}))?\b/g; // EN.553.613(.01)
  const hits = []; let m;
  while ((m = codeRe.exec(norm))) hits.push({ idx: m.index, end: codeRe.lastIndex, code: `${m[1]}.${m[2]}.${m[3]}`, section: m[4] || "" });
  const timeRe = /(\d{1,2}):(\d{2})\s*([AaPp]\.?[Mm]\.?)?\s*-\s*(\d{1,2}):(\d{2})\s*([AaPp]\.?[Mm]\.?)?/;
  const out = [];
  hits.forEach((h, i) => {
    const seg = norm.slice(h.end, i + 1 < hits.length ? hits[i + 1].idx : h.end + 400).replace(/\n+/g, " ");
    const t = seg.match(timeRe);
    let start = "", end = "", days = [];
    if (t){
      const ap2 = (t[6] || "").replace(/\./g, ""), ap1 = (t[3] || "").replace(/\./g, "") || ap2;
      start = to24(t[1], t[2], ap1); end = to24(t[4], t[5], ap2 || ap1);
      if (!t[3] && mins(start) > mins(end)) start = to24(t[1], t[2], "am");
      if (!ap1 && !ap2 && +t[1] < 8) { start = to24(t[1], t[2], "pm"); end = to24(t[4], t[5], "pm"); }
      const toks = seg.slice(0, t.index).trim().split(/[\s,\/]+/), dayToks = [];
      for (let k = toks.length - 1; k >= 0 && dayToks.length < 5; k--){
        if (parseDays(toks[k]).length) dayToks.unshift(toks[k]); else if (dayToks.length) break;
      }
      days = [...new Set(dayToks.flatMap(parseDays))].filter(d => d >= 1 && d <= 5).sort();
    }
    let bldg = "", room = "";
    const low = seg.toLowerCase();
    const full = buildings.find(b => low.includes(b.toLowerCase()));
    if (full) bldg = full; else { const k = Object.keys(SHORT).find(k => new RegExp("\\b" + k + "\\b").test(low)); if (k) bldg = SHORT[k]; }
    if (bldg){ const rm = seg.match(new RegExp(bldg.split(" ")[0] + "[A-Za-z ]*?\\s(\\w?\\d{1,4}\\w?)\\b", "i")); if (rm) room = rm[1]; }
    const online = /\bonline\b|\bzoom\b|\bvirtual\b|\bremote\b/i.test(seg);
    let title = seg.replace(/^[\s.\-:]*\d{0,2}\s*/, "").split(/\s{2,}|\b(?:Mon|Tue|Wed|Thu|Fri)[a-z]*\b|\b(?:M|Tu|T|W|Th|F|MW|TTh|MWF|TR|R)\b(?=[\s\/,]+(?:\d|(?:M|Tu|T|W|Th|F|R)\b))|\d{1,2}:\d{2}|\bLecture\b|\bLec\b|\bSection\b|\bRegistered\b|\bEnrolled\b|\(\d+(\.\d+)?\)/i)[0].trim();
    title = title.replace(/\s+\d+(\.\d+)?\s*(credits?|cr)?$/i, "").replace(/\s+(online|lecture|registered)$/i, "").replace(/[|•]+/g, " ").trim().slice(0, 70);
    if (!out.find(o => o.code === h.code && o.start === start && o.days.join() === days.join()))
      out.push({ code: h.code, section: h.section, name: title.length >= 3 ? title : h.code, days, start, end, bldg, room, mode: online && !bldg ? "online" : "inperson" });
  });
  return out.filter(o => o.days.length || o.start || !out.some(p => p !== o && p.code === o.code));
}

window.BJB_IMPORT = { readFile, parseSchedule };
})();
