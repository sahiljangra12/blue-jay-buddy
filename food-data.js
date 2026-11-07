// Food, groceries, deals and apps near Homewood.
// Prices are typical per-person spend ESTIMATES (USD), not quotes. Every place links to its live menu
// and directions. Re-check before each semester and update `checked`.
// `ref` on deals/apps is where a referral link goes later; when empty the normal link is used.

window.BJB_FOOD = {
  checked: "2026-11",

  // diet: v = vegetarian options, vg = vegan options, nv = meat, h = halal options (only where known)
  places: [
    { n:"THB Bagelry & Deli", area:"3208 St. Paul St", cui:"Bagels, breakfast, deli", lo:4, hi:12, diet:["v","nv"], hours:"Mornings to mid-afternoon",
      vegPick:"Bagel with cream cheese, or egg & cheese", pick:"Egg sandwiches, tuna melt, lox bagel", tag:"breakfast", cheap:true },
    { n:"University Market & Deli (Uni-Mini)", area:"3201 St. Paul St", cui:"Deli, subs, snacks", lo:7, hi:13, diet:["v","nv"],
      vegPick:"Ask for a veggie or cheese sub", pick:"Cheesesteak, chicken parm sub, shawarma", tag:"lunch", cheap:true },
    { n:"Chipotle", area:"St. Paul St & 32nd St", cui:"Mexican bowls & burritos", lo:11, hi:15, diet:["v","vg","nv"],
      vegPick:"Sofritas or veggie bowl (vegan possible)", pick:"Chicken or steak bowl", tag:"lunch" },
    { n:"&pizza", area:"St. Paul St (Charles Village)", cui:"Pizza", lo:11, hi:16, diet:["v","vg","nv"],
      vegPick:"Build your own veggie pizza", pick:"Pepperoni or chicken pizza", tag:"dinner" },
    { n:"Potbelly", area:"St. Paul St (Charles Village)", cui:"Sandwiches, salads", lo:8, hi:13, diet:["v","nv"],
      vegPick:"Mediterranean or grilled cheese", pick:"Turkey or Italian sandwich", tag:"lunch" },
    { n:"Starbucks", area:"St. Paul St (Charles Village)", cui:"Coffee, snacks", lo:4, hi:9, diet:["v","nv"],
      vegPick:"Egg bites, oatmeal, pastries", pick:"Breakfast sandwiches", tag:"coffee" },
    { n:"Kajiken", area:"33rd St", cui:"Japanese ramen, abura soba", lo:14, hi:20, diet:["nv","v?"],
      vegPick:"Ask staff about vegetarian bowls", pick:"Abura soba (soupless ramen), tonkotsu ramen, gyoza", tag:"dinner" },
    { n:"Lao Sze Chuan", area:"33rd St", cui:"Sichuan Chinese", lo:13, hi:25, diet:["v","nv"],
      vegPick:"Mapo tofu, dry-fried green beans", pick:"Dan dan noodles (filling on their own)", tag:"dinner" },
    { n:"Charles Street Market", area:"On campus (Charles Commons area)", cui:"Grocery, deli, late-night snacks", lo:4, hi:12, diet:["v","vg","nv"],
      vegPick:"Grab-and-go salads, snacks", pick:"Deli sandwiches", tag:"campus", jcash:true, cheap:true },
    { n:"Hopkins Café (dining hall)", area:"On campus", cui:"Dining hall, halal pizza, rotating stations", lo:0, hi:0, diet:["v","vg","nv","h"],
      vegPick:"Salad bar and vegetarian stations", pick:"Passport station, Woodstone pizza with halal meats", tag:"campus", swipe:true },
    { n:"Levering Kitchens", area:"Levering Hall", cui:"Noodle bowls, salads, wraps, pizza", lo:8, hi:13, diet:["v","nv"],
      vegPick:"Veggie noodle bowl or salad", pick:"Noodle bowls, wraps", tag:"campus", jcash:true },
    { n:"Café Azafrán", area:"STScI Muller Building", cui:"Café: breakfast and lunch", lo:7, hi:14, diet:["v","nv"],
      vegPick:"Ask for the vegetarian specials", pick:"Lunch plates", tag:"lunch" },
  ],

  // Weekly grocery baskets for one person, ESTIMATED from typical Baltimore supermarket prices.
  baskets: {
    veg: { label:"Vegetarian", items:[["Rice (2 lb)",3],["Lentils or chickpeas (2 lb)",4],["Paneer or tofu",5],["Milk (half gallon)",3],["Yogurt (32 oz)",4],["Bread",3],["Pasta + sauce",5],["Onions, tomatoes, garlic",5],["Frozen mixed vegetables",4],["Bananas + apples",5],["Peanut butter or cheese",4]] },
    egg: { label:"Vegetarian + eggs", items:[["Rice (2 lb)",3],["Lentils or chickpeas (2 lb)",4],["Eggs (dozen)",4],["Milk (half gallon)",3],["Yogurt (32 oz)",4],["Bread",3],["Pasta + sauce",5],["Onions, tomatoes, garlic",5],["Frozen mixed vegetables",4],["Bananas + apples",5]] },
    vegan: { label:"Vegan", items:[["Rice (2 lb)",3],["Lentils or chickpeas (2 lb)",4],["Tofu (2 blocks)",5],["Oat or soy milk",4],["Bread",3],["Pasta + sauce",5],["Onions, tomatoes, garlic",5],["Frozen mixed vegetables",4],["Bananas + apples",5],["Peanut butter",4],["Oats",3]] },
    nonveg: { label:"Non-vegetarian", items:[["Rice (2 lb)",3],["Chicken thighs (2 lb)",8],["Eggs (dozen)",4],["Milk (half gallon)",3],["Yogurt (32 oz)",4],["Bread",3],["Pasta + sauce",5],["Onions, tomatoes, garlic",5],["Frozen mixed vegetables",4],["Bananas + apples",5]] },
  },

  stores: [
    { n:"Giant Food", how:"Supermarket. Order for delivery or pickup in the Giant app, or shop in person.", u:"https://giantfood.com", maps:"Giant Food near Johns Hopkins Homewood Baltimore", tip:"Free Giant loyalty card gives weekly sale prices." },
    { n:"Streets Market", how:"Neighborhood grocery about a 5-minute walk from campus.", u:"", maps:"Streets Market Charles Village Baltimore" },
    { n:"Charles Street Market", how:"On-campus grocery and deli. Takes J-Cash and Dining Dollars.", u:"https://studentaffairs.jhu.edu/dining/where-to-eat/", maps:"Charles Street Market Johns Hopkins" },
    { n:"Waverly Farmers Market (32nd St)", how:"Local produce on 32nd Street. Check the market's current day and hours before you go.", u:"", maps:"Waverly Farmers Market 32nd Street Baltimore" },
    { n:"Weee!", how:"Online Asian and Indian grocery delivery. Good for spices, rice, paneer, noodles.", u:"https://www.sayweee.com", maps:"" },
    { n:"Amazon Fresh", how:"Grocery delivery. Cheaper with Prime Student.", u:"https://www.amazon.com/fresh", maps:"" },
    { n:"Hopkins Food Pantry", how:"Free groceries and essentials for students who need them. No judgment.", u:"https://studentaffairs.jhu.edu/student-outreach-support/hopkins-food-pantry", maps:"" },
  ],

  // Student deals and money-saving apps. Terms checked Nov 2026; providers change them, so every card links to the source.
  deals: [
    { n:"DashPass for Students", cat:"food", what:"$0 delivery fees on eligible DoorDash orders. Student plan is $4.99/month (vs $9.99), with free promos some semesters.", verify:"In the DoorDash app: Account → DashPass → Student Plan. Verified by SheerID with your name, school, date of birth and email.", u:"https://www.doordash.com/dashpass/student", ref:"" },
    { n:"Uber One for Students", cat:"food", what:"Uber Eats and ride savings. Students pay $4.99/month after a 4-week free trial (half the regular price).", verify:"In the Uber or Uber Eats app: Account → Uber One → student offer. Verify with your school email.", u:"https://www.uber.com/us/en/uberonestudent", ref:"" },
    { n:"Prime Student", cat:"shopping", what:"6-month free trial, then $7.49/month. Free shipping, Prime Video and cheaper Amazon Fresh.", verify:"On Amazon Prime, choose the student plan and verify with your @jh.edu email.", u:"https://www.amazon.com/prime", ref:"" },
    { n:"Too Good To Go", cat:"food", what:"Buy unsold food from Baltimore bakeries, cafés and stores as surprise bags, usually about a third of the normal price.", verify:"No verification. Download the app and reserve a bag for pickup.", u:"https://www.toogoodtogo.com/en-us", ref:"" },
    { n:"Weee!", cat:"food", what:"Asian and Indian grocery delivery with first-order discounts.", verify:"No student verification. Watch for new-user codes.", u:"https://www.sayweee.com", ref:"" },
    { n:"Rakuten", cat:"shopping", what:"Cash back at hundreds of stores (Amazon, Target, DoorDash gift cards and more).", verify:"No verification. Install the browser extension or app and shop through it.", u:"https://www.rakuten.com", ref:"" },
    { n:"UNiDAYS", cat:"shopping", what:"Free student discount hub: Apple, Adidas, Samsung, HBO Max and more.", verify:"Verify once with your @jh.edu email or student ID.", u:"https://www.myunidays.com", ref:"" },
    { n:"Student Beans", cat:"shopping", what:"Free student discount hub: NYT for $1/week, fashion and tech codes.", verify:"Verify with your .edu email.", u:"https://www.studentbeans.com/us", ref:"" },
    { n:"Spotify Premium Student", cat:"subscriptions", what:"Spotify Premium with Hulu (with ads) for $5.99/month.", verify:"Verified by SheerID with your school details.", u:"https://www.spotify.com/us/student/", ref:"" },
    { n:"Apple Music Student", cat:"subscriptions", what:"Apple Music with Apple TV+ for $5.99/month, first month free. Apple Education Store discounts on Macs and iPads.", verify:"Verified through UNiDAYS.", u:"https://www.apple.com/us-edu/store", ref:"" },
    { n:"Microsoft 365 (free through JHU)", cat:"software", what:"Word, Excel, PowerPoint, Teams and OneDrive storage, free while you are a student.", verify:"Sign in with your JHED@jh.edu account.", u:"https://my.jh.edu", ref:"" },
    { n:"GitHub Student Developer Pack", cat:"software", what:"Free GitHub Copilot, cloud credits and developer tools while you are a student.", verify:"Apply with your @jh.edu email and proof of enrollment.", u:"https://education.github.com/pack", ref:"" },
    { n:"Amtrak student discount", cat:"travel", what:"15% off for travelers aged 17–24 (Penn Station is one Jimmy shuttle ride away).", verify:"Pick the student fare when booking; carry your student ID.", u:"https://www.amtrak.com/deals-discounts/everyday-discounts/student-discounts.html", ref:"" },
    { n:"Movie tickets", cat:"fun", what:"AMC, Regal and Cinemark offer student prices at many locations.", verify:"Show your J-Card at the box office.", u:"", ref:"" },
  ],

  // Apps every Homewood student ends up using. ios/android go to official app pages where known.
  apps: [
    { n:"DoorDash", why:"Food delivery. Pair with DashPass for Students.", u:"https://www.doordash.com", ref:"" },
    { n:"Uber Eats", why:"Food delivery and rides. Pair with Uber One for Students.", u:"https://www.ubereats.com", ref:"" },
    { n:"Too Good To Go", why:"Cheap surplus food from local spots.", u:"https://www.toogoodtogo.com/en-us", ref:"" },
    { n:"Weee!", why:"Asian and Indian groceries delivered.", u:"https://www.sayweee.com", ref:"" },
    { n:"Rakuten", why:"Cash back when you shop online.", u:"https://www.rakuten.com", ref:"" },
    { n:"Giant Food", why:"Groceries, weekly sale prices, delivery.", u:"https://giantfood.com", ref:"" },
    { n:"Transact eAccounts", why:"Check your J-Cash and Dining Dollars balance.", u:"https://studentaffairs.jhu.edu/dining/", ref:"" },
  ],
};
