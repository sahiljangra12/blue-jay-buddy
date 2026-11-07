import type { Config } from "@netlify/functions";
import OpenAI from "openai";
import { fail, json } from "../lib/util.mts";

// Answers questions the app couldn't answer on the device. Uses Netlify AI Gateway
// (credentials are injected automatically; no API key in code). Nothing is stored.

const FACTS = `Johns Hopkins Homewood campus facts (use only if relevant; say "check the official page" for anything time-sensitive):
- Emergency on campus: 410-516-7777 (or 911). Safety escort: 410-516-4600. LiveSafe app for location sharing.
- Free JHMI shuttle ("the Jimmy") from the Interfaith Center, Scott-Bates Commons and the JHU Bookstore to Penn Station, Peabody and the medical campus. Track all JHU shuttles live in the TransLoc app; Blue Jay Shuttle night rides are requested there.
- O'Connor Recreation Center: gym, pool, climbing wall, intramurals.
- SIS (sis.jhu.edu): registration, grades, bills, holds. Canvas (canvas.jhu.edu): coursework. Handshake: jobs and internships. Life Design Lab: career coaching.
- J-Card Office: Wyman Park Building room 171, 410-516-5121. IT Help Desk 410-516-4357. Wi-Fi: eduroam with JHED@jh.edu.
- Primary Care 410-516-8270; Mental Health Services 410-516-3311 (3003 N. Charles St., Suite S-200); 988 for crisis. Sexual Assault Helpline 410-516-7333 (24/7).
- OIS (ois.jhu.edu): visas, I-20, CPT/OPT. Hopkins Food Pantry: free groceries for students.
- Nearby food: THB Bagelry & Deli (3208 St. Paul St), University Market & Deli (3201 St. Paul St), Chipotle, &pizza, Potbelly, Starbucks on St. Paul St; Kajiken and Lao Sze Chuan on 33rd St; Charles Street Market and Hopkins Café on campus.
- Student deals: DashPass for Students $4.99/mo, Uber One for Students $4.99/mo after 4-week trial, Prime Student 6-month trial then $7.49/mo, Too Good To Go for cheap surplus food.`;

const SYSTEM = `You are Blue Jay Buddy, a friendly assistant for Johns Hopkins University Homewood students.
Answer in 1-4 short sentences, plain text, no markdown, suitable to be read aloud.
Use the student's context below for questions about their own day, classes, deadlines or budget.
If you don't know a JHU-specific fact for sure, say so and point to the official office or page. Never invent phone numbers, hours, prices or deadlines.
If someone seems to be in crisis or unsafe, give 988 and the campus emergency number first.
${FACTS}`;

let modelCache: string[] | null = null;
async function models(): Promise<string[]> {
  if (modelCache) return modelCache;
  const pref = Netlify.env.get("ASK_MODEL");
  const list: string[] = pref ? [pref] : [];
  try {
    // Live list of gateway models; pick small, cheap OpenAI ones first.
    const r = await fetch("https://api.netlify.com/api/v1/ai-gateway/providers/detailed");
    const j = await r.json();
    const ids = new Set<string>();
    const walk = (v: any) => { if (!v) return; if (Array.isArray(v)) v.forEach(walk); else if (typeof v === "object") { if (typeof v.id === "string" && /^gpt/i.test(v.id)) ids.add(v.id); if (typeof v.name === "string" && /^gpt/i.test(v.name)) ids.add(v.name); Object.values(v).forEach(walk); } };
    walk(j.openai ?? j.providers?.openai ?? j);
    const small = [...ids].filter(id => /mini|nano|luna/i.test(id));
    list.push(...small, ...[...ids].filter(id => !small.includes(id)));
  } catch {}
  list.push("gpt-5-mini", "gpt-4.1-mini", "gpt-4o-mini");
  return (modelCache = [...new Set(list)]);
}

export default async (req: Request) => {
  if (!Netlify.env.get("OPENAI_BASE_URL") && !Netlify.env.get("OPENAI_API_KEY")) return fail("The assistant isn't switched on yet", 503);
  const body = await req.json().catch(() => ({}));
  const q = String(body.q || "").slice(0, 500).trim();
  if (!q) return fail("Ask a question");
  const context = String(body.context || "").slice(0, 2500);
  const history = Array.isArray(body.history) ? body.history.slice(-6).map((m: any) => ({ role: m.who === "me" ? "user" : "assistant", content: String(m.text || "").slice(0, 400) })).filter((m: any) => m.content) : [];
  const client = new OpenAI();
  const messages = [
    { role: "system", content: SYSTEM + "\n\nStudent context:\n" + context },
    ...history.slice(0, -1),
    { role: "user", content: q },
  ] as any;
  let lastErr: unknown;
  for (const model of await models()) {
    try {
      const r = await client.chat.completions.create({ model, messages, max_completion_tokens: 400 } as any);
      const answer = r.choices?.[0]?.message?.content?.trim();
      if (answer) return json({ answer, model });
    } catch (e) { lastErr = e; }
  }
  console.log("ask failed", String(lastErr));
  return fail("The assistant is busy. Try again in a moment.", 502);
};

export const config: Config = {
  path: "/api/ask",
  method: "POST",
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 10 },
};
