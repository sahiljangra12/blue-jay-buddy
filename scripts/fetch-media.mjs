// Finds openly licensed videos and 4K-class photos on Wikimedia Commons for review.
// Writes previews + media-candidates.json to media-candidates/. Run by .github/workflows/photos.yml (mode: media).
import fs from "node:fs/promises";
import sharp from "sharp";
const UA = "BlueJayBuddy/1.0 (https://github.com/sahiljangra12/blue-jay-buddy)";
const OK = /^(cc[- ]by(-sa)?[- ]?[0-9.]*|cc0|public domain|pd)/i;
const strip = s => String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const api = async params => (await fetch("https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({ format: "json", ...params }), { headers: { "User-Agent": UA } })).json();
await fs.mkdir("media-candidates", { recursive: true });
const out = [];
const VQ = ["Johns Hopkins University", "Johns Hopkins Homewood", "Johns Hopkins campus", "Baltimore Inner Harbor", "Baltimore skyline", "Baltimore timelapse", "Baltimore aerial", "Baltimore drone", "Charles Village Baltimore", "Baltimore Penn Station", "Baltimore harbor night"];
const PQ = ["Johns Hopkins University aerial", "Homewood campus aerial Baltimore", "Johns Hopkins Homewood autumn", "Johns Hopkins Homewood night", "Keyser Quadrangle", "Gilman Hall Johns Hopkins clock tower", "Milton S. Eisenhower Library Johns Hopkins", "Johns Hopkins University spring blossoms", "Baltimore Inner Harbor night", "Baltimore skyline sunset", "Mount Vernon Place Baltimore Washington Monument", "Johns Hopkins Hospital dome"];
let n = 0;
for (const q of VQ){
  const j = await api({ action: "query", generator: "search", gsrsearch: q + " filetype:video", gsrnamespace: "6", gsrlimit: "10", prop: "videoinfo", viprop: "url|size|extmetadata|mime|derivatives", viurlwidth: "640" });
  for (const p of Object.values(j.query?.pages || {})){
    const v = p.videoinfo?.[0]; if (!v) continue;
    const m = v.extmetadata || {}, lic = strip(m.LicenseShortName?.value);
    if (!OK.test(lic) || out.find(o => o.title === p.title)) continue;
    const id = `v${++n}`;
    try { if (v.thumburl){ const buf = Buffer.from(await (await fetch(v.thumburl, { headers: { "User-Agent": UA } })).arrayBuffer()); await sharp(buf).resize({ width: 480 }).jpeg({ quality: 70 }).toFile(`media-candidates/${id}.jpg`); } } catch {}
    out.push({ id, kind: "video", q, title: p.title, w: v.width, h: v.height, dur: v.duration, license: lic, artist: strip(m.Artist?.value).slice(0, 80), page: v.descriptionurl, url: v.url,
      derivatives: (v.derivatives || []).map(d => ({ src: d.src, type: d.type, w: d.width, h: d.height })).slice(0, 12), desc: strip(m.ImageDescription?.value).slice(0, 140) });
  }
}
for (const q of PQ){
  const j = await api({ action: "query", generator: "search", gsrsearch: q + " filetype:bitmap", gsrnamespace: "6", gsrlimit: "12", prop: "imageinfo", iiprop: "url|size|extmetadata|mime", iiurlwidth: "1600" });
  let k = 0;
  for (const p of Object.values(j.query?.pages || {}).sort((a, b) => a.index - b.index)){
    const ii = p.imageinfo?.[0]; if (!ii || !/jpeg|png/.test(ii.mime) || ii.width < 3000) continue;
    const m = ii.extmetadata || {}, lic = strip(m.LicenseShortName?.value);
    if (!OK.test(lic) || out.find(o => o.title === p.title)) continue;
    const id = `p${++n}`;
    try { const buf = Buffer.from(await (await fetch(ii.thumburl, { headers: { "User-Agent": UA } })).arrayBuffer()); await sharp(buf).resize({ width: 480 }).jpeg({ quality: 70 }).toFile(`media-candidates/${id}.jpg`); } catch { continue; }
    out.push({ id, kind: "photo", q, title: p.title, w: ii.width, h: ii.height, license: lic, artist: strip(m.Artist?.value).slice(0, 80), page: ii.descriptionurl, desc: strip(m.ImageDescription?.value).slice(0, 140) });
    if (++k >= 6) break;
    await new Promise(r => setTimeout(r, 250));
  }
}
await fs.writeFile("media-candidates/media-candidates.json", JSON.stringify(out, null, 1));
console.log("videos", out.filter(o => o.kind === "video").length, "photos", out.filter(o => o.kind === "photo").length);
