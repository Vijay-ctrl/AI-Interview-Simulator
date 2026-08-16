const SKILLS = [
   "C++",
   "Java",
   "Python",
   "JavaScript",
   "SQL",

   "HTML",
   "HTML5",
   "CSS",
   "CSS3",
   "React.js",
   "React",
   "Bootstrap",
   "Vite",

   "Node.js",
   "Express.js",
   "FastAPI",
   "REST APIs",

   "MongoDB",
   "MySQL",

   "Data Structures and Algorithms",
   "DSA",
   "Object-Oriented Programming",
   "OOP",
   "DBMS",
   "Operating Systems",
   "Computer Networks",

   "NumPy",
   "Pandas",
   "Matplotlib",
   "Seaborn",
   "Plotly",
   "Scikit-learn",
   "Machine Learning",
   "Data Analysis",
   "NLP",
   "TF-IDF",

   "Git",
   "GitHub",
   "VS Code",
   "Postman"
];

const extractSkills = (text) => {
   const normalizedText = text.toLowerCase();

   const matchedSkills = SKILLS.filter((skill) => {
      return normalizedText.includes(skill.toLowerCase());
   });

   return [...new Set(matchedSkills)];
};

module.exports = extractSkills;