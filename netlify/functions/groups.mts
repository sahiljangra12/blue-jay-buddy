import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { fail, json, sha } from "../lib/util.mts";

// Groups for signed-in JHU students: study groups per course plus interest groups.
// Storage layout (one write per key, no read-modify-write):
//   groups/<id>                 group record (written once)
//   members/<id>/<userHash>     one key per member
//   posts/<id>/<time>-<rand>    one key per post
//   reports/<id>/<target>/<userHash>  one key per report; 3+ reports hide the group or post
// Members are shown by display name (the part of the email before @), never the full email.

const JHU = /@(jh|jhu|jhmi)\.edu$/i;
const KINDS = ["study", "interest", "sports", "food", "housing", "rides", "other"];
const HIDE_AT = 3;

async function currentUser(req: Request, context: Context) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : context.cookies.get("nf_jwt");
  if (!token) return null;
  const origin = new URL(req.url).origin;
  const r = await fetch(origin + "/.netlify/identity/user", { headers: { authorization: "Bearer " + token } });
  if (!r.ok) return null;
  const u = await r.json();
  if (!u?.email || !JHU.test(u.email)) return null;
  return { id: String(u.id), email: String(u.email).toLowerCase(), hash: await sha("u:" + u.id), name: String(u.email).split("@")[0] };
}

const clean = (s: unknown, n: number) => String(s ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const count = async (store: ReturnType<typeof getStore>, prefix: string) => (await store.list({ prefix })).blobs.length;

export default async (req: Request, context: Context) => {
  const user = await currentUser(req, context);
  if (!user) return fail("Sign in with your JHU email to use groups.", 401);
  const store = getStore({ name: "groups", consistency: "strong" });
  const parts = new URL(req.url).pathname.replace(/^\/api\/groups\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  const [gid, action] = parts;

  // List all groups
  if (!gid && req.method === "GET") {
    const { blobs } = await store.list({ prefix: "groups/" });
    const groups = (await Promise.all(blobs.map(async b => {
      const g = await store.get(b.key, { type: "json" }) as any;
      if (!g) return null;
      const [members, reports, member] = await Promise.all([count(store, `members/${g.id}/`), count(store, `reports/${g.id}/group/`), store.get(`members/${g.id}/${user.hash}`)]);
      if (reports >= HIDE_AT) return null;
      return { id: g.id, name: g.name, kind: g.kind, course: g.course, about: g.about, created: g.created, members, member: !!member };
    }))).filter(Boolean).sort((a: any, b: any) => (b.member - a.member) || (b.members - a.members) || (b.created - a.created));
    return json({ groups });
  }

  // Create a group
  if (!gid && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    const name = clean(b.name, 60);
    if (name.length < 3) return fail("Give the group a name (3+ characters).");
    const kind = KINDS.includes(b.kind) ? b.kind : "other";
    const course = /^[A-Z]{2}\.\d{3}\.\d{3}$/.test(String(b.course || "")) ? String(b.course) : "";
    let link = clean(b.link, 300);
    if (link && !/^https:\/\/[^\s]+$/i.test(link)) return fail("The chat link must start with https://");
    // Only allow common group-chat hosts so links can't point anywhere odd.
    if (link && !/^https:\/\/([\w-]+\.)*(groupme\.com|chat\.whatsapp\.com|discord\.gg|discord\.com|t\.me|slack\.com|teams\.microsoft\.com|signal\.group|instagram\.com|campusgroups\.com|jhu\.edu)(\/|$)/i.test(link)) return fail("Use a GroupMe, WhatsApp, Discord, Telegram, Slack, Teams or Signal link.");
    const id = "g-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const g = { id, name, kind, course, about: clean(b.about, 200), link, created: Date.now(), by: user.hash };
    await store.setJSON(`groups/${id}`, g, { onlyIfNew: true });
    await store.set(`members/${id}/${user.hash}`, user.name);
    return json({ id });
  }

  const g = await store.get(`groups/${gid}`, { type: "json" }) as any;
  if (!g) return fail("That group doesn't exist anymore.", 404);
  const isMember = !!(await store.get(`members/${gid}/${user.hash}`));

  if (!action && req.method === "GET") {
    const [members, reports] = await Promise.all([count(store, `members/${gid}/`), count(store, `reports/${gid}/group/`)]);
    if (reports >= HIDE_AT) return fail("This group was hidden after reports.", 404);
    const { blobs } = await store.list({ prefix: `posts/${gid}/` });
    const recent = blobs.map(b => b.key).sort().reverse().slice(0, 50);
    const posts = (await Promise.all(recent.map(async key => {
      const p = await store.get(key, { type: "json" }) as any;
      if (!p) return null;
      const rc = await count(store, `reports/${gid}/${p.id}/`);
      return rc >= HIDE_AT ? null : { id: p.id, by: p.by, text: p.text, at: p.at };
    }))).filter(Boolean);
    return json({ group: { id: g.id, name: g.name, kind: g.kind, course: g.course, about: g.about, created: g.created, members, member: isMember, link: isMember ? g.link : "" }, posts });
  }
  if (req.method !== "POST") return fail("Use POST", 405);
  if (action === "join") { await store.set(`members/${gid}/${user.hash}`, user.name); return json({ ok: true }); }
  if (action === "leave") { await store.delete(`members/${gid}/${user.hash}`); return json({ ok: true }); }
  if (action === "posts") {
    if (!isMember) return fail("Join the group to post.", 403);
    const b = await req.json().catch(() => ({}));
    const text = clean(b.text, 600);
    if (!text) return fail("Write something first.");
    const pid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await store.setJSON(`posts/${gid}/${String(Date.now()).padStart(15, "0")}-${pid}`, { id: pid, by: user.name, text, at: Date.now(), uh: user.hash });
    return json({ ok: true });
  }
  if (action === "report") {
    const b = await req.json().catch(() => ({}));
    const target = /^[\w-]{4,40}$/.test(String(b.post || "")) ? String(b.post) : "group";
    await store.set(`reports/${gid}/${target}/${user.hash}`, String(Date.now()));
    console.log(`report: group ${gid} target ${target}`);
    return json({ ok: true });
  }
  return fail("Not found", 404);
};

export const config: Config = {
  path: ["/api/groups", "/api/groups/*"],
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 60 },
};
