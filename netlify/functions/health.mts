import type { Config } from "@netlify/functions";
import { json } from "../lib/util.mts";

// Tells the app which server features are switched on.
// CORS for the GitHub Pages copy only, so it can detect the full version and forward visitors here.
export default async (req: Request) => json({
  ok: true,
  ai: !!(Netlify.env.get("OPENAI_BASE_URL") || Netlify.env.get("OPENAI_API_KEY")),
  sis: !!Netlify.env.get("SIS_API_KEY"),
  push: !!(Netlify.env.get("VAPID_PUBLIC_KEY") && Netlify.env.get("VAPID_PRIVATE_KEY")),
}, 200, req.headers.get("origin") === "https://sahiljangra12.github.io" ? { "access-control-allow-origin": "https://sahiljangra12.github.io" } : {});

export const config: Config = { path: "/api/health", method: "GET" };
