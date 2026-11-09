// Shared CORS helper: the site is served from both GitHub Pages and Netlify,
// and the GitHub Pages copy calls these functions on the Netlify domain.
const ALLOWED = ["https://sahiljangra12.github.io", "https://blue-jay-buddy.netlify.app"];
export const cors = (req: Request): Record<string, string> => {
  const o = req.headers.get("origin") || "";
  const ok = ALLOWED.includes(o) || /^https:\/\/[\w-]+--blue-jay-buddy\.netlify\.app$/.test(o) || /^http:\/\/localhost(:\d+)?$/.test(o);
  return ok ? { "access-control-allow-origin": o, "vary": "origin", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "content-type" } : {};
};
export const json = (req: Request, data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...cors(req) } });
