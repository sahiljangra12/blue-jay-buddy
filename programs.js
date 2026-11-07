// Degree requirements, taken from the official JHU e-catalogue.
// Each program has "plans" (e.g. capstone vs course-only). A plan is a list of slots.
// Slot fields: id, label, kind ("one" = pick one course from `from`, "elective" = any course from `from`
// or from the core-area lists, "capstone" = fixed course), credits (shown to students), note.
// To add a program: copy the "mse-ds" block, fill it from the e-catalogue page, and add it to `list`.

(() => {
const AREA = {
  intro: ["EN.553.636","EN.601.675"],
  statistics: ["EN.553.613","EN.553.614","EN.553.630","EN.553.632","EN.553.639","EN.553.730","EN.553.731","EN.553.733","EN.553.738","EN.553.739","EN.601.677","EN.625.603","EN.625.664"],
  ml: ["EN.520.612","EN.520.637","EN.520.638","EN.520.648","EN.520.651","EN.520.666","EN.525.724","EN.530.641","EN.535.741","EN.553.602","EN.553.724","EN.553.738","EN.553.740","EN.553.741","EN.553.743","EN.601.634","EN.601.674","EN.601.675","EN.601.677","EN.601.682","EN.601.779","EN.625.692"],
  optimization: ["EN.520.618","EN.553.653","EN.553.661","EN.553.662","EN.553.665","EN.553.669","EN.553.761","EN.553.762","EN.553.763","EN.553.766","EN.553.797","EN.625.615","EN.625.618"],
  computing: ["EN.520.617","EN.553.688","EN.601.619","EN.601.620","EN.601.633","EN.601.646","EN.601.647","EN.625.664","EN.685.621"],
  electives: ["EN.520.614","EN.520.615","EN.520.623","EN.520.635","EN.520.640","EN.520.646","EN.520.650","EN.520.659","EN.520.661","EN.520.665","EN.520.684","EN.520.688","EN.525.733","EN.553.627","EN.553.628","EN.553.633","EN.553.635","EN.553.641","EN.553.642","EN.553.644","EN.553.645","EN.553.646","EN.553.647","EN.553.649","EN.553.650","EN.553.689","EN.553.693","EN.553.744","EN.553.753","EN.553.792","EN.580.627","EN.580.658","EN.580.691","EN.580.707","EN.585.788","EN.601.615","EN.601.635","EN.601.641","EN.601.642","EN.601.661","EN.601.663","EN.601.664","EN.601.665","EN.601.666","EN.601.667","EN.601.668","EN.601.670","EN.601.671","EN.601.690","EN.601.752","EN.601.773","EN.601.783","EN.601.788","EN.605.620","EN.605.621","EN.605.626","EN.605.653","EN.650.683"],
};

const TITLES = {
  "EN.553.636":["Introduction to Data Science",3],"EN.601.675":["Machine Learning",3],
  "EN.553.613":["Applied Statistics & Data Analysis I",4],"EN.553.614":["Applied Statistics and Data Analysis II",3],"EN.553.630":["Mathematical Statistics",4],"EN.553.632":["Bayesian Statistics",3],"EN.553.639":["Time Series Analysis",3],"EN.553.730":["Statistical Theory I",4],"EN.553.731":["Statistical Theory II",3],"EN.553.733":["Nonparametric Bayesian Statistics",3],"EN.553.738":["High-Dimensional Approximation, Probability, and Statistical Learning",3],"EN.553.739":["Statistical Pattern Recognition Theory & Methods",3],"EN.601.677":["Causal Inference",3],"EN.625.603":["Statistical Methods and Data Analysis",3],"EN.625.664":["Computational Statistics",3],
  "EN.520.612":["Machine Learning for Signal Processing",3],"EN.520.637":["Foundations of Reinforcement Learning",3],"EN.520.638":["Deep Learning",3],"EN.520.648":["Compressed Sensing and Sparse Recovery",3],"EN.520.651":["Random Signal Analysis",4],"EN.520.666":["Information Extraction",3],"EN.525.724":["Introduction to Pattern Recognition (Online)",3],"EN.530.641":["Statistical Learning For Engineers",3],"EN.535.741":["Optimal Control and Reinforcement Learning",3],"EN.553.602":["Research and Design in Applied Mathematics: Data Mining",4],"EN.553.724":["Probabilistic Machine Learning",3],"EN.553.740":["Machine Learning I",3],"EN.553.741":["Machine Learning II",3],"EN.553.743":["Equivariant Machine Learning",3],"EN.601.634":["Randomized and Big Data Algorithms",3],"EN.601.674":["ML: Learning Theory",3],"EN.601.682":["Machine Learning: Deep Learning",4],"EN.601.779":["Machine Learning: Advanced Topics",3],"EN.625.692":["Probabilistic Graphical Models",3],
  "EN.520.618":["Modern Convex Optimization",3],"EN.553.653":["Mathematical Game Theory",4],"EN.553.661":["Optimization in Finance",4],"EN.553.662":["Optimization for Data Science",3],"EN.553.665":["Introduction to Convexity",4],"EN.553.669":["Large-Scale Optimization For Data Science",3],"EN.553.761":["Nonlinear Optimization I",3],"EN.553.762":["Nonlinear Optimization II",3],"EN.553.763":["Stochastic Search and Optimization",3],"EN.553.766":["Combinatorial Optimization",3],"EN.553.797":["Introduction to Control Theory and Optimal Control",3],"EN.625.615":["Introduction to Optimization",3],"EN.625.618":["Discrete Hybrid Optimization",3],
  "EN.520.617":["Computation for Engineers",3],"EN.553.688":["Computing for Applied Mathematics",3],"EN.601.619":["Cloud Computing",3],"EN.601.620":["Parallel Programming & Performance Engineering",3],"EN.601.633":["Intro Algorithms",3],"EN.601.646":["Sketching and Indexing for Sequences",3],"EN.601.647":["Computational Genomics: Sequences",3],"EN.685.621":["Algorithms for Data Science",3],
  "EN.520.614":["Image Processing & Analysis",3],"EN.520.615":["Image Processing & Analysis II",3],"EN.520.623":["Medical Image Analysis",3],"EN.520.635":["Digital Signal Processing",3],"EN.520.640":["Machine Intelligence on Embedded Systems",3],"EN.520.646":["Wavelets & Filter Banks",3],"EN.520.650":["Machine Intelligence",3],"EN.520.659":["Machine learning for medical applications",3],"EN.520.661":["AI and Biometric Systems: Techniques, Applications, and Ethics",3],"EN.520.665":["Machine Perception",3],"EN.520.684":["Generative AI for Speech and Audio",3],"EN.520.688":["Learning-enabled Multi-agent Systems",3],"EN.525.733":["Deep Learning for Computer Vision (Online)",3],"EN.553.627":["Stochastic Processes and Applications to Finance I",4],"EN.553.628":["Stochastic Processes and Applications to Finance II",4],"EN.553.633":["Monte Carlo Methods",4],"EN.553.635":["Bayesian Statistics for the Physical Sciences",3],"EN.553.641":["Equity Markets and Quantitative Trading",3],"EN.553.642":["Investment Science",4],"EN.553.644":["Introduction to Financial Derivatives",4],"EN.553.645":["Interest Rate and Credit Derivatives",4],"EN.553.646":["Risk Measurement/Management in Financial Markets",4],"EN.553.647":["Quantitative Portfolio Theory and Performance Analysis",4],"EN.553.649":["Advanced Equity Derivatives",4],"EN.553.650":["Computational Molecular Medicine",4],"EN.553.689":["Software Engineering for Data Science",3],"EN.553.693":["Mathematical Image Analysis",4],"EN.553.744":["Data Science Methods for Large Scale Graphs",3],"EN.553.753":["Commodity Markets: Electricity and Natural Gas, Oil, Metals, and Agriculturals",3],"EN.553.792":["Matrix Analysis and Linear Algebra",4],"EN.580.627":["Deep Learning for Medical Imaging",3],"EN.580.658":["Computing the Transcriptome",3],"EN.580.691":["Learning, Estimation and Control",3],"EN.580.707":["Algorithms for Analysis of Genomic Sequence Data",3],"EN.585.788":["Foundations of Computational Biology and Bioinformatics",3],"EN.601.615":["Databases",3],"EN.601.635":["Approximation Algorithms",3],"EN.601.641":["Blockchains and Cryptocurrencies",3],"EN.601.642":["Modern Cryptography",3],"EN.601.661":["Computer Vision",3],"EN.601.663":["Algorithms for Sensor-Based Robotics",3],"EN.601.664":["Artificial Intelligence",3],"EN.601.665":["Natural Language Processing",4],"EN.601.666":["Information Retrieval and Web Agents",3],"EN.601.667":["Introduction to Human Language Technology",3],"EN.601.668":["Machine Translation",3],"EN.601.670":["Artificial Agents",3],"EN.601.671":["Natural Language Processing: Self-Supervised Models",3],"EN.601.690":["Introduction to Human-Computer Interaction",3],"EN.601.752":["Advanced Topics in Single-cell & Spatial Genomics",3],"EN.601.773":["Machine Social Intelligence",3],"EN.601.783":["Vision as Bayesian Inference",3],"EN.601.788":["Machine Learning for Healthcare",3],"EN.605.620":["Algorithms for Bioinformatics",3],"EN.605.621":["Foundations of Algorithms",3],"EN.605.626":["Image Processing",3],"EN.605.653":["Computational Genomics",3],"EN.650.683":["Cybersecurity Risk Management",3],
  "EN.553.806":["Capstone Experience in Data Science",6],
};

const core = [
  { id:"stat", label:"Core area: Statistics", kind:"one", from:AREA.statistics },
  { id:"ml",   label:"Core area: Machine Learning", kind:"one", from:AREA.ml },
  { id:"opt",  label:"Core area: Optimization", kind:"one", from:AREA.optimization },
  { id:"comp", label:"Core area: Computing", kind:"one", from:AREA.computing },
];
const anyElective = [...AREA.electives, ...AREA.statistics, ...AREA.ml, ...AREA.optimization, ...AREA.computing];
const electives = n => Array.from({length:n}, (_, i) => ({ id:"el"+(i+1), label:`Elective ${i+1} of ${n}`, kind:"elective", from:anyElective }));

window.BJB_PROGRAMS = {
  titles: TITLES,
  list: [
    {
      id: "mse-ds", school: "wse", level: "masters",
      name: "Data Science, MSE (full-time, Homewood)",
      dept: "Applied Mathematics & Statistics",
      source: "https://e-catalogue.jhu.edu/engineering/full-time-residential-programs/degree-programs/applied-mathematics-statistics/data-science-masters-degree/",
      checked: "2026-11",
      plans: [
        { id: "capstone", label: "Started Fall 2025 or later · Capstone option",
          slots: [
            { id:"intro", label:"Required first-semester course", kind:"one", from:AREA.intro, note:"Introduction to Data Science or Machine Learning. Take it in your first semester." },
            ...core, ...electives(3),
            { id:"cap", label:"Capstone (6 credits, can be split over two semesters)", kind:"one", from:["EN.553.806"] },
          ]},
        { id: "course", label: "Started Fall 2025 or later · Course-only option",
          slots: [
            { id:"intro", label:"Required first-semester course", kind:"one", from:AREA.intro, note:"Introduction to Data Science or Machine Learning. Take it in your first semester." },
            ...core, ...electives(5),
          ]},
        { id: "pre2025", label: "Started before Fall 2025",
          slots: [
            { id:"intro", label:"Introduction to Data Science", kind:"one", from:["EN.553.636"] },
            ...core, ...electives(4),
            { id:"cap", label:"Capstone (6 credits)", kind:"one", from:["EN.553.806"] },
          ]},
      ],
      extras: [
        "EN.500.603 University Orientation and Academic Ethics (auto-enrolled in your first semester; must pass)",
        "Responsible conduct of research training (AS.360.624, online)",
        "An approved online data ethics course",
        "Communication Skills Practicum",
      ],
      rules: [
        "B- or better counts toward requirements. One C or C+ is allowed.",
        "A course can count only once, even if it appears in two areas.",
        "Submit a program plan for review; update it if you change courses.",
      ],
    },
  ],
};
})();
