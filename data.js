// Blue Jay Buddy content. Edit this file to add or fix links; the app rebuilds from it.
// Fields: cat (section), t (title), d (description), u (link), p (phone, optional), k (search keywords),
//         g (guide id, optional), c (month this link was last checked, "YYYY-MM"; falls back to reviewed below)

const MAPS = q => "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(q + ", Johns Hopkins University Homewood, Baltimore");

window.BJB = {
  // Month every link and phone number was last reviewed. Update this after each pre-semester check.
  reviewed: "2026-10",
  // Where "Report a problem" and "Send feedback" go.
  contact: "sfnu1@jh.edu",

  sections: [
    { id: "academics", label: "Classes",   intro: "Everything for your courses. Add your timetable on Home to get a live \"up next\" card." },
    { id: "move",      label: "Get around", intro: "Free shuttles link Homewood, Penn Station, Peabody and the medical campus. Track them live in the TransLoc app." },
    { id: "food",      label: "Food",       intro: "Hours change by week and semester, so the first card always opens the official hours page." },
    { id: "map",       label: "Buildings",  intro: "Tap a building for walking directions." },
    { id: "fun",       label: "Groups & rec", intro: "Clubs, the rec center and easy Baltimore outings." },
    { id: "health",    label: "Health",     intro: "Physical and mental health support for students." },
    { id: "services",  label: "Services",   intro: "Offices that sort out IDs, visas, careers and housing." },
    { id: "safety",    label: "Safety",     intro: "Save these numbers in your phone now." },
  ],

  items: [
    // Academics
    {cat:"academics",t:"SIS",g:"sis",d:"Register for classes, see grades, pay your bill, waive health insurance.",u:"https://sis.jhu.edu",k:"register registration grades bill billing tuition insurance waiver enrollment degree audit"},
    {cat:"academics",t:"Canvas",g:"canvas",d:"Course pages, assignments, syllabi and due dates.",u:"https://canvas.jhu.edu",k:"assignments homework course syllabus deadlines lms"},
    {cat:"academics",t:"my.JH portal",g:"jhed",d:"Sign-in hub for your JHED account, email and university apps.",u:"https://my.jh.edu",k:"jhed login password email outlook portal"},
    {cat:"academics",t:"JHED login & MFA",g:"jhed",d:"Set up your Hopkins sign-in and two-step verification.",u:"https://aka.ms/mfasetup",k:"jhed login password mfa two factor authenticator sign in locked out"},
    {cat:"academics",t:"Academic Support",d:"Registration dates, tutoring and learning support.",u:"https://academicsupport.jhu.edu",k:"tutoring tutor study help registration dates"},
    {cat:"academics",t:"Engineering Advising",d:"Advising for Whiting School of Engineering students.",u:"https://engineering.jhu.edu/advising",k:"advisor adviser engineering wse"},
    {cat:"academics",t:"Arts & Sciences Advising",d:"Advising for Krieger School students.",u:"https://advising.jhu.edu",k:"advisor adviser ksas major"},
    {cat:"academics",t:"Sheridan Libraries",g:"library",d:"Books, databases, study rooms and Ask a Librarian.",u:"https://www.library.jhu.edu",k:"library books journals study room databases research librarian brody"},
    {cat:"academics",t:"Homewood Graduate Affairs",d:"Services and support for Homewood master's and PhD students.",u:"https://homewoodgrad.jhu.edu/student-services/",k:"grad graduate masters phd"},
    {cat:"academics",t:"Academic calendar",g:"calendar",c:"2026-10",d:"First day of classes, add/drop and withdrawal deadlines, breaks and finals for each school.",u:"https://registrar.jhu.edu/academic-calendar/divisional-academic-calendars",k:"calendar dates add drop withdraw deadline break holiday finals exams semester start end"},

    // Services
    {cat:"services",t:"J-Card Office",g:"jcard",d:"Student ID, lost cards, mobile credential. Wyman Park Building, room 171.",u:"https://studentaffairs.jhu.edu/jcard/",p:"410-516-5121",k:"id card lost jcard j-card wyman"},
    {cat:"services",t:"IT Help Desk",g:"jhed",d:"JHED sign-in, Wi-Fi and university systems.",p:"410-516-4357",u:"https://my.jh.edu",k:"it wifi internet password jhed computer tech help"},
    {cat:"services",t:"Wi-Fi (eduroam)",g:"wifi",d:"Connect with yourJHED@jh.edu and your JHED password.",u:"https://studentaffairs.jhu.edu/computing/resnet/wireless-devices-and-printers/",k:"wifi wi-fi internet eduroam network hopkins connect"},
    {cat:"services",t:"Printing & scanning",g:"printing",d:"Library printers with your J-Card. Email files to print from your phone.",u:"https://ask.library.jhu.edu/library-buildings/faq/409803",k:"print printing printer scan copy pages library"},
    {cat:"services",t:"International Services (OIS)",g:"ois",d:"Visas, I-20s, travel signatures, CPT and OPT.",u:"https://ois.jhu.edu",k:"international visa i-20 opt cpt f1 travel signature"},
    {cat:"services",t:"Life Design Lab",g:"handshake",d:"Career coaching, resumes, internships and jobs.",u:"https://studentaffairs.jhu.edu/life-design/",k:"career resume internship job interview"},
    {cat:"services",t:"Handshake",g:"handshake",d:"Job and internship postings, including on-campus work.",u:"https://jhu.joinhandshake.com",k:"jobs internship career on-campus work"},
    {cat:"services",t:"Student Disability Services",d:"Accommodations through the AIM portal.",u:"https://studentaffairs.jhu.edu/disabilities/",k:"accommodation disability aim exam"},
    {cat:"services",t:"Off-Campus Housing",d:"Listings and advice for renting near Homewood.",u:"https://studentaffairs.jhu.edu/community-living/offcampus/",k:"housing apartment rent lease landlord"},
    {cat:"services",t:"Lost and found",g:"lost",c:"2026-10",d:"Public Safety, 3001 Remington Ave. Check the recovered property list, then call to pick up.",p:"410-516-5278",u:"https://publicsafety.jhu.edu/resources-services/services-for-you/lost-and-found/",k:"lost found missing wallet phone laptop keys item"},
    {cat:"services",t:"Dining Office",d:"Meal plans, Dining Dollars and J-Cash.",p:"410-516-3383",u:"https://studentaffairs.jhu.edu/dining/",k:"meal plan dining dollars jcash food"},

    // Health
    {cat:"health",t:"Primary Care (doctor visits)",g:"health",d:"Sick, injured or need a checkup. Book in the myHealth portal or call during the day.",p:"410-516-8270",u:"https://wellbeing.jhu.edu/PrimaryCare/",k:"doctor sick health clinic appointment vaccine nurse student health myhealth"},
    {cat:"health",t:"Mental Health Services",g:"mental",d:"Counseling and therapy for students. Homewood office at 3003 N. Charles St., Suite S-200.",p:"410-516-3311",u:"https://wellbeing.jhu.edu/MentalHealthServices/contact-information",k:"mental health therapy counseling counselor stress anxiety depression talk"},
    {cat:"health",t:"myHealth portal",g:"health",d:"Book and manage health and counseling appointments online.",u:"https://myhealth.wellbeing.jhu.edu/",k:"appointment portal book schedule"},
    {cat:"health",t:"Sexual Assault Helpline",d:"Confidential, staffed 24/7 by trained counselors.",p:"410-516-7333",u:"https://wellbeing.jhu.edu/youdecide",k:"sexual assault helpline confidential 24/7"},
    {cat:"health",t:"Student Outreach & Support",d:"Case managers who help when life gets complicated.",u:"https://studentaffairs.jhu.edu/student-life/student-outreach-support/",k:"help support emergency case manager food insecurity"},
    {cat:"health",t:"Student health insurance",g:"insurance",c:"2026-10",d:"The student health plan, ID cards and how to waive it if you have other coverage.",u:"https://jhu.myahpcare.com",k:"insurance waiver waive health plan aetna ahp coverage id card"},
    // Get around
    {cat:"move",t:"The JHMI shuttle (\"the Jimmy\")",g:"jhmi",d:"Homewood to Penn Station, Peabody and the medical campus. Boards at the Interfaith Center, Scott-Bates Commons and the JHU Bookstore.",u:"https://jhfre.jhu.edu/ts/transportation/shuttle-services",k:"jimmy jhmi shuttle bus peabody penn station hospital medical campus east baltimore"},
    {cat:"move",t:"Blue Jay Shuttle & Night Ride",g:"bluejay",d:"Free night rides around Homewood. Request one in the TransLoc app.",u:"https://jhfre.jhu.edu/ts/transportation/shuttle-services",k:"night ride shuttle transloc late night safe ride"},
    {cat:"move",t:"All shuttle routes",g:"transloc",d:"Commuter, circulator and express routes. Van shuttles now leave from the Bloomberg Student Center.",p:"410-516-7275",u:"https://jhfre.jhu.edu/ts/transportation/shuttle-services",k:"routes schedule keswick bayview remington hampden circulator"},
    {cat:"move",t:"Charm City Circulator",g:"citybus",d:"Free city buses. The Purple route runs closest to Homewood.",u:"https://www.google.com/search?q=Charm+City+Circulator+Purple+route",k:"free bus city inner harbor downtown"},
    {cat:"move",t:"Collegetown Shuttle",g:"citybus",d:"Homewood to Towson and Notre Dame of Maryland. Stops in front of Scott-Bates Commons.",u:"https://www.google.com/search?q=Baltimore+Collegetown+Shuttle",k:"towson mall collegetown"},
    {cat:"move",t:"Parking permits",c:"2026-10",d:"Student parking options and the permit request form. Popular lots often have a waitlist.",u:"https://jhfre.jhu.edu/ts/parking/parking-options/",k:"parking permit car garage lot commuter drive"},

    // Food
    {cat:"food",t:"Today's dining hours",g:"mobile-order",d:"Official list of every Homewood and Peabody dining spot with current hours.",u:"https://studentaffairs.jhu.edu/dining/where-to-eat/",k:"food eat hours dining open menu"},
    {cat:"food",t:"Charles Street Market",d:"Groceries, deli and late-night snacks.",u:MAPS("Charles Street Market"),k:"grocery snacks deli late night market"},
    {cat:"food",t:"Levering Kitchens",d:"Weekday lunch in Levering Hall: noodle bowls, salads, wraps, pizza.",u:MAPS("Levering Hall"),k:"lunch levering noodles salad"},
    {cat:"food",t:"Hopkins Café",d:"Dining hall stations including Passport (a new cuisine each week) and Woodstone pizza with halal meats.",u:"https://studentaffairs.jhu.edu/dining/where-to-eat/",k:"dining hall halal pizza passport"},
    {cat:"food",t:"Café Azafrán",d:"A Homewood favorite in the Space Telescope Science Institute's Muller building.",u:MAPS("Cafe Azafran"),k:"cafe lunch breakfast"},
    {cat:"food",t:"Order ahead",g:"mobile-order",d:"Skip the line at participating spots with the Transact Mobile Ordering app.",u:"https://studentaffairs.jhu.edu/dining/where-to-eat/",k:"order ahead app transact pickup mobile"},
    {cat:"food",t:"Cheap eats nearby",d:"A student-wellbeing guide to affordable, diet-friendly restaurants around Homewood.",u:"https://wellbeing.jhu.edu/?p=4545",k:"restaurants cheap vegetarian vegan off campus charles village"},
    {cat:"food",t:"Hopkins Food Pantry",c:"2026-10",d:"Free groceries and essentials for students who need them, run by Student Outreach & Support.",u:"https://studentaffairs.jhu.edu/student-outreach-support/hopkins-food-pantry",k:"food pantry free groceries hungry food insecurity essentials"},

    // Fun
    {cat:"fun",t:"Hopkins Groups",g:"groups",d:"400+ student organizations and this week's campus events.",u:"https://jhu.campusgroups.com",k:"clubs groups events organizations join volleyball"},
    {cat:"fun",t:"O'Connor Rec Center",g:"rec",d:"Gym, pool, climbing wall, group fitness, intramurals and club sports.",p:"410-516-4434",u:"https://studentaffairs.jhu.edu/recreation/ralph-s-oconnor-recreation-center/hours-of-operation",k:"gym workout pool climbing fitness intramural sports volleyball rec"},
    {cat:"fun",t:"Graduate Representative Organization",d:"Grad student groups, happy hours and tournaments.",u:"https://www.google.com/search?q=JHU+Graduate+Representative+Organization",k:"gro grad social events"},
    {cat:"fun",t:"Baltimore Museum of Art",d:"Free admission, right next to campus.",u:MAPS("Baltimore Museum of Art"),k:"museum art free weekend bma"},
    {cat:"fun",t:"Inner Harbor",d:"Waterfront, aquarium and food. Take the Circulator.",u:"https://www.google.com/maps/search/?api=1&query=Inner+Harbor+Baltimore",k:"harbor weekend aquarium downtown"},

    // Safety
    {cat:"safety",t:"Campus emergency",g:"emergency",d:"Fire, medical or police emergency on the Homewood campus. You can also dial 911.",p:"410-516-7777",u:"https://publicsafety.jhu.edu",k:"emergency police fire medical urgent 911 danger"},
    {cat:"safety",t:"Safety escort",g:"escort",d:"Campus Safety & Security. Ask for a walking or vehicle escort.",p:"410-516-4600",u:"https://publicsafety.jhu.edu/resources-and-services/services-for-you/safety-escort-program/",k:"escort walk home unsafe security non-emergency"},
    {cat:"safety",t:"LiveSafe app",g:"livesafe",d:"Message security, request an escort, share your location with friends.",u:"https://studentaffairs.jhu.edu/community-living/offcampus/security",k:"app livesafe location alert"},
    {cat:"safety",t:"Weather & closures hotline",d:"Snow days, closures and delays.",p:"410-516-7781",u:"https://publicsafety.jhu.edu",k:"snow closure weather cancel delay"},
  ],

  buildings: [
    ["Malone Hall","Engineering"],["Hackerman Hall","Engineering"],["Shaffer Hall","Classrooms"],["Hodson Hall","Classrooms"],
    ["Gilman Hall","Arts & Sciences"],["Krieger Hall","Arts & Sciences"],["Maryland Hall","Engineering"],["Latrobe Hall","Engineering"],
    ["Barton Hall","Engineering"],["Clark Hall","Engineering"],["Croft Hall","Engineering"],["Olin Hall","Engineering"],
    ["Wyman Park Building","Offices"],["Bloomberg Center for Physics and Astronomy","Science"],["Mudd Hall","Science"],["Remsen Hall","Science"],
    ["Ames Hall","Arts & Sciences"],["Mergenthaler Hall","Science"],["Milton S. Eisenhower Library","Library"],["Brody Learning Commons","Library"],
    ["Levering Hall","Student life"],["Mattin Center","Student life"],["Bloomberg Student Center","Student life"],["Ralph S. O'Connor Recreation Center","Recreation"],
    ["Interfaith Center","Shuttle stop"],["Scott-Bates Commons","Shuttle stop"],["Garland Hall","Offices"],["Mason Hall","Visitors"],
    ["Shriver Hall","Events"],["Homewood Museum","Museum"],["Charles Commons","Housing"],
  ],

  // Posted O'Connor hours, Sunday first. They change by season; the app links to the official page.
  recHours: ["12:00 PM – 4:00 PM","6:30 AM – 8:00 PM","6:30 AM – 8:00 PM","6:30 AM – 8:00 PM","6:30 AM – 8:00 PM","6:30 AM – 6:00 PM","10:00 AM – 6:00 PM"],

  mostUsed: ["SIS","Canvas","Hopkins Groups","Today's dining hours","The JHMI shuttle (\"the Jimmy\")","Sheridan Libraries"],
};
window.BJB.maps = MAPS;

// ---------- Campus places shown as animated illustrations (illustrations.js) ----------
window.BJB.places = [
  { key: "keyser",  title: "Keyser Quad", caption: "The lawn where everyone ends up on a sunny day." },
  { key: "brody",   title: "Brody Learning Commons", caption: "Open late, glass walls, group rooms." },
  { key: "mse",     title: "Milton S. Eisenhower Library", caption: "The main Homewood library, mostly underground." },
  { key: "decker",  title: "Decker Quad", caption: "Engineering's side of campus." },
  { key: "gilman",  title: "Gilman Hall", caption: "The clock tower at the head of the Upper Quad." },
  { key: "shriver", title: "Shriver Hall", caption: "Concerts, talks and big lectures." },
  { key: "museum",  title: "Homewood Museum", caption: "The 1801 house the campus is named after." },
  { key: "gate",    title: "East Gate", caption: "The Charles Street entrance." },
];

// Compatibility for browsers still running an older cached app.js (which expected photos).
// Empty entries make the old code skip the photos instead of failing. Safe to delete after a few weeks.
window.BJB.photos = ["hero","gilman","brody","mse","keyser","decker","shriver","merg","museum","gate"]
  .map(key => ({ key, title: "", caption: "", src: () => "", credit: "", page: "#" }));
window.BJB.buildingPhoto = {};
