// Blue Jay Buddy content. Edit this file to add or fix links; the app rebuilds from it.
// Fields: cat (section), t (title), d (description), u (link), p (phone, optional), k (search keywords)

const MAPS = q => "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(q + ", Johns Hopkins University Homewood, Baltimore");

window.BJB = {
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
    {cat:"academics",t:"SIS",d:"Register for classes, see grades, pay your bill, waive health insurance.",u:"https://sis.jhu.edu",k:"register registration grades bill billing tuition insurance waiver enrollment degree audit"},
    {cat:"academics",t:"Canvas",d:"Course pages, assignments, syllabi and due dates.",u:"https://canvas.jhu.edu",k:"assignments homework course syllabus deadlines lms"},
    {cat:"academics",t:"my.JH portal",d:"Sign-in hub for your JHED account, email and university apps.",u:"https://my.jh.edu",k:"jhed login password email outlook portal"},
    {cat:"academics",t:"Academic Support",d:"Registration dates, tutoring and learning support.",u:"https://academicsupport.jhu.edu",k:"tutoring tutor study help registration dates"},
    {cat:"academics",t:"Engineering Advising",d:"Advising for Whiting School of Engineering students.",u:"https://engineering.jhu.edu/advising",k:"advisor adviser engineering wse"},
    {cat:"academics",t:"Arts & Sciences Advising",d:"Advising for Krieger School students.",u:"https://advising.jhu.edu",k:"advisor adviser ksas major"},
    {cat:"academics",t:"Sheridan Libraries",d:"Books, databases, study rooms and Ask a Librarian.",u:"https://www.library.jhu.edu",k:"library books journals study room databases research librarian brody"},
    {cat:"academics",t:"Homewood Graduate Affairs",d:"Services and support for Homewood master's and PhD students.",u:"https://homewoodgrad.jhu.edu/student-services/",k:"grad graduate masters phd"},

    // Services
    {cat:"services",t:"J-Card Office",d:"Student ID, lost cards, mobile credential. Wyman Park Building, room 171.",u:"https://studentaffairs.jhu.edu/jcard/",p:"410-516-5121",k:"id card lost jcard j-card wyman"},
    {cat:"services",t:"IT Help Desk",d:"JHED sign-in, Wi-Fi and university systems.",p:"410-516-4357",u:"https://my.jh.edu",k:"it wifi internet password jhed computer tech help"},
    {cat:"services",t:"International Services (OIS)",d:"Visas, I-20s, travel signatures, CPT and OPT.",u:"https://ois.jhu.edu",k:"international visa i-20 opt cpt f1 travel signature"},
    {cat:"services",t:"Life Design Lab",d:"Career coaching, resumes, internships and jobs.",u:"https://studentaffairs.jhu.edu/life-design/",k:"career resume internship job interview"},
    {cat:"services",t:"Handshake",d:"Job and internship postings, including on-campus work.",u:"https://jhu.joinhandshake.com",k:"jobs internship career on-campus work"},
    {cat:"services",t:"Student Disability Services",d:"Accommodations through the AIM portal.",u:"https://studentaffairs.jhu.edu/disabilities/",k:"accommodation disability aim exam"},
    {cat:"services",t:"Off-Campus Housing",d:"Listings and advice for renting near Homewood.",u:"https://studentaffairs.jhu.edu/community-living/offcampus/",k:"housing apartment rent lease landlord"},
    {cat:"services",t:"Dining Office",d:"Meal plans, Dining Dollars and J-Cash.",p:"410-516-3383",u:"https://studentaffairs.jhu.edu/dining/",k:"meal plan dining dollars jcash food"},

    // Health
    {cat:"health",t:"Student Health & Wellness",d:"Appointments, illness and vaccines.",u:"https://studentaffairs.jhu.edu/student-health/",k:"doctor sick health clinic appointment vaccine"},
    {cat:"health",t:"Counseling Center",d:"Therapy, crisis support and workshops.",u:"https://studentaffairs.jhu.edu/counselingcenter/",k:"mental health therapy counseling stress anxiety talk"},
    {cat:"health",t:"CHEW",d:"Health education and wellness programs.",u:"https://studentaffairs.jhu.edu/chew/",k:"wellness sleep nutrition health education"},
    {cat:"health",t:"Student Outreach & Support",d:"Case managers who help when life gets complicated.",u:"https://studentaffairs.jhu.edu/student-life/student-outreach-support/",k:"help support emergency case manager food insecurity"},

    // Get around
    {cat:"move",t:"The JHMI shuttle (\"the Jimmy\")",d:"Homewood to Penn Station, Peabody and the medical campus. Boards at the Interfaith Center, Scott-Bates Commons and the JHU Bookstore.",u:"https://jhfre.jhu.edu/ts/transportation/shuttle-services",k:"jimmy jhmi shuttle bus peabody penn station hospital medical campus east baltimore"},
    {cat:"move",t:"Blue Jay Shuttle & Night Ride",d:"Free night rides around Homewood. Request one in the TransLoc app.",u:"https://jhfre.jhu.edu/ts/transportation/shuttle-services",k:"night ride shuttle transloc late night safe ride"},
    {cat:"move",t:"All shuttle routes",d:"Commuter, circulator and express routes. Van shuttles now leave from the Bloomberg Student Center.",p:"410-516-7275",u:"https://jhfre.jhu.edu/ts/transportation/shuttle-services",k:"routes schedule keswick bayview remington hampden circulator"},
    {cat:"move",t:"Charm City Circulator",d:"Free city buses. The Purple route runs closest to Homewood.",u:"https://www.google.com/search?q=Charm+City+Circulator+Purple+route",k:"free bus city inner harbor downtown"},
    {cat:"move",t:"Collegetown Shuttle",d:"Homewood to Towson and Notre Dame of Maryland. Stops in front of Scott-Bates Commons.",u:"https://www.google.com/search?q=Baltimore+Collegetown+Shuttle",k:"towson mall collegetown"},

    // Food
    {cat:"food",t:"Today's dining hours",d:"Official list of every Homewood and Peabody dining spot with current hours.",u:"https://studentaffairs.jhu.edu/dining/where-to-eat/",k:"food eat hours dining open menu"},
    {cat:"food",t:"Charles Street Market",d:"Groceries, deli and late-night snacks.",u:MAPS("Charles Street Market"),k:"grocery snacks deli late night market"},
    {cat:"food",t:"Levering Kitchens",d:"Weekday lunch in Levering Hall: noodle bowls, salads, wraps, pizza.",u:MAPS("Levering Hall"),k:"lunch levering noodles salad"},
    {cat:"food",t:"Hopkins Café",d:"Dining hall stations including Passport (a new cuisine each week) and Woodstone pizza with halal meats.",u:"https://studentaffairs.jhu.edu/dining/where-to-eat/",k:"dining hall halal pizza passport"},
    {cat:"food",t:"Café Azafrán",d:"A Homewood favorite in the Space Telescope Science Institute's Muller building.",u:MAPS("Cafe Azafran"),k:"cafe lunch breakfast"},
    {cat:"food",t:"Order ahead",d:"Skip the line at participating spots with the Transact Mobile Ordering app.",u:"https://studentaffairs.jhu.edu/dining/where-to-eat/",k:"order ahead app transact pickup mobile"},
    {cat:"food",t:"Cheap eats nearby",d:"A student-wellbeing guide to affordable, diet-friendly restaurants around Homewood.",u:"https://wellbeing.jhu.edu/?p=4545",k:"restaurants cheap vegetarian vegan off campus charles village"},

    // Fun
    {cat:"fun",t:"Hopkins Groups",d:"400+ student organizations and this week's campus events.",u:"https://jhu.campusgroups.com",k:"clubs groups events organizations join volleyball"},
    {cat:"fun",t:"O'Connor Rec Center",d:"Gym, pool, climbing wall, group fitness, intramurals and club sports.",p:"410-516-4434",u:"https://studentaffairs.jhu.edu/recreation/ralph-s-oconnor-recreation-center/hours-of-operation",k:"gym workout pool climbing fitness intramural sports volleyball rec"},
    {cat:"fun",t:"Graduate Representative Organization",d:"Grad student groups, happy hours and tournaments.",u:"https://www.google.com/search?q=JHU+Graduate+Representative+Organization",k:"gro grad social events"},
    {cat:"fun",t:"Baltimore Museum of Art",d:"Free admission, right next to campus.",u:MAPS("Baltimore Museum of Art"),k:"museum art free weekend bma"},
    {cat:"fun",t:"Inner Harbor",d:"Waterfront, aquarium and food. Take the Circulator.",u:"https://www.google.com/maps/search/?api=1&query=Inner+Harbor+Baltimore",k:"harbor weekend aquarium downtown"},

    // Safety
    {cat:"safety",t:"Campus emergency",d:"Fire, medical or police emergency on the Homewood campus. You can also dial 911.",p:"410-516-7777",u:"https://publicsafety.jhu.edu",k:"emergency police fire medical urgent 911 danger"},
    {cat:"safety",t:"Safety escort",d:"Campus Safety & Security. Ask for a walking or vehicle escort.",p:"410-516-4600",u:"https://publicsafety.jhu.edu/resources-and-services/services-for-you/safety-escort-program/",k:"escort walk home unsafe security non-emergency"},
    {cat:"safety",t:"LiveSafe app",d:"Message security, request an escort, share your location with friends.",u:"https://studentaffairs.jhu.edu/community-living/offcampus/security",k:"app livesafe location alert"},
    {cat:"safety",t:"Weather & closures hotline",d:"Snow days, closures and delays.",p:"800-548-9004",u:"https://publicsafety.jhu.edu",k:"snow closure weather cancel delay"},
  ],

  buildings: [
    ["Malone Hall","Engineering"],["Hackerman Hall","Engineering"],["Shaffer Hall","Classrooms"],["Hodson Hall","Classrooms"],
    ["Gilman Hall","Arts & Sciences"],["Krieger Hall","Arts & Sciences"],["Maryland Hall","Engineering"],["Latrobe Hall","Engineering"],
    ["Barton Hall","Engineering"],["Clark Hall","Engineering"],["Croft Hall","Engineering"],["Olin Hall","Engineering"],
    ["Wyman Park Building","Offices"],["Bloomberg Center for Physics and Astronomy","Science"],["Mudd Hall","Science"],["Remsen Hall","Science"],
    ["Ames Hall","Arts & Sciences"],["Mergenthaler Hall","Science"],["Milton S. Eisenhower Library","Library"],["Brody Learning Commons","Library"],
    ["Levering Hall","Student life"],["Mattin Center","Student life"],["Bloomberg Student Center","Student life"],["Ralph S. O'Connor Recreation Center","Recreation"],
    ["Interfaith Center","Shuttle stop"],["Scott-Bates Commons","Shuttle stop"],["Garland Hall","Offices"],["Mason Hall","Visitors"],
    ["Shriver Hall","Events"],["Charles Commons","Housing"],
  ],

  // Posted O'Connor hours, Sunday first. They change by season; the app links to the official page.
  recHours: ["12:00 PM – 4:00 PM","6:30 AM – 8:00 PM","6:30 AM – 8:00 PM","6:30 AM – 8:00 PM","6:30 AM – 8:00 PM","6:30 AM – 6:00 PM","10:00 AM – 6:00 PM"],

  mostUsed: ["SIS","Canvas","Hopkins Groups","Today's dining hours","The JHMI shuttle (\"the Jimmy\")","Sheridan Libraries"],
};
window.BJB.maps = MAPS;
