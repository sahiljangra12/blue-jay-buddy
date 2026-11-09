// Collects openly licensed campus photos from Wikimedia Commons for review.
// Writes small previews + candidates.json to photo-candidates/. Run by .github/workflows/photos.yml.
import fs from "node:fs/promises";
import sharp from "sharp";
const UA = "BlueJayBuddy/1.0 (https://github.com/sahiljangra12/blue-jay-buddy)";
const OK = /^(cc[- ]by(-sa)?[- ]?[0-9.]*|cc0|public domain|pd)/i;
const Q = {
  gilman: "Gilman Hall Johns Hopkins", keyser: "Keyser Quadrangle Johns Hopkins", campus: "Johns Hopkins Homewood campus",
  mse: "Milton S. Eisenhower Library", brody: "Brody Learning Commons", decker: "Decker Quadrangle Johns Hopkins",
  hackerman: "Hackerman Hall Johns Hopkins", malone: "Malone Hall Johns Hopkins", shriver: "Shriver Hall Johns Hopkins",
  museum: "Homewood Museum Baltimore", levering: "Levering Hall Johns Hopkins", mason: "Mason Hall Johns Hopkins",
  bloomberg: "Bloomberg Center Physics Astronomy Johns Hopkins", beach: "Johns Hopkins Beach Charles Street", mattin: "Mattin Center Johns Hopkins",
  rec: "Johns Hopkins recreation center", penn: "Baltimore Penn Station", bma: "Baltimore Museum of Art", harbor: "Inner Harbor Baltimore",
  village: "Charles Village Baltimore", hampden: "Hampden Baltimore 36th Street", peabody: "Peabody Institute Mount Vernon Baltimore",
  hospital: "Johns Hopkins Hospital dome Billings", library: "Johns Hopkins library interior", snow: "Johns Hopkins campus snow",
  bluejay: "Johns Hopkins Blue Jay statue", maryland: "Maryland Hall Johns Hopkins", ames: "Ames Hall Johns Hopkins", krieger: "Krieger Hall Johns Hopkins",
  wyman: "Wyman Quadrangle Johns Hopkins", mergenthaler: "Mergenthaler Hall Johns Hopkins", charles: "Charles Street Baltimore Johns Hopkins",
};
const strip = s => String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
await fs.mkdir("photo-candidates", { recursive: true });
const out = [];
for (const [key, q] of Object.entries(Q)){
  const u = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({ action: "query", format: "json", generator: "search", gsrsearch: q + " filetype:bitmap", gsrnamespace: "6", gsrlimit: "14",
    prop: "imageinfo", iiprop: "url|size|extmetadata|mime", iiurlwidth: "1600" });
  let j; try { j = await (await fetch(u, { headers: { "User-Agent": UA } })).json(); } catch (e) { console.log("fail", key, e.message); continue; }
  const pages = Object.values(j.query?.pages || {}).sort((a, b) => a.index - b.index);
  let n = 0;
  for (const p of pages){
    const ii = p.imageinfo?.[0]; if (!ii || !/jpeg|png/.test(ii.mime) || ii.width < 1200) continue;
    const m = ii.extmetadata || {}, lic = strip(m.LicenseShortName?.value);
    if (!OK.test(lic)) continue;
    try {
      const buf = Buffer.from(await (await fetch(ii.thumburl, { headers: { "User-Agent": UA } })).arrayBuffer());
      const id = `${key}-${++n}`;
      await sharp(buf).resize({ width: 640 }).jpeg({ quality: 70 }).toFile(`photo-candidates/${id}.jpg`);
      out.push({ id, key, title: p.title, w: ii.width, h: ii.height, thumb: ii.thumburl, page: ii.descriptionurl, license: lic,
        licenseUrl: strip(m.LicenseUrl?.value), artist: strip(m.Artist?.value).slice(0, 120), date: strip(m.DateTimeOriginal?.value).slice(0, 20), desc: strip(m.ImageDescription?.value).slice(0, 160) });
    } catch (e) { console.log("dl fail", p.title, e.message); }
    if (n >= 6) break;
    await new Promise(r => setTimeout(r, 300));
  }
  console.log(key, n);
}
await fs.writeFile("photo-candidates/candidates.json", JSON.stringify(out, null, 1));
console.log("total", out.length);
