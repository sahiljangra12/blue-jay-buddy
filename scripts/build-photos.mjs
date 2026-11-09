// Downloads the chosen Wikimedia Commons photos, resizes them to WebP, and writes credits to assets/photos.json.
import fs from "node:fs/promises";
import sharp from "sharp";
const UA = "BlueJayBuddy/1.0 (https://github.com/sahiljangra12/blue-jay-buddy)";
const PICKS = {
  "quad-spring": "WymanQuad.jpg", "quad-dusk": "Wymanquad.jpg", "gilman-snow": "Gilman Hall, as seen from the Upper Quadrangle in the winter (Johns Hopkins University).jpg",
  "gilman": "Gilman Hall, Johns Hopkins University, Baltimore, MD.jpg", "gilman-tower": "Gilman Hall JHU.jpg",
  "decker": "Panorama of buildings on the Decker Quad.jpg", "mason": "Mason Hall in the Decker Quad - 53495079134.jpg",
  "north-gate": "North Gate on the Homewood Campus of Johns Hopkins University.jpg", "brody": "Outside of Brody Learning Commons.jpg",
  "museum": "Homewood Museum, Johns Hopkins University, Baltimore, MD.jpg", "levering": "View from Levering Plaza.jpg",
  "maryland": "Maryland Hall, Johns Hopkins University, Jan 2011.jpg", "mudd": "Mudd Hall, Johns Hopkins University, Baltimore, MD.jpg",
  "mergenthaler": "Mergenthaler Hall, Johns Hopkins University, Baltimore, MD.jpg", "malone": "Covered walkway and entrance to Malone Hall.jpg",
  "penn": "Baltimore Pennsylvania Station.jpg", "bma": "Baltimore Museum of Art (1929; John Russell Pope, architect), 10 Art Museum Drive, Baltimore, MD 21218 (40400216544).jpg",
  "harbor": "Baltimore's Inner Harbor, viewed from a slope of Federal Hill Park.jpg", "hampden": "36th and Roland Ave. Hampden MD1.jpg",
  "peabody": "Peabody Institute, Mount Vernon Place, Baltimore, MD.jpg", "peabody-library": "Johns Hopkins Library.jpg",
};
const SHRIVER_PREFIX = "Front, Shriver Hall (1954"; const MONUMENT_PREFIX = "Johns Hopkins Monument (1935";
const strip = s => String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
async function info(title){
  const u = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({ action: "query", format: "json", titles: "File:" + title, prop: "imageinfo", iiprop: "url|size|extmetadata", iiurlwidth: "2400" });
  const j = await (await fetch(u, { headers: { "User-Agent": UA } })).json();
  return Object.values(j.query.pages)[0];
}
async function findPrefix(prefix){
  const u = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({ action: "query", format: "json", list: "allimages", aiprefix: prefix.replace(/ /g, "_"), ailimit: "5" });
  const j = await (await fetch(u, { headers: { "User-Agent": UA } })).json();
  return j.query.allimages[0]?.name.replace(/_/g, " ");
}
PICKS.shriver = await findPrefix(SHRIVER_PREFIX); PICKS.monument = await findPrefix(MONUMENT_PREFIX);
await fs.mkdir("assets/photos", { recursive: true });
const credits = {};
for (const [name, title] of Object.entries(PICKS)){
  if (!title){ console.log("missing", name); continue; }
  const p = await info(title), ii = p.imageinfo?.[0]; if (!ii){ console.log("no info", name, title); continue; }
  const m = ii.extmetadata || {};
  const buf = Buffer.from(await (await fetch(ii.thumburl, { headers: { "User-Agent": UA } })).arrayBuffer());
  const img = sharp(buf).rotate();
  await img.clone().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 72 }).toFile(`assets/photos/${name}-1600.webp`);
  await img.clone().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 70 }).toFile(`assets/photos/${name}-800.webp`);
  const meta = await sharp(`assets/photos/${name}-800.webp`).metadata();
  credits[name] = { title, page: ii.descriptionurl, author: strip(m.Artist?.value).slice(0, 80) || "Unknown", license: strip(m.LicenseShortName?.value), licenseUrl: strip(m.LicenseUrl?.value), ratio: +(meta.width / meta.height).toFixed(3) };
  console.log(name, credits[name].license);
  await new Promise(r => setTimeout(r, 400));
}
await fs.writeFile("assets/photos.json", JSON.stringify(credits, null, 1));
