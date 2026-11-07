# Blue Jay Buddy

Everything a Johns Hopkins Homewood student looks for, in one app: today's classes, Canvas deadlines and grades, a degree-requirement tracker, food on a budget, shuttles, campus services, study groups and a voice assistant.

**Live:** https://blue-jay-buddy.netlify.app (full version) · https://sahiljangra12.github.io/blue-jay-buddy/ (forwards to the full version)

## How it's organised

Five tabs, nothing else:

| Tab | What's in it |
|---|---|
| **Today** | Next class with a countdown and walking directions, what's due in the next 7 days, late work, gym open/closed, food budget left, shuttles, weather, and a setup checklist. |
| **Classes** | My week · Due (Canvas + Gradescope + your own deadlines) · Grades (Canvas) · My program (core areas, electives, capstone, with Fall/Spring offerings). |
| **Food & Money** | Weekly budget with a meal plan that fits it · Eat nearby (live, from your location) · Groceries · Student deals and apps. |
| **Campus** | Get around · Groups · Gym & fun · Health · Services · Safety · Buildings · Step-by-step guides. Every link says *when* you'd use it. |
| **Ask** | Tap the mic and ask: "What's my plan today?", "Where's my next class?", "Cheap veg food under $10". Answers are read aloud. |

Search at the top covers guides, links, food, deals and buildings.

## Features

- **Schedule upload.** Upload the SIS class schedule as a PDF, a screenshot, or a photo of the screen. It is read on the device (PDF.js + Tesseract.js OCR), course codes, days, times and rooms are found, and the student confirms before saving. Missing times are filled from the public SIS class search.
- **Canvas.** The student pastes their private Canvas *Calendar Feed* link (no password). Deadlines, late work and Gradescope deadlines that sync to Canvas appear in Classes → Due. An optional Canvas access token adds grades and "new grade posted" alerts.
- **Alerts.** In-app inbox plus phone notifications: 24 hours and 2 hours before something is due (sent by the server even when the app is closed), late work, and new grades.
- **Degree tracker.** Requirements from the official e-catalogue. Ships with the MSE in Data Science (all three plans). Courses are assigned to requirement slots automatically without double counting.
- **Budget optimiser.** Weekly budget + diet (veg, veg+eggs, vegan, non-veg) + how often you cook → a grocery basket and meals out that fit what's left this week. Log spending in one line.
- **Eat nearby.** Restaurants within a 12-minute walk from OpenStreetMap, filtered by diet and price, with typical prices for popular spots, directions and DoorDash links.
- **Deals & apps.** DashPass for Students, Uber One for Students, Prime Student, Too Good To Go, Weee!, Rakuten, UNiDAYS and more, with how to verify. Each has a `ref` field for referral links.
- **Groups.** Study groups for each course and interest groups. Sign-up is limited to @jh.edu emails. Posts, members-only chat links, and reporting (3 reports hide a post or group).
- **Voice assistant.** Speech recognition and read-aloud run in the browser. Common questions are answered instantly from the student's own data; anything else goes to an AI model through Netlify AI Gateway.
- Installable, works offline, light and dark mode, calls always ask before dialing.

## Privacy

Classes, budget, program progress and settings stay in the browser. Schedule files are read on the device and never uploaded. The Canvas link and token pass through the server only to fetch Canvas data; the link is stored only for push alerts and is deleted when alerts are turned off. Blue Jay Buddy never asks for a JHED password.

## Editing content

| File | What it holds |
|---|---|
| `data.js` | Links, phone numbers, buildings, rec hours |
| `guides.js` | Step-by-step guides |
| `programs.js` | Degree requirements (add programs here from the e-catalogue) |
| `food-data.js` | Restaurants with typical prices, grocery baskets, stores, deals, apps, referral links (`ref`) |

When you change any file, bump `VERSION` in `sw.js` and the `?v=` numbers in `index.html`.

## Server (Netlify functions, `netlify/functions/`)

| Endpoint | Purpose |
|---|---|
| `/api/health` | Which server features are on |
| `/api/ics` | Fetch a Canvas calendar feed (Canvas hosts only) |
| `/api/canvas` | Read-only Canvas API pass-through with the student's token |
| `/api/sis` | Course offerings by term and meeting times (needs `SIS_API_KEY`) |
| `/api/push/*` + `push-check` (hourly) | Push alerts for upcoming deadlines (needs `VAPID_*`) |
| `/api/ask` | AI answers through Netlify AI Gateway |
| `/api/groups/*` + `identity` | Groups, JHU-email-only accounts (Netlify Identity) |

Environment variables: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, optional `SIS_API_KEY` (free from https://sis.jhu.edu/api), optional `ASK_MODEL`.

## Run locally

```bash
python3 -m http.server 8000      # app only
npx netlify dev                  # app + server
```

## Disclaimer

An independent student project, not an official Johns Hopkins University website. Prices are typical estimates; hours, deals and requirements change. Every card links to the official source. Illustrations are original artwork drawn in code.

## License

MIT
