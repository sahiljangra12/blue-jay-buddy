# Blue Jay Buddy

A no-login student hub for Johns Hopkins University's Homewood campus. Open it and the first screen answers "what do I need right now?": your next class, what's due, what's open, and the one thing that matters at this time of day.

**Live:** https://sahiljangra12.github.io/blue-jay-buddy/ (also at https://blue-jay-buddy.netlify.app)

## What it does

- **Today screen.** Next class with a countdown and directions (or a Join button for online classes), Canvas deadlines for the next 7 days, "Open now" status for the rec center and Brody, and your next checklist steps.
- **Changes with the time of day.** Mornings show shuttles and order-ahead coffee; lunchtime shows dining; late at night it puts the free night ride, the safety escort and Brody's hours on top; Sunday evening shows your week ahead; weekends show events and free things in Baltimore.
- **Schedule from a screenshot.** Upload your SIS class schedule as a PDF, screenshot or photo. It's read on your device (PDF.js and Tesseract.js) and you check every class before saving.
- **Canvas deadlines.** Paste your private Canvas Calendar Feed link once (no password). Assignments appear on Today and in Classes → Due, with tick-off. You can also upload the calendar file or add your own deadlines.
- **Make it mine.** A 1-minute setup builds a personal checklist and picks for your program, home and interests.
- **20+ step-by-step guides** with App Store and Google Play buttons (JHED and MFA, Wi-Fi, J-Card on your phone, TransLoc, night rides, printing, health, OIS check-in and more).
- **Live on Today.** Weather with a heads-up before class ("Rain likely around 1 PM. Take an umbrella for Applied Statistics."), the next JHMI shuttle from Homewood, and the next key semester date (breaks, last day of classes, finals).
- **Live shuttle board.** Arrival times for the JHMI, Keswick, Remington, Hampden, Night Ride and other routes, from the same feed as the official Hopkins shuttle tracker. Refreshes every 30 seconds.
- **What's on at Hopkins.** Today's and this week's events from Hopkins Groups' public calendar, with a "Free food" filter. Refreshed every 2 hours by a GitHub Action (`scripts/build-events.mjs` → `events.json`).
- **Deadline reminders.** Add your deadlines to your phone's calendar with alerts 24 hours and 2 hours before (works everywhere), or turn on push notifications (needs the Netlify functions).
- **Study tools.** GPA calculator on the Registrar's scale, a "what do I need on the final" calculator, and a focus timer.
- **Emergency card.** Every verified safety and crisis number in one place, works offline, and saves to your contacts in one tap.
- **Live shuttle map**, event filters by type with add-to-calendar, and a "leave by" time for your next in-person class.
- **Display and backup.** Larger text, high contrast, and a backup file to move your setup to a new phone.
- **Calls always ask first**, so nobody dials the emergency line by accident.
- Installable on phones, works offline, light and dark mode. Black, cinematic design with real Homewood photography (public domain and Creative Commons, credited in the footer), Lucide icons and the Barlow typeface.

## Trust and quality

- **Accurate information.** Every phone number, address, hour and date was checked against official Johns Hopkins pages in November 2026; anything that couldn't be confirmed was removed. Every card shows when it was last checked and has a "Report a problem" link. Opening hours come only from official pages; outside the dates they cover, the app says "Check hours" instead of guessing.
- **Monthly link check.** A GitHub Action checks every link on the 1st of each month and opens an issue titled "Broken links" if anything fails. Run it any time from the Actions tab.
- **Privacy.** No login, no tracking cookies, no ads, no referral or affiliate links. See [privacy.html](privacy.html).
- **Usage numbers.** One anonymous ping per browser per day, with nothing about the person stored. Totals are public at [stats.html](stats.html).
- **Accessibility.** Checked with axe-core (WCAG 2.1 A and AA): labelled controls, visible focus, sufficient contrast, reduced-motion support.
- **User testing.** [docs/user-testing.md](docs/user-testing.md) is a 30-minute script for testing with five students.

## Editing content

| File | What it holds |
|---|---|
| `data.js` | Links, phone numbers, buildings. Update `reviewed` after each check. |
| `guides.js` | Step-by-step guides |
| `hours.js` | Opening hours by date range (rec center, Brody). Copy only from official pages. |
| `data.js` → `keyDates` | Semester dates from the official academic calendar |
| `live.js` | Weather (Open-Meteo), shuttle feed and shuttle route list |

When you change any file, bump `VERSION` in `sw.js` and the `?v=` numbers in `index.html`.

## Server helpers (Netlify, `netlify/functions/`)

| Endpoint | Purpose |
|---|---|
| `/api/ics` | Fetches a Canvas Calendar Feed for the browser (Canvas hosts only; the link isn't stored) |
| `/api/hit` | Anonymous once-a-day usage ping |
| `/api/stats` | Daily usage totals for the last 30 days |
| `/api/push`, `/api/push/off` | Saves or removes a phone's push subscription and its deadlines |
| `push-check` (scheduled, every 15 min) | Sends the 24-hour and 2-hour deadline reminders |
| `/api/health` | Shows whether push reminders are set up |

Push reminders need `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT` in the Netlify environment.

The GitHub Pages copy calls these on `blue-jay-buddy.netlify.app`.

## Run locally

```bash
python3 -m http.server 8000      # static site only
npx netlify dev                  # site + server helpers
```

## Disclaimer

An independent student project, not an official Johns Hopkins University website. The illustrations are original artwork drawn in code.

## License

MIT
