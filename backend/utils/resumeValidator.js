const RESUME_SECTION_PATTERNS = [
   "technical skills",
   "key skills",
   "core skills",
   "professional skills",
   "skills",
   "technical competencies",
   "competencies",
   "education",
   "academic background",
   "work experience",
   "professional experience",
   "employment history",
   "experience",
   "projects",
   "academic projects",
   "personal projects",
   "certifications",
   "certificates",
   "achievements",
   "professional summary",
   "career objective",
   "objective",
   "profile",
   "publications"
];

const STRONG_RESUME_SIGNALS = [
   "resume",
   "curriculum vitae",
   "curriculum-vitae",
   "professional summary",
   "career objective",
   "technical skills",
   "work experience",
   "professional experience",
   "education",
   "projects",
   "certifications"
];

const NON_RESUME_PATTERNS = [
   "welcome letter",
   "offer letter",
   "appointment letter",
   "joining letter",
   "internship letter",
   "internship offer",
   "internship welcome",
   "selection letter",
   "selection notice",
   "selection notification",
   "examination circular",
   "examination timetable",
   "exam timetable",
   "examination programme",
   "exam programme",
   "time table",
   "timetable",
   "question paper",
   "question paper",
   "hall ticket",
   "admit card",
   "marksheet",
   "mark sheet",
   "transcript",
   "invoice",
   "receipt",
   "salary structure",
   "salary structure",
   "terms and conditions of service",
   "payment confirmation",
   "internship fees",
   "internship fee",
   "enrolment fee",
   "internship form"
];

const normalizeText = (text) => {

   return text
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

};

const countOccurrences = (
   text,
   phrase
) => {

   const escaped =
      phrase.replace(
         /[.*+?^${}()|[\]\\]/g,
         "\\$&"
      );

   const matches =
      text.match(
         new RegExp(
            escaped,
            "gi"
         )
      );

   return matches
      ? matches.length
      : 0;

};

const validateResume = (text) => {

   if (
      !text ||
      typeof text !== "string"
   ) {

      return {
         isResume: false,
         score: 0,
         reason:
            "No readable text found"
      };

   }

   const normalizedText =
      normalizeText(text);

   const lowerText =
      normalizedText.toLowerCase();


   // ------------------------------------------
   // Minimum readable content
   // ------------------------------------------

   if (
      normalizedText.length < 150
   ) {

      return {
         isResume: false,
         score: 0,
         reason:
            "Document contains insufficient readable content"
      };

   }


   // ------------------------------------------
   // Detect obvious non-resume documents
   // ------------------------------------------

   const matchedNonResumePatterns =
      NON_RESUME_PATTERNS.filter(
         (pattern) =>
            lowerText.includes(pattern)
      );


   /*
    * Strong rejection:
    *
    * If the document contains multiple
    * strong non-resume indicators, reject it.
    */

   if (
      matchedNonResumePatterns.length >= 2
   ) {

      return {
         isResume: false,
         score: 0,
         reason:
            "Document appears to be an offer letter, internship letter, examination document, administrative document, or other non-resume PDF"
      };

   }


   /*
    * Welcome/offer/appointment letters
    * should be rejected even if they contain
    * words like "skills", "internship",
    * "education", etc.
    */

   const isEmploymentLetter =
      [
         "welcome letter",
         "offer letter",
         "appointment letter",
         "joining letter",
         "selection letter",
         "internship offer",
         "internship welcome"
      ].some(
         (pattern) =>
            lowerText.includes(pattern)
      );


   if (
      isEmploymentLetter
   ) {

      return {
         isResume: false,
         score: 0,
         reason:
            "The uploaded PDF appears to be an employment or internship letter, not a resume"
      };

   }


   // ------------------------------------------
   // Resume signals
   // ------------------------------------------

   const matchedResumeSections =
      RESUME_SECTION_PATTERNS.filter(
         (section) =>
            lowerText.includes(section)
      );


   const matchedStrongSignals =
      STRONG_RESUME_SIGNALS.filter(
         (signal) =>
            lowerText.includes(signal)
      );


   // ------------------------------------------
   // Contact information
   // ------------------------------------------

   const hasEmail =
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
         .test(normalizedText);


   const hasPhone =
      /(?:\+91[\s-]?)?[6-9]\d{9}\b/
         .test(normalizedText);


   // ------------------------------------------
   // Professional profile signals
   // ------------------------------------------

   const professionalIndicators = [
      "linkedin",
      "github",
      "portfolio",
      "developer",
      "engineer",
      "analyst",
      "designer",
      "researcher",
      "software engineer",
      "data analyst",
      "data scientist",
      "student",
      "university",
      "college",
      "bachelor",
      "master",
      "b.e.",
      "b.tech",
      "m.e.",
      "m.tech",
      "mba",
      "phd"
   ];


   const professionalMatches =
      professionalIndicators.filter(
         (indicator) =>
            lowerText.includes(indicator)
      );


   // ------------------------------------------
   // Calculate score
   // ------------------------------------------

   let score = 0;


   score += Math.min(
      matchedStrongSignals.length * 15,
      60
   );


   score += Math.min(
      matchedResumeSections.length * 8,
      40
   );


   if (hasEmail) {
      score += 15;
   }


   if (hasPhone) {
      score += 10;
   }


   score += Math.min(
      professionalMatches.length * 3,
      15
   );


   // ------------------------------------------
   // Require actual resume structure
   // ------------------------------------------

   const hasResumeStructure =
      matchedStrongSignals.length >= 2 ||
      (
         matchedResumeSections.length >= 3 &&
         hasEmail
      );


   if (!hasResumeStructure) {

      return {
         isResume: false,
         score,
         reason:
            "Document does not contain enough resume-specific sections"
      };

   }


   // ------------------------------------------
   // Final validation
   // ------------------------------------------

   return {

      isResume: true,

      score,

      reason:
         "Resume detected",

      matchedSections:
         matchedResumeSections,

      matchedSignals:
         matchedStrongSignals

   };

};


module.exports = {
   validateResume,
   normalizeText
};