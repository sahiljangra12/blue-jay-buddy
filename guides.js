// Step-by-step guides. Each card in data.js can point to one with  g: "<guide id>".
// Fields: title, group (start | everyday | health), time, who, apps [{name, ios, android}], steps [], tips [], link {t,u}, phones [{t,p}]
// App Store links use the app's own page where verified; Google Play links open a search for the app.

const PLAY = q => "https://play.google.com/store/search?q=" + encodeURIComponent(q) + "&c=apps";

window.BJB_GUIDES = {
  "use-app": {
    title: "How to use Blue Jay Buddy", group: "start", time: "1 min", who: "Everyone",
    steps: [
      "Tap <b>Make it mine</b> at the top and answer a few questions. Your home screen then shows your next class, a checklist and picks for you.",
      "Use the search bar for anything. Plain words work: \"lost ID\", \"printing\", \"bus to Penn Station\".",
      "Every card has two buttons: <b>Open</b> takes you to the official site, <b>How to</b> shows steps like these.",
      "Tap the star on a card to pin it to your home screen.",
      "On a phone, use the bar at the bottom to jump between sections.",
      "Add it to your home screen. iPhone: Share → Add to Home Screen. Android: menu ⋮ → Add to Home screen. It then opens like an app, even offline.",
    ],
    tips: ["Your answers and classes stay on your device only. Clearing your browser data removes them."],
  },

  "jhed": {
    title: "Set up your JHED login and MFA", group: "start", time: "10 min", who: "New students (do this first)",
    apps: [{ name: "Microsoft Authenticator", ios: "https://apps.apple.com/app/id983156458", android: PLAY("Microsoft Authenticator") }],
    steps: [
      "Find your <b>JHED ID</b> in your Hopkins welcome email. It is your username for almost every JHU system.",
      "Sign in once at <b>my.jh.edu</b> (the myJH portal) and set your password if you have not yet.",
      "Install <b>Microsoft Authenticator</b> on your phone. Hopkins runs its two-step sign-in (MFA) on Microsoft.",
      "Go to <b>mysignins.microsoft.com/security-info</b>, sign in with <i>yourJHED</i>@jh.edu, and add the app as a sign-in method.",
      "Add a <b>backup method</b> (a phone number) on the same page, so a lost phone does not lock you out.",
    ],
    tips: ["Your sign-in address ends in <b>@jh.edu</b>, not @jhu.edu.", "Locked out? Call the IT help desk at 410-516-4357 (24/7)."],
    link: { t: "Your sign-in methods", u: "https://mysignins.microsoft.com/security-info" },
    phones: [{ t: "IT help desk", p: "410-516-4357" }],
  },

  "wifi": {
    title: "Get on campus Wi-Fi", group: "start", time: "3 min", who: "Everyone",
    steps: [
      "Open Wi-Fi settings and pick <b>hopkins</b>, the main network for students, faculty and staff.",
      "Sign in with your JHED ID and JHED password.",
      "Prefer <b>eduroam</b>? The username is <i>yourJHED</i><b>@jh.edu</b> (not @jhu.edu) with your JHED password. eduroam also works at other universities.",
      "Android phone won't connect? Set EAP method to <b>PEAP</b>, Phase 2 to <b>MSCHAPV2</b>, and Domain to <b>ad.jhu.edu</b>.",
      "Still stuck? Call the IT help desk at 410-516-4357 (24/7) or walk in to Student IT at the Campus Store, Mon–Fri 10 AM–5 PM.",
    ],
    tips: ["Mobile printing in the library needs the <b>hopkins</b> network.", "Echo, Apple TV, Chromecast and Google Home don't work on the hopkins network.", "Free Ethernet cables: Wolman Hall Housing Office, AMR II ResLife Office or the Tech Center in the Campus Store."],
    link: { t: "ResNet (student IT)", u: "https://students.jhu.edu/student-life/technology-support/it-services/resnet/" },
  },

  "canvas": {
    title: "Use Canvas for your courses", group: "start", time: "5 min", who: "Everyone taking classes",
    apps: [{ name: "Canvas Student", ios: "https://apps.apple.com/app/id480883488", android: PLAY("Canvas Student") }],
    steps: [
      "Go to <b>canvas.jhu.edu</b> and choose <b>JHU Login</b>.",
      "Your courses appear on the <b>Dashboard</b> once instructors publish them, usually just before classes start.",
      "Open <b>Calendar</b> to see every due date across all courses in one view.",
      "In the Canvas Student app, sign in by searching for Johns Hopkins, then turn on notifications for due dates and announcements.",
    ],
    tips: ["Course missing? You may still be on the waitlist in SIS, or the instructor has not published it yet."],
    link: { t: "Open Canvas", u: "https://canvas.jhu.edu" },
  },

  "sis": {
    title: "Register for classes in SIS", group: "everyday", time: "15 min", who: "Everyone, each semester",
    steps: [
      "Sign in at <b>sis.jhu.edu</b> with your JHED.",
      "Check for <b>holds</b> first. A hold blocks registration until it is cleared.",
      "Search courses and add them to your <b>shopping cart</b> ahead of time.",
      "Find your <b>registration date and time</b> (Academic Support posts the calendar). Register from your cart as soon as your window opens.",
      "Use <b>degree audit</b> to check that your courses count toward your program.",
      "SIS is also where you pay your bill, confirm or waive student health insurance, and see final grades.",
    ],
    link: { t: "Registration dates", u: "https://academicsupport.jhu.edu" },
  },

  "jcard": {
    title: "Get your J-Card and put it on your phone", group: "start", time: "5 min", who: "Everyone",
    apps: [{ name: "Transact eAccounts", ios: "https://apps.apple.com/app/id1493974212", android: PLAY("Transact eAccounts") }],
    steps: [
      "New first-year students get their <b>J-Card</b> at move-in. New graduate students taking classes at Homewood can pick one up at the <b>Student IT and ID Services Hub</b> in the JHU Campus Store, 2nd floor, 3330 St. Paul St. (Mon–Thu 10 AM–4:30 PM).",
      "Set up your two-step sign-in (MFA) first. See the JHED guide.",
      "From the first day of classes, add the <b>mobile credential</b> to Apple Wallet (iPhone and Apple Watch), Google Wallet or Samsung Wallet from the J-Card website.",
      "Hold your phone where you would tap the card: residence halls, dining, the bookstore and library printing. Your plastic card still works as a backup.",
      "Use the <b>eAccounts</b> app to check balances, add J-Cash, or turn off a lost card or phone.",
    ],
    tips: ["Lost your phone or card? Deactivate it in eAccounts right away, then contact the J-Card Office."],
    link: { t: "Mobile credential", u: "https://students.jhu.edu/student-life/technology-support/j-card/mobile-credential/" },
    phones: [{ t: "J-Card Office", p: "410-516-5121" }],
  },

  "transloc": {
    title: "Track shuttles with TransLoc", group: "start", time: "3 min", who: "Anyone who takes a shuttle",
    apps: [{ name: "TransLoc", ios: "https://apps.apple.com/us/search?term=TransLoc", android: PLAY("TransLoc") }],
    steps: [
      "Install <b>TransLoc</b> and allow location access.",
      "Choose <b>Johns Hopkins</b> as your transit system.",
      "Pick a route, such as Homewood-Peabody-JHMI, to see live bus locations and arrival times at each stop.",
      "Star the routes and stops you use so they open first.",
      "In the evening, use the same app to <b>request a Blue Jay Shuttle</b> ride (see the next guide).",
    ],
    link: { t: "Routes and schedules", u: "https://jhfre.jhu.edu/ts/transportation/shuttle-services" },
    phones: [{ t: "Transportation office", p: "410-516-7275" }],
  },

  "bluejay": {
    title: "Get a free night ride (Blue Jay Shuttle)", group: "everyday", time: "2 min", who: "Students near Homewood at night",
    apps: [{ name: "TransLoc", ios: "https://apps.apple.com/us/search?term=TransLoc", android: PLAY("TransLoc") }],
    steps: [
      "Night Ride requests open at <b>6 PM</b>. Requests made before 2 AM are honored.",
      "Open TransLoc and request a <b>Night Ride</b>, or call <b>410-516-8700</b>. The app needs a 10-digit phone number and your Hopkins email.",
      "Enter your pickup and drop-off. Both must be inside the Blue Jay Shuttle service area. Rides are curb to curb.",
      "Be ready outside: the van waits up to 3 minutes. At busy times dispatch may send a free Lyft instead. You don't need the Lyft app.",
    ],
    tips: ["Feeling unsafe while you wait? Call the safety escort at 410-516-4600.", "From midnight to 5 AM, eligible students can also use Lyft SafeRide. See the shuttle page."],
    phones: [{ t: "Night Ride dispatch", p: "410-516-8700" }],
    link: { t: "Shuttle services", u: "https://jhfre.jhu.edu/ts/transportation/shuttle-services" },
  },

  "jhmi": {
    title: "Ride the JHMI shuttle (\"the Jimmy\")", group: "everyday", time: "2 min", who: "Going to Penn Station, Peabody or the hospital",
    steps: [
      "At Homewood, board at <b>Charles Commons</b>, the <b>Interfaith Center</b> or the <b>JHU Bookstore</b>.",
      "The route stops at Penn Station and the Peabody Institute on the way to the East Baltimore medical campus.",
      "See live arrival times on the Shuttles page here, or in TransLoc.",
    ],
    tips: ["Times change by day and semester, so check the current schedule before a trip."],
    link: { t: "Current schedule", u: "https://jhfre.jhu.edu/ts/transportation/shuttle-services" },
  },

  "citybus": {
    title: "Take city buses (free Circulator and MTA)", group: "everyday", time: "3 min", who: "Exploring Baltimore",
    steps: [
      "<b>Charm City Circulator, Purple route</b>: always free. It runs from 33rd Street to Federal Hill, about every 13 minutes.",
      "<b>MTA city buses</b> go farther across Baltimore. Check routes and live times at mta.maryland.gov.",
    ],
    link: { t: "Circulator routes", u: "https://www.baltimorecity.gov/transportation/charm-city-circulator" },
  },

  "mobile-order": {
    title: "Order food ahead on your phone", group: "everyday", time: "3 min", who: "Anyone eating on campus",
    apps: [{ name: "Transact Mobile Ordering", ios: "https://apps.apple.com/app/id1494719529", android: PLAY("Transact Mobile Ordering") }],
    steps: [
      "Install <b>Transact Mobile Ordering</b>.",
      "Choose the campus <b>Johns Hopkins University Homewood</b> and sign in with your JHED.",
      "Pick a location that offers mobile ordering (Nolan's on 33rd is one), choose your food and pay with meal swipes, Dining Dollars or another listed option.",
      "Pick up when the app says your order is ready, using the barcode it gives you.",
    ],
    link: { t: "Where to eat and hours", u: "https://studentaffairs.jhu.edu/dining/where-to-eat/" },
    phones: [{ t: "Dining office", p: "410-516-3383" }],
  },

  "printing": {
    title: "Print and scan on campus", group: "everyday", time: "5 min", who: "Everyone",
    steps: [
      "Library printers are in the MSE Library Annex, Brody Learning Commons and the Hutzler Reading Room. You need your J-Card.",
      "Cost: 7¢ per black-and-white page, 20¢ per color side. Color is only in Brody and the Annex. Charges come from your J-Cash.",
      "<b>Easiest way:</b> connect to the <b>Hopkins</b> Wi-Fi and email one PDF, Word or Excel file per message to <b>jhubwmobile@jh.edu</b> (black and white) or <b>jhucolormobile@jh.edu</b> (color). For double-sided, use jhubwdsmobile@jh.edu or jhucolordsmobile@jh.edu. The first time, follow the registration link in the reply.",
      "Walk to any library printer, tap your J-Card and pick your job from the list. Jobs wait for 2 hours.",
      "Scanning to email is free.",
    ],
    tips: ["Only letter-size paper. A4 files won't print by email."],
    link: { t: "Library printing FAQ", u: "https://ask.library.jhu.edu/library-buildings/faq/409803" },
  },

  "livesafe": {
    title: "Set up the LiveSafe safety app", group: "start", time: "3 min", who: "Everyone",
    apps: [{ name: "LiveSafe", ios: "https://apps.apple.com/app/id653666211", android: PLAY("LiveSafe") }],
    steps: [
      "Install <b>LiveSafe</b> and create a profile.",
      "Choose <b>Johns Hopkins</b> as your organization, then your campus and affiliation.",
      "Use it to message security with text, photos or video, get campus alerts, request an escort, or share your live location with a friend.",
    ],
    tips: ["In an emergency, call 911 or 410-516-7777 first. The app is for everything else."],
    link: { t: "LiveSafe at JHU", u: "https://publicsafety.jhu.edu/resources-services/livesafe-app/" },
  },

  "escort": {
    title: "Get a safety escort", group: "health", time: "1 min", who: "Anyone who feels unsafe or unwell",
    steps: [
      "Call Campus Safety and Security at <b>410-516-4600</b>.",
      "Say where you are and where you are going. Security sends a walking or vehicle escort on or around campus.",
      "Wait inside or in a well-lit spot until they arrive.",
    ],
    tips: ["Late at night, the Blue Jay Shuttle in TransLoc is another free option."],
    phones: [{ t: "Safety escort", p: "410-516-4600" }, { t: "Emergency", p: "410-516-7777" }],
  },

  "emergency": {
    title: "In an emergency", group: "health", time: "1 min", who: "Everyone. Read it now, not later.",
    steps: [
      "Call <b>911</b> or Homewood Campus Safety at <b>410-516-7777</b>.",
      "Say your exact location first: building, floor, room, or the nearest street corner.",
      "Say what happened and whether anyone is hurt. Stay on the line.",
      "Blue-light emergency phones around campus connect straight to security.",
    ],
    phones: [{ t: "Campus emergency", p: "410-516-7777" }, { t: "Maryland Poison Center", p: "800-222-1222" }],
  },

  "health": {
    title: "See a doctor or nurse", group: "health", time: "5 min", who: "Students who are sick or need care",
    steps: [
      "Book online in the <b>myHealth portal</b> (myhealth.wellbeing.jhu.edu). Sign in with <i>yourJHED</i>@jh.edu. Or call <b>410-516-3311</b>.",
      "The Homewood clinic is at <b>1 E. 31st Street, 2nd floor</b>. The entrance is on 31st Street.",
      "Clinic hours: Mon, Tue, Thu, Fri 8:30 AM–4:45 PM (closed 12–12:45); Wed 12:45–4:45 PM.",
      "When the clinic is closed, a nurse line answers medical questions. For a life-threatening emergency, call 911.",
    ],
    tips: ["Thanksgiving week: open Mon–Tue, Wed morning only, closed Thu–Fri.", "Students in online-only programs use TimelyCare instead."],
    link: { t: "Primary Care", u: "https://wellbeing.jhu.edu/PrimaryCare/contact-information/" },
    phones: [{ t: "Primary Care", p: "410-516-3311" }],
  },

  "mental": {
    title: "Talk to someone (mental health)", group: "health", time: "5 min", who: "Anyone feeling stressed, low or overwhelmed",
    steps: [
      "Call Mental Health Services at <b>410-516-3311</b>, or book in the <b>myHealth portal</b>.",
      "The Homewood office is at 3003 N. Charles Street, Suite S-200. Use the South Entrance and go to the 2nd floor.",
      "Students in online-only programs can use TimelyCare instead.",
      "In a crisis, call the <b>Behavioral Health Crisis Support Team at 410-516-9355</b> (24/7), call or text <b>988</b>, or call 911.",
    ],
    tips: ["After hours, 410-516-3311 connects you to a licensed clinician.", "TimelyCare's Talk Now offers a video session with a provider 24/7."],
    link: { t: "Mental Health Services", u: "https://wellbeing.jhu.edu/MentalHealthServices/contact-information" },
    phones: [{ t: "Mental Health Services", p: "410-516-3311" }, { t: "Crisis Support Team (24/7)", p: "410-516-9355" }, { t: "Sexual Assault Helpline (24/7)", p: "410-516-7333" }],
  },

  "ois": {
    title: "International student check-in (OIS)", group: "start", time: "30 min", who: "New F-1 and J-1 students",
    steps: [
      "Watch for an email from OIS. Most check-ins are done in <b>iHopkins</b>, OIS's portal.",
      "Review the online orientation for your status (F-1 or J-1).",
      "Upload your immigration documents as the SEVIS check-in upload instructions describe, including your I-94 from the CBP website.",
      "Submit, then watch for the approval email.",
    ],
    tips: ["Do it as soon as you arrive. OIS's email gives your deadline.", "F-1 students can't be cleared for an on-campus job until check-in is approved."],
    link: { t: "OIS check-in", u: "https://ois.jhu.edu/Students/New_Students/CheckIn_Process/" },
  },

  "groups": {
    title: "Find clubs and events", group: "everyday", time: "5 min", who: "Everyone",
    apps: [{ name: "CampusGroups", ios: "https://apps.apple.com/us/search?term=CampusGroups", android: PLAY("CampusGroups") }],
    steps: [
      "Sign in to <b>Hopkins Groups</b> at jhu.campusgroups.com with your JHED.",
      "Browse <b>Groups</b> and join a few that interest you, such as sports, culture, service or your department.",
      "Check <b>Events</b> each week. Today on this app also lists them, with a free-food filter.",
      "RSVP to events you plan to attend.",
    ],
    link: { t: "Hopkins Groups", u: "https://jhu.campusgroups.com" },
  },

  "handshake": {
    title: "Find a job or internship", group: "everyday", time: "15 min", who: "Students looking for work",
    apps: [{ name: "Handshake", ios: "https://apps.apple.com/app/id1220620171", android: PLAY("Handshake jobs") }],
    steps: [
      "Sign in to <b>Handshake</b> with your JHU account and complete your profile. Recruiters search profiles.",
      "Upload a resume. The Life Design Lab can review it first.",
      "Filter for <b>on-campus jobs</b> or internships, and turn on alerts for saved searches.",
      "Apply, then track your applications in Handshake.",
    ],
    tips: ["International students: check with OIS before starting any job."],
    link: { t: "Life Design Lab", u: "https://studentaffairs.jhu.edu/life-design/" },
  },

  "library": {
    title: "Use the library", group: "everyday", time: "3 min", who: "Everyone",
    steps: [
      "The main Homewood library is the Milton S. Eisenhower Library (MSE), connected to the Brody Learning Commons.",
      "Search books, articles and databases from the library website. Off campus, you sign in with your JHED.",
      "Book a group study room online before you go during busy weeks.",
      "Stuck on research? Use <b>Ask a Librarian</b> on the website.",
    ],
    link: { t: "Sheridan Libraries", u: "https://www.library.jhu.edu" },
  },

  "rec": {
    title: "Use the rec center", group: "everyday", time: "2 min", who: "Everyone",
    steps: [
      "Install the <b>Johns Hopkins Rec</b> app, sign in with your JHED, and activate your membership under Membership Services → Membership Sales. You must do this before your first visit.",
      "Membership is included in tuition for full-time KSAS and Whiting undergrads and grad students. Part-time students and other schools can buy one in the app.",
      "Show your J-Card at the entrance, or the app's digital ID if you forgot it.",
      "It has weight rooms, a pool, a climbing wall, a bouldering cave, basketball and squash courts and an indoor track. Book group fitness classes and squash courts in the app.",
      "Want a team? Sign up for intramurals or club sports. Volleyball, soccer and more run each semester.",
    ],
    tips: ["Fall hours: Mon–Thu 6 AM–11 PM, Fri 6 AM–9 PM, Sat 8 AM–9 PM. Closed Nov 25–29 for Thanksgiving.", "Pool times are on the pool calendar. Climbing wall times are posted on @jhuclimbingwall."],
    apps: [{ name: "Johns Hopkins Rec", ios: "https://apps.apple.com/app/id1524524288", android: PLAY("Johns Hopkins Rec") }],
    link: { t: "Rec center hours", u: "https://students.jhu.edu/student-life/get-involved/oconnor-center-for-recreation-well-being/hours-of-operation/" },
    phones: [{ t: "Membership services", p: "410-516-5229" }],
  },

  "insurance": {
    title: "Enroll in or waive student health insurance", group: "start", time: "15 min", who: "New students, and everyone once a year",
    steps: [
      "Hopkins students need health insurance. You are placed on the university student plan unless you waive it.",
      "<b>International students on an F-1 or J-1 visa cannot waive</b> the university plan. You stay enrolled; nothing more to do.",
      "To waive, your own plan must be ACA-compliant, cover essential health benefits, cover you in the state where you live during the semester, and stay active for the whole academic year.",
      "Submit the waiver form through <b>SIS</b> during the enrollment window. The student plan's website explains each step.",
      "Do it again <b>every academic year</b>, even if your insurance has not changed.",
    ],
    tips: ["For 2026–27, the fall waiver window ran July 1 to September 15.", "Waivers are only for full-time, degree-seeking students taking at least one in-person course."],
    link: { t: "Student health plan", u: "https://jhu.myahpcare.com" },
  },

  "calendar": {
    title: "Find key dates (add/drop, breaks, finals)", group: "start", time: "2 min", who: "Everyone, each semester",
    steps: [
      "Open the university's <b>divisional academic calendars</b> page and choose the calendar for your school (Krieger or Whiting for most Homewood students).",
      "Note the first day of classes, the <b>add/drop deadline</b>, the withdrawal deadline, breaks and the final exam period.",
      "Put those dates in your own phone calendar. Your registration time slot is shown in <b>SIS</b>.",
      "Graduate programs can have different deadlines. When in doubt, ask your department's academic coordinator.",
    ],
    link: { t: "Academic calendars", u: "https://registrar.jhu.edu/academic-calendar/divisional-academic-calendars" },
  },

  "lost": {
    title: "Lost something on campus", group: "everyday", time: "3 min", who: "Anyone who lost or found an item",
    steps: [
      "Lost your <b>J-Card</b> or phone? Turn it off right away in the <b>eAccounts</b> app, then contact the J-Card Office (see the J-Card guide).",
      "For anything else, check the <b>recovered property list</b> on the Public Safety lost and found page. It is updated twice a month.",
      "If you see your item, call Lost and Found to make an appointment. Bring your J-Card or another photo ID. Can't come during office hours? Ask about an after-hours pickup.",
      "Found something? Drop it at Public Safety, 3001 Remington Ave., Mon–Fri 9 AM–4 PM. Items are kept for 30 days.",
    ],
    tips: ["Report a lost item quickly; it improves the chance of getting it back.", "Lost a laptop or phone? Also mark it lost in Find My (Apple) or Find My Device (Google)."],
    link: { t: "Lost and found", u: "https://publicsafety.jhu.edu/resources-services/services-for-you/lost-and-found/" },
    phones: [{ t: "Lost and Found", p: "410-516-5278" }],
  },
};
