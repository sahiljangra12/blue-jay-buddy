// Checks every link in data.js, guides.js and hours.js and writes a Markdown report.
// Run: node scripts/check-links.mjs   (exit code 1 if any link is broken)
import { readFileSync, writeFileSync } from "node:fs";

const files = ["data.js", "guides.js", "hours.js"];
const urls = new Map();
for (const f of files) {
  const text = readFileSync(f, "utf8");
  for (const m of text.matchAll(/https?:\/\/[^\s"'`<>)\\]+/g)) {
    const u = m[0].replace(/[.,;]+$/, "");
    // Skip search/map helpers and app-store search pages: they are generated, not hand-written links.
    if (/google\.com\/(maps|search)|play\.google\.com\/store\/search|apps\.apple\.com\/us\/search|\$\{/.test(u)) continue;
    if (!urls.has(u)) urls.set(u, f);
  }
}

const UA = "Mozilla/5.0 (compatible; BlueJayBuddyLinkCheck/1.0; +https://github.com/sahiljangra12/blue-jay-buddy)";
async function check(u) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const r = await fetch(u, { method, redirect: "follow", headers: { "user-agent": UA }, signal: AbortSignal.timeout(20000) });
      if (r.ok) return { ok: true, status: r.status, final: r.url };
      if (method === "GET" || ![403, 405, 501].includes(r.status)) return { ok: [401, 403, 429].includes(r.status), status: r.status, final: r.url, note: [401, 403, 429].includes(r.status) ? "blocked bots (check by hand)" : "" };
    } catch (e) {
      if (method === "GET") return { ok: false, status: 0, error: e.cause?.code || e.name };
    }
  }
}

const results = [];
const list = [...urls];
for (let i = 0; i < list.length; i += 6) {
  results.push(...await Promise.all(list.slice(i, i + 6).map(async ([u, f]) => ({ u, f, ...(await check(u)) }))));
}
const broken = results.filter(r => !r.ok), warn = results.filter(r => r.ok && r.note);
const day = new Date().toISOString().slice(0, 10);
const report = [
  `# Link check ${day}`, "",
  `Checked **${results.length}** links: **${broken.length} broken**, ${warn.length} to check by hand.`, "",
  broken.length ? "## Broken\n\n| Link | File | Result |\n|---|---|---|\n" + broken.map(r => `| ${r.u} | ${r.f} | ${r.status || r.error} |`).join("\n") : "No broken links.",
  warn.length ? "\n## Check by hand (site blocks automated checks)\n\n" + warn.map(r => `- ${r.u} (${r.status})`).join("\n") : "",
  "", "After fixing, update `reviewed` in data.js to this month.",
].join("\n");
writeFileSync("link-report.md", report);
console.log(report);
process.exit(broken.length ? 1 : 0);
