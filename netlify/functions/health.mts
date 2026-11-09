import type { Config } from "@netlify/functions";
import { json } from "../lib/cors.mts";

// Tells the app which server features are on. The VAPID public key is meant to be public.
export default async (req: Request) => json(req, { push: !!(Netlify.env.get("VAPID_PUBLIC_KEY") && Netlify.env.get("VAPID_PRIVATE_KEY")), publicKey: Netlify.env.get("VAPID_PUBLIC_KEY") || null });
export const config: Config = { path: "/api/health", method: "GET" };
