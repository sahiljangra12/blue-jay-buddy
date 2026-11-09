// Builds a short, silent, looping background video from an openly licensed Wikimedia Commons clip.
// Output: assets/video/<name>.mp4 (H.264), .webm (VP9) and a poster .jpg, plus assets/video/videos.json with credits.
import fs from "node:fs/promises";
import { execFileSync } from "node:child_process";
const UA = "BlueJayBuddy/1.0 (https://github.com/sahiljangra12/blue-jay-buddy)";
const strip = s => String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const CLIPS = { "baltimore-aerial": { title: "Aerial views of Oriole Park at Camden Yards, Baltimore, Maryland, USA.webm", start: 6, len: 14 } };
await fs.mkdir("assets/video", { recursive: true });
const credits = {};
for (const [name, c] of Object.entries(CLIPS)){
  const u = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({ action: "query", format: "json", titles: "File:" + c.title, prop: "videoinfo", viprop: "url|extmetadata|derivatives" });
  const j = await (await fetch(u, { headers: { "User-Agent": UA } })).json();
  const v = Object.values(j.query.pages)[0].videoinfo[0], m = v.extmetadata || {};
  const src = (v.derivatives || []).filter(d => /webm|mp4/.test(d.type) && d.height >= 1000).sort((a, b) => a.height - b.height)[0]?.src || v.url;
  const buf = Buffer.from(await (await fetch(src, { headers: { "User-Agent": UA } })).arrayBuffer());
  await fs.writeFile("/tmp/in-" + name, buf);
  const common = ["-y", "-ss", String(c.start), "-t", String(c.len), "-i", "/tmp/in-" + name, "-an", "-vf", "scale=1920:-2,fps=30"];
  execFileSync("ffmpeg", [...common, "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-pix_fmt", "yuv420p", "-movflags", "+faststart", `assets/video/${name}.mp4`], { stdio: "inherit" });
  execFileSync("ffmpeg", [...common, "-c:v", "libvpx-vp9", "-crf", "38", "-b:v", "0", "-row-mt", "1", `assets/video/${name}.webm`], { stdio: "inherit" });
  execFileSync("ffmpeg", ["-y", "-ss", String(c.start + 1), "-i", "/tmp/in-" + name, "-frames:v", "1", "-vf", "scale=1600:-2", "-q:v", "4", `assets/video/${name}.jpg`], { stdio: "inherit" });
  credits[name] = { title: c.title, page: v.descriptionurl, author: strip(m.Artist?.value).slice(0, 80) || "Unknown", license: strip(m.LicenseShortName?.value), licenseUrl: strip(m.LicenseUrl?.value) };
}
await fs.writeFile("assets/video/videos.json", JSON.stringify(credits, null, 1));
