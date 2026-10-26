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
      "On a phone, use the bar at the bottom: Home, Guides, My plan, Shuttles and Safety.",
      "Add it to your home screen. iPhone: Share → Add to Home Screen. Android: menu ⋮ → Add to Home screen. It then opens like an app, even offline.",
    ],
    tips: ["Your answers and classes stay on your device only. Clearing your browser data removes them."],
  },

  "jhed": {
    title: "Set up your JHED login and MFA", group: "start", time: "10 min", who: "New students (do this first)",
    apps: [{ name: "Microsoft Authenticator", ios: "https://apps.apple.com/app/id983156458", android: PLAY("Microsoft Authenticator") }],
    steps: [
      "Find your <b>JHED ID</b> in your Hopkins welcome email. It is your username for almost every JHU system.",
      "Sign in once at <b>my.jh.edu</b> and set your password if you have not yet.",
      "Install an authenticator app on your phone. JHU's sign-in uses Microsoft's MFA, so Microsoft Authenticator is the easiest choice.",
      "Go to <b>aka.ms/mfasetup</b>, sign in with <i>yourJHED</i>@jh.edu, and add the app as your sign-in method.",
      "Add a <b>backup method</b> (a phone number) on the same page, so a lost phone does not lock you out.",
    ],
    tips: ["Your sign-in address ends in <b>@jh.edu</b>, not @jhu.edu.", "Locked out? Call the IT help desk at 410-516-4357."],
    link: { t: "MFA setup", u: "https://aka.ms/mfasetup" },
    phones: [{ t: "IT help desk", p: "410-516-4357" }],
  },

  "wifi": {
    title: "Get on campus Wi-Fi", group: "start", time: "3 min", who: "Everyone",
    steps: [
      "Open Wi-Fi settings and pick <b>eduroam</b>.",
      "Username: <i>yourJHED</i><b>@jh.edu</b> (not @jhu.edu). Password: your JHED password.",
      "If asked about a certificate, accept or trust it.",
      "eduroam also works at thousands of other universities, so you stay connected when you travel.",
    ],
    tips: ["Mobile printing in the library needs the <b>Hopkins</b> Wi-Fi network.", "Smart TVs and game consoles in residence halls need separate registration through ResNet."],
    link: { t: "Wireless help (ResNet)", u: "https://studentaffairs.jhu.edu/computing/resnet/wireless-devices-and-printers/" },
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
      "New full-time Homewood students get a <b>physical J-Card</b> at move-in or orientation. Otherwise, visit the J-Card Office in the Wyman Park Building, room 171.",
      "Set up your <b>MFA login code</b> first (see the JHED guide).",
      "From the first day of classes, add the <b>mobile credential</b> to Apple Wallet (iPhone and Apple Watch), Google Wallet or Samsung Wallet from the J-Card website.",
      "Tap your phone where you would tap the card: building doors, dining, J-Cash, the campus store and library printing.",
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
      "In the evening (roughly 6 PM to 2 AM), open TransLoc and choose the <b>Blue Jay Shuttle</b> on-demand service.",
      "Enter your pickup, drop-off and number of riders. Both points must be inside the service zone shown in the app.",
      "Wait somewhere well lit. The app shows your shuttle coming.",
      "If no shuttle arrives within about 15 minutes, the university sends a free Lyft instead.",
    ],
    tips: ["Feeling unsafe while you wait? Call the safety escort at 410-516-4600."],
    link: { t: "Shuttle services", u: "https://jhfre.jhu.edu/ts/transportation/shuttle-services" },
  },

  "jhmi": {
    title: "Ride the JHMI shuttle (\"the Jimmy\")", group: "everyday", time: "2 min", who: "Going to Penn Station, Peabody or the hospital",
    steps: [
      "At Homewood, board at the <b>Interfaith Center</b>, <b>Scott-Bates Commons</b> or the <b>JHU Bookstore</b>.",
      "The route stops at Penn Station and the Peabody Institute on the way to the East Baltimore medical campus.",
      "It is free for Johns Hopkins students, faculty and staff.",
      "Check live arrival times in TransLoc. Buses fill up at the morning and afternoon peaks, so leave a little early.",
    ],
    tips: ["Weekend service is less frequent than weekdays. Check the schedule before you go."],
    link: { t: "Current schedule", u: "https://jhfre.jhu.edu/ts/transportation/shuttle-services" },
  },

  "citybus": {
    title: "Take city buses (free Circulator and MTA)", group: "everyday", time: "3 min", who: "Exploring Baltimore",
    steps: [
      "<b>Charm City Circulator, Purple route</b>: free. Board on 33rd Street across from the campus bookstore. It runs to Penn Station and the Inner Harbor.",
      "<b>MTA CityLink Silver</b>: $2 per ride. Board at St. Paul Street and 31st Street to go south toward Penn Station, the Inner Harbor and Federal Hill. Northbound buses run on Charles Street.",
      "The Baltimore Collegetown Shuttle connects Homewood with Towson. It stops in front of Scott-Bates Commons.",
    ],
    tips: ["The nearest light rail stop (North Avenue) is over a mile from Homewood. The Metro subway ends at the hospital, which the JHMI shuttle reaches."],
  },

  "mobile-order": {
    title: "Order food ahead on your phone", group: "everyday", time: "3 min", who: "Anyone eating on campus",
    apps: [{ name: "Transact Mobile Ordering", ios: "https://apps.apple.com/app/id1494719529", android: PLAY("Transact Mobile Ordering") }],
    steps: [
      "Install <b>Transact Mobile Ordering</b>.",
      "Choose the campus <b>Johns Hopkins University Homewood</b> and sign in with your JHED.",
      "Pick a location that offers mobile ordering, choose your food and pay with meal swipes, Dining Dollars or a card.",
      "Pick up at the counter when the app says your order is ready.",
    ],
    link: { t: "Where to eat and hours", u: "https://studentaffairs.jhu.edu/dining/where-to-eat/" },
    phones: [{ t: "Dining office", p: "410-516-3383" }],
  },

  "printing": {
    title: "Print and scan on campus", group: "everyday", time: "5 min", who: "Everyone",
    steps: [
      "Library printers are in the MSE Library Annex, Brody Learning Commons and the Hutzler Reading Room. You need your J-Card.",
      "Cost: 7¢ per black-and-white page, 20¢ per color side. Color is only in Brody and the Annex. Charges come from your J-Cash.",
      "<b>Easiest way:</b> connect to the <b>Hopkins</b> Wi-Fi and email one PDF or Word file per message to <b>jhubwmobile@jh.edu</b> (black and white) or <b>jhucolormobile@jh.edu</b> (color). Register your email once the first time.",
      "Walk to any library printer, tap your J-Card and pick your job from the list. Jobs wait for 2 hours.",
      "Scanning to email is free.",
    ],
    tips: ["Only letter-size paper is available. For posters, use the Creative Media Center."],
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
      "Book online in the <b>myHealth portal</b> (myhealth.wellbeing.jhu.edu) with your JHED, or call Primary Care at <b>410-516-8270</b> during the day.",
      "Bring your J-Card and your health insurance card.",
      "For a life-threatening emergency, call 911.",
    ],
    tips: ["Not sure if you need to be seen? Call and ask. They can advise you."],
    link: { t: "Primary Care", u: "https://wellbeing.jhu.edu/PrimaryCare/" },
    phones: [{ t: "Primary Care", p: "410-516-8270" }],
  },

  "mental": {
    title: "Talk to someone (mental health)", group: "health", time: "5 min", who: "Anyone feeling stressed, low or overwhelmed",
    steps: [
      "Call Mental Health Services at <b>410-516-3311</b>, or book in the <b>myHealth portal</b>.",
      "The Homewood office is at 3003 N. Charles Street, Suite S-200. Use the South Entrance and go to the 2nd floor.",
      "Students in online-only programs can use TimelyCare instead.",
      "If you are in crisis right now, call or text <b>988</b>, or call 911.",
    ],
    tips: ["Services are free for eligible students. You do not need a diagnosis to ask for help."],
    link: { t: "Mental Health Services", u: "https://wellbeing.jhu.edu/MentalHealthServices/contact-information" },
    phones: [{ t: "Mental Health Services", p: "410-516-3311" }, { t: "Sexual Assault Helpline (24/7)", p: "410-516-7333" }],
  },

  "ois": {
    title: "International student check-in (OIS)", group: "start", time: "30 min", who: "New F-1 and J-1 students",
    steps: [
      "Sign in to <b>iHopkins</b> (OIS's portal) with your JHED and open the <b>Orientation</b> tab.",
      "Watch the orientation video. F-1 students also pass the short quiz.",
      "Upload your visa stamp, your I-94 (download it from the CBP website) and, for J-1, your signed DS-2019. Add a U.S. address and an emergency contact.",
      "Enroll full-time in SIS. OIS cannot approve check-in until you are enrolled.",
      "Submit, then watch for the approval email.",
    ],
    tips: ["Deadline: within 30 days of your program start date (15 days for SEVIS transfers). Missing it is a status violation.", "Starting an on-campus job? Finish check-in first."],
    link: { t: "OIS check-in", u: "https://ois.jhu.edu/Students/New_Students/CheckIn_Process/" },
  },

  "groups": {
    title: "Find clubs and events", group: "everyday", time: "5 min", who: "Everyone",
    apps: [{ name: "CampusGroups", ios: "https://apps.apple.com/us/search?term=CampusGroups", android: PLAY("CampusGroups") }],
    steps: [
      "Sign in to <b>Hopkins Groups</b> at jhu.campusgroups.com with your JHED.",
      "Browse <b>Groups</b> and join a few that interest you, such as sports, culture, service or your department.",
      "Check <b>Events</b> each week. Many include free food.",
      "RSVP. Some events give you a pass to show at the door.",
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
      "Go to the Ralph S. O'Connor Recreation Center and tap your J-Card at the welcome desk.",
      "It has a gym, pool, climbing wall and courts. Group fitness classes are on the rec website.",
      "Want a team? Sign up for intramurals or club sports. Volleyball, soccer and more run each semester.",
    ],
    tips: ["Pool and climbing wall keep their own hours. Check before you go."],
    link: { t: "Rec center hours", u: "https://studentaffairs.jhu.edu/recreation/ralph-s-oconnor-recreation-center/hours-of-operation" },
    phones: [{ t: "Welcome desk", p: "410-516-4434" }],
  },
};
