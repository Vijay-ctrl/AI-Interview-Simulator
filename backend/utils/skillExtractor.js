const { normalizeText } = require("./resumeValidator");

const SKILLS = [
   "C",
   "C++",
   "C#",
   "Java",
   "Python",
   "JavaScript",
   "TypeScript",
   "Go",
   "Rust",
   "Kotlin",
   "Swift",
   "Dart",
   "PHP",
   "Ruby",
   "R",
   "Scala",
   "Perl",
   "MATLAB",
   "Fortran",
   "COBOL",
   "Solidity",

   "HTML",
   "CSS",
   "Sass",
   "SCSS",
   "Bootstrap",
   "Tailwind CSS",
   "React",
   "Next.js",
   "Angular",
   "Vue",
   "Svelte",
   "Vite",
   "Redux",
   "Redux Toolkit",
   "jQuery",

   "Node.js",
   "Express.js",
   "NestJS",
   "Django",
   "Flask",
   "FastAPI",
   "Spring",
   "Spring Boot",
   "Laravel",
   "ASP.NET",
   ".NET",
   "REST APIs",
   "GraphQL",
   "WebSockets",
   "Microservices",

   "SQL",
   "MySQL",
   "PostgreSQL",
   "Oracle",
   "SQLite",
   "MongoDB",
   "Redis",
   "Cassandra",
   "DynamoDB",
   "Firebase",
   "Supabase",
   "Elasticsearch",

   "Data Structures",
   "Algorithms",
   "DSA",
   "OOP",
   "DBMS",
   "Operating Systems",
   "Computer Networks",
   "Compiler Design",
   "Computer Architecture",
   "System Design",
   "Distributed Systems",
   "Object-Oriented Design",
   "Design Patterns",
   "Software Engineering",
   "Computer Science",
   "Discrete Mathematics",
   "Computer Organization",
   "Operating System Concepts",
   "Computer Graphics",
   "Theory of Computation",

   "Machine Learning",
   "Deep Learning",
   "Artificial Intelligence",
   "NLP",
   "Computer Vision",
   "Generative AI",
   "LLM",
   "Neural Networks",
   "Reinforcement Learning",
   "Data Science",
   "Data Analysis",
   "Predictive Modeling",
   "Statistical Modeling",
   "Feature Engineering",
   "Model Evaluation",
   "NumPy",
   "Pandas",
   "Matplotlib",
   "Seaborn",
   "Plotly",
   "Scikit-learn",
   "TensorFlow",
   "PyTorch",
   "Keras",
   "OpenCV",
   "Hugging Face",
   "Transformers",
   "TF-IDF",
   "Natural Language Understanding",
   "Speech Recognition",
   "Recommendation Systems",
   "Recommender Systems",
   "Time Series Analysis",
   "Data Visualization",
   "Statistical Analysis",
   "MLOps",

   "AWS",
   "Microsoft Azure",
   "Google Cloud",
   "GCP",
   "Docker",
   "Kubernetes",
   "Jenkins",
   "GitHub Actions",
   "CI/CD",
   "Terraform",
   "Ansible",
   "Linux",
   "Git",
   "GitHub",
   "GitLab",
   "Bitbucket",
   "Render",
   "Vercel",
   "Netlify",

   "VS Code",
   "Visual Studio",
   "IntelliJ IDEA",
   "Eclipse",
   "Postman",
   "Jira",
   "Confluence",
   "npm",
   "Yarn",
   "Webpack",
   "Babel",

   "API Development",
   "API Integration",
   "Authentication",
   "Authorization",
   "JWT",
   "OAuth",
   "Role-Based Access Control",
   "Caching",
   "Load Balancing",
   "Message Queues",
   "Event-Driven Architecture",
   "Pub/Sub",
   "Serverless",
   "API Gateway",
   "Event-Driven Systems",

   "Cybersecurity",
   "Network Security",
   "Information Security",
   "Ethical Hacking",
   "Penetration Testing",
   "Vulnerability Assessment",
   "Cryptography",
   "Digital Forensics",
   "Security Auditing",
   "SIEM",
   "OWASP",
   "Application Security",
   "Cloud Security",
   "Identity and Access Management",
   "IAM",
   "Incident Response",
   "Malware Analysis",
   "Security Testing",

   "Embedded Systems",
   "Microcontrollers",
   "Microprocessors",
   "Arduino",
   "Raspberry Pi",
   "ESP32",
   "PCB Design",
   "Circuit Design",
   "Digital Electronics",
   "Analog Electronics",
   "Power Electronics",
   "Power Systems",
   "Control Systems",
   "PLC",
   "SCADA",
   "MATLAB Simulink",
   "Verilog",
   "VHDL",
   "FPGA",
   "IoT",
   "Instrumentation",
   "Electrical Machines",
   "Electrical Measurements",
   "Signal Processing",
   "Digital Signal Processing",
   "Power Distribution",
   "Power Generation",
   "Renewable Energy",
   "Electrical Wiring",
   "Electrical Design",
   "Power Electronics Design",
   "Embedded C",
   "Embedded Linux",

   "Mechanical Engineering",
   "CAD",
   "3D CAD",
   "3D Modeling",
   "SolidWorks",
   "AutoCAD",
   "CATIA",
   "Creo",
   "PTC Creo",
   "ANSYS",
   "Abaqus",
   "Fusion 360",
   "Finite Element Analysis",
   "FEA",
   "Computational Fluid Dynamics",
   "CFD",
   "Structural Analysis",
   "Static Structural Analysis",
   "Thermal Analysis",
   "Engineering Drawings",
   "GD&T",
   "CNC",
   "CNC Machine",
   "CNC Machining",
   "Manufacturing",
   "Manufacturing Processes",
   "Production",
   "Quality Assurance",
   "Quality Control",
   "Mechanical Testing",
   "Material Selection",
   "Design for Manufacturing",
   "DFM",
   "Product Design",
   "Industrial Design",
   "Machine Design",
   "Thermodynamics",
   "Fluid Mechanics",
   "Heat Transfer",
   "Automobile Engineering",
   "Mechatronics",
   "Robotics",
   "Maintenance Engineering",
   "Welding",
   "Machining",
   "Metrology",
   "Engineering Mechanics",
   "Machine Tools",
   "Manufacturing Engineering",
   "Production Engineering",

   "Civil Engineering",
   "Structural Engineering",
   "Structural Design",
   "Construction Management",
   "Quantity Surveying",
   "Surveying",
   "Geotechnical Engineering",
   "Transportation Engineering",
   "Environmental Engineering",
   "Hydraulics",
   "Hydrology",
   "Revit",
   "STAAD.Pro",
   "STAAD",
   "ETABS",
   "SAP2000",
   "Civil 3D",
   "Primavera",
   "MS Project",
   "Building Information Modeling",
   "BIM",
   "Concrete Technology",
   "Estimation",
   "Cost Estimation",
   "Construction Planning",
   "Construction Safety",
   "Highway Engineering",
   "Transportation Planning",
   "Water Resources Engineering",
   "Soil Mechanics",
   "Foundation Engineering",
   "Remote Sensing",
   "GIS",
   "AutoCAD Civil 3D",

   "Chemical Engineering",
   "Process Engineering",
   "Process Design",
   "Process Control",
   "Chemical Process Simulation",
   "Aspen Plus",
   "Aspen HYSYS",
   "ChemCAD",
   "Process Safety",
   "Mass Transfer",
   "Heat Transfer",
   "Fluid Mechanics",
   "Reaction Engineering",
   "Thermodynamics",
   "Petrochemical Engineering",
   "Polymer Engineering",
   "Chemical Reaction Engineering",
   "Process Optimization",
   "Process Instrumentation",
   "Plant Design",
   "Process Simulation",
   "Separation Processes",
   "Distillation",
   "Absorption",
   "Extraction",
   "Chemical Kinetics",

   "Biomedical Engineering",
   "Bioinformatics",
   "Biotechnology",
   "Medical Imaging",
   "Clinical Research",
   "Molecular Biology",
   "Genomics",
   "Proteomics",
   "Laboratory Techniques",
   "Medical Device Design",
   "Biomedical Signal Processing",
   "Medical Instrumentation",
   "Biostatistics",
   "Drug Discovery",
   "Tissue Engineering",
   "Biomedical Data Analysis",

   "Financial Analysis",
   "Financial Modeling",
   "Financial Planning",
   "Investment Analysis",
   "Portfolio Management",
   "Risk Analysis",
   "Risk Management",
   "Equity Research",
   "Valuation",
   "Corporate Finance",
   "Accounting",
   "Financial Accounting",
   "Management Accounting",
   "Auditing",
   "Taxation",
   "Bookkeeping",
   "Budgeting",
   "Forecasting",
   "Excel",
   "Power BI",
   "Tableau",
   "Bloomberg Terminal",
   "SAP",
   "Financial Reporting",
   "Cost Accounting",
   "Management Information Systems",
   "Business Intelligence",

   "Digital Marketing",
   "Content Marketing",
   "Social Media Marketing",
   "Search Engine Optimization",
   "Search Engine Marketing",
   "Email Marketing",
   "Brand Management",
   "Market Research",
   "Business Analysis",
   "Business Development",
   "Sales",
   "Customer Relationship Management",
   "Product Management",
   "Project Management",
   "Operations Management",
   "Supply Chain Management",
   "Business Strategy",
   "Strategic Planning",
   "Market Analysis",
   "Customer Analytics",
   "Operations Research",
   "Entrepreneurship",

   "UI Design",
   "UX Design",
   "UI/UX",
   "User Research",
   "Usability Testing",
   "Wireframing",
   "Prototyping",
   "Design Systems",
   "Interaction Design",
   "Visual Design",
   "Figma",
   "Adobe XD",
   "Adobe Photoshop",
   "Adobe Illustrator",
   "Canva",
   "Graphic Design",
   "Web Design",
   "Responsive Design",
   "Information Architecture"
];

const SKILL_ALIASES = {
   "c plus plus": "C++",
   "cpp": "C++",
   "c sharp": "C#",
   "c-sharp": "C#",

   "java script": "JavaScript",
   "js": "JavaScript",
   "type script": "TypeScript",
   "ts": "TypeScript",
   "golang": "Go",
   "py": "Python",

   "html5": "HTML",
   "hypertext markup language": "HTML",
   "css3": "CSS",
   "cascading style sheets": "CSS",

   "react.js": "React",
   "reactjs": "React",
   "vue.js": "Vue",
   "vuejs": "Vue",
   "nextjs": "Next.js",

   "nodejs": "Node.js",
   "node js": "Node.js",
   "expressjs": "Express.js",
   "express js": "Express.js",
   "tailwind": "Tailwind CSS",
   "tailwindcss": "Tailwind CSS",

   "rest api": "REST APIs",
   "rest apis": "REST APIs",
   "restful api": "REST APIs",
   "restful apis": "REST APIs",

   "graphql api": "GraphQL",
   "web socket": "WebSockets",
   "web sockets": "WebSockets",
   "websocket": "WebSockets",

   "postgres": "PostgreSQL",
   "mongo": "MongoDB",
   "mongodb database": "MongoDB",

   "data structures and algorithms": "DSA",
   "data structure and algorithms": "DSA",
   "data structures & algorithms": "DSA",
   "data structure algorithms": "DSA",

   "object oriented programming": "OOP",
   "object-oriented programming": "OOP",
   "object oriented programming language": "OOP",
   "object-oriented programming language": "OOP",

   "object oriented design": "Object-Oriented Design",
   "object-oriented design": "Object-Oriented Design",

   "database management system": "DBMS",
   "database management systems": "DBMS",
   "operating system": "Operating Systems",
   "operating systems": "Operating Systems",
   "computer network": "Computer Networks",
   "computer networking": "Computer Networks",
   "computer organization": "Computer Organization",
   "theory of computation": "Theory of Computation",

   "artificial intelligence": "Artificial Intelligence",
   "machine learning": "Machine Learning",
   "ml": "Machine Learning",
   "deep learning": "Deep Learning",
   "dl": "Deep Learning",
   "natural language processing": "NLP",
   "natural-language processing": "NLP",
   "large language model": "LLM",
   "large language models": "LLM",
   "generative artificial intelligence": "Generative AI",
   "generative ai": "Generative AI",

   "scikit learn": "Scikit-learn",
   "scikit learn library": "Scikit-learn",
   "sklearn": "Scikit-learn",
   "numpy": "NumPy",
   "pandas": "Pandas",
   "opencv": "OpenCV",

   "recommendation system": "Recommendation Systems",
   "recommendation systems": "Recommendation Systems",

   "amazon web services": "AWS",
   "microsoft azure": "Microsoft Azure",
   "azure": "Microsoft Azure",
   "google cloud platform": "Google Cloud",
   "google cloud": "Google Cloud",

   "continuous integration continuous deployment": "CI/CD",
   "continuous integration / continuous deployment": "CI/CD",
   "continuous integration and continuous deployment": "CI/CD",

   "cyber security": "Cybersecurity",
   "identity and access management": "Identity and Access Management",

   "internet of things": "IoT",
   "printed circuit board": "PCB Design",
   "printed circuit boards": "PCB Design",
   "digital signal processing": "Digital Signal Processing",

   "computer aided design": "CAD",
   "computer-aided design": "CAD",
   "finite element analysis": "FEA",
   "computational fluid dynamics": "CFD",
   "geometric dimensioning and tolerancing": "GD&T",
   "solid works": "SolidWorks",

   "building information modelling": "BIM",
   "building information modeling": "BIM",
   "geographic information system": "GIS",
   "geographic information systems": "GIS",
   "auto cad civil 3d": "AutoCAD Civil 3D",

   "user interface design": "UI Design",
   "user interface": "UI Design",
   "user experience design": "UX Design",
   "user experience": "UX Design",
   "ui ux": "UI/UX",
   "ui/ux design": "UI/UX",
   "user interface / user experience": "UI/UX",

   "search engine optimisation": "Search Engine Optimization",
   "seo": "Search Engine Optimization",
   "search engine marketing": "Search Engine Marketing",
   "sem": "Search Engine Marketing",
   "customer relationship management": "Customer Relationship Management",
   "crm": "Customer Relationship Management",

   "problem-solving": "Problem Solving",
   "critical-thinking": "Critical Thinking",
   "time-management": "Time Management"
};

const AMBIGUOUS_SKILLS = new Set([
   "C",
   "R",
   "Go"
]);

const escapeRegex = (value) => {
   return String(value).replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
   );
};

const normalizeSkillText = (skill) => {
   return String(skill)
      .toLowerCase()
      .replace(/[–—−]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
};

const normalizeResumeText = (text) => {
   let value = String(text)
      .replace(/\u00a0/g, " ")
      .replace(/[–—−]/g, "-")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");

   try {
      const normalized = normalizeText(value);

      if (normalized) {
         value = normalized;
      }
   } catch (_) { }

   value = value
      .replace(/[ \t]+/g, " ")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

   return value;
};

const getCanonicalSkill = (skill) => {
   const normalized = normalizeSkillText(skill);

   return SKILL_ALIASES[normalized] || skill;
};

const createSkillRegex = (skill) => {
   const normalized = normalizeSkillText(skill);

   if (!normalized) {
      return null;
   }

   const words = normalized
      .split(/[\s-]+/)
      .filter(Boolean);

   if (!words.length) {
      return null;
   }

   const pattern = words
      .map(escapeRegex)
      .join("[\\s-]+");

   return new RegExp(
      `(^|[^a-z0-9+#.])${pattern}(?=$|[^a-z0-9+#.])`,
      "i"
   );
};

const createExactSkillRegex = (skill) => {
   const normalized = normalizeSkillText(skill);

   if (!normalized) {
      return null;
   }

   const words = normalized
      .split(/[\s-]+/)
      .filter(Boolean);

   if (!words.length) {
      return null;
   }

   const pattern = words
      .map(escapeRegex)
      .join("[\\s-]+");

   return new RegExp(
      `(^|[^a-z0-9+#.])${pattern}(?=$|[^a-z0-9+#.])`,
      "i"
   );
};

const hasTechnicalContext = (text, skill) => {
   const escaped = escapeRegex(skill);

   const patterns = [
      new RegExp(
         `(?:skills?|technical skills?|technical expertise|technologies?|programming languages?|languages?|tools?|frameworks?|libraries?|proficient in|expertise in|experience with|experience in|knowledge of|technologies used)[^\\n]{0,180}(?:^|[^a-z0-9+#.])${escaped}(?=$|[^a-z0-9+#.])`,
         "im"
      ),
      new RegExp(
         `(?:^|\\n)[^\\n]{0,80}(?:${escaped})(?:[^\\n]{0,80})(?:\\n|$)`,
         "im"
      )
   ];

   return patterns.some((regex) => regex.test(text));
};

const hasValidSkillBoundary = (text, start, end) => {
   const before = text[start - 1] || "";
   const after = text[end] || "";

   const invalid = /[a-z0-9+#.]/i;

   return !invalid.test(before) && !invalid.test(after);
};

const findSkillMatches = (text, skill) => {
   const regex = createExactSkillRegex(skill);

   if (!regex) {
      return [];
   }

   const matches = [];
   let match;

   while ((match = regex.exec(text)) !== null) {
      const fullMatch = match[0];
      const prefix = match[1] || "";
      const start = match.index + prefix.length;
      const matchedText = fullMatch.slice(prefix.length);
      const end = start + matchedText.length;

      if (hasValidSkillBoundary(text, start, end)) {
         matches.push({
            start,
            end
         });
      }

      if (match.index === regex.lastIndex) {
         regex.lastIndex++;
      }
   }

   return matches;
};

const extractDictionarySkills = (text) => {
   if (!text || typeof text !== "string") {
      return [];
   }

   const normalizedText = normalizeResumeText(text);

   if (!normalizedText) {
      return [];
   }

   const matchedSkills = new Map();

   const addSkill = (skill) => {
      const canonical = getCanonicalSkill(skill);
      const key = normalizeSkillText(canonical);

      if (!matchedSkills.has(key)) {
         matchedSkills.set(key, canonical);
      }
   };

   for (const skill of SKILLS) {
      if (AMBIGUOUS_SKILLS.has(skill)) {
         if (!hasTechnicalContext(normalizedText, skill)) {
            continue;
         }
      }

      const matches = findSkillMatches(
         normalizedText,
         skill
      );

      if (matches.length > 0) {
         addSkill(skill);
      }
   }

   for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
      if (alias.length < 3) {
         continue;
      }

      if (
         AMBIGUOUS_SKILLS.has(alias) &&
         !hasTechnicalContext(
            normalizedText,
            alias
         )
      ) {
         continue;
      }

      const matches = findSkillMatches(
         normalizedText,
         alias
      );

      if (matches.length > 0) {
         addSkill(canonical);
      }
   }

   return [...matchedSkills.values()];
};

module.exports = {
   SKILLS,
   SKILL_ALIASES,
   extractDictionarySkills
};