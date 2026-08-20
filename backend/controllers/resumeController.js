const fs = require("fs");

const Resume =
   require("../models/Resume");

const extractTextFromPDF =
   require("../utils/pdfParser");

const {
   extractDictionarySkills
} =
   require("../utils/skillExtractor");


// ============================================================
// SKILL NORMALIZATION
// ============================================================

const normalizeSkill = (skill) => {

   if (
      typeof skill !== "string"
   ) {

      return "";

   }

   return skill
      .trim()
      .replace(/\s+/g, " ");

};


// ============================================================
// MERGE + DEDUPLICATE
// ============================================================
//
// The skillExtractor already performs canonical skill matching.
// This function provides one final safety layer before saving.
//
// Example:
// "OOP"
// "OOP"
// "OOP"
//
// becomes:
//
// "OOP"
//
// ============================================================

const mergeSkills = (
   skills = []
) => {

   const skillMap =
      new Map();


   for (
      const skill of skills
   ) {

      if (
         typeof skill !== "string"
      ) {

         continue;

      }


      const normalized =
         normalizeSkill(skill);


      if (!normalized) {

         continue;

      }


      const key =
         normalized.toLowerCase();


      if (
         !skillMap.has(key)
      ) {

         skillMap.set(
            key,
            normalized
         );

      }

   }


   return [
      ...skillMap.values()
   ];

};


// ============================================================
// LOCAL RESUME VALIDATION
// ============================================================
//
// IMPORTANT:
//
// No Gemini
// No API
// No external AI service
//
// This is NOT intended to perfectly classify every document.
// It is simply a local safety gate that rejects documents that
// clearly look like something other than a resume.
//
// Skill extraction is completely independent of this validation.
//
// ============================================================

const validateResumeLocally = (
   text
) => {

   if (
      typeof text !== "string"
   ) {

      return {

         isResume: false,

         reason:
            "Invalid resume text."

      };

   }


   const normalized =
      text
         .toLowerCase()
         .replace(/\s+/g, " ")
         .trim();


   if (!normalized) {

      return {

         isResume: false,

         reason:
            "No readable text found."

      };

   }


   // ----------------------------------------------------------
   // Minimum readable content
   // ----------------------------------------------------------

   if (
      normalized.length < 100
   ) {

      return {

         isResume: false,

         reason:
            "The uploaded document contains insufficient readable text."

      };

   }


   // ----------------------------------------------------------
   // Strong rejection indicators
   // ----------------------------------------------------------
   //
   // These are deliberately stronger than normal resume words.
   //
   // ----------------------------------------------------------

   const rejectionIndicators = [

      "offer letter",
      "appointment letter",
      "joining letter",
      "job description",
      "job advertisement",
      "job posting",
      "recruitment notice",
      "examination timetable",
      "examination programme",
      "question paper",
      "answer key",
      "mark sheet",
      "marksheet",
      "academic transcript",
      "course brochure",
      "training brochure",
      "company brochure",
      "project report",
      "research paper",
      "lecture notes",
      "user manual",
      "instruction manual",
      "invoice",
      "receipt"

   ];


   // ----------------------------------------------------------
   // Resume indicators
   // ----------------------------------------------------------

   const resumeIndicators = [

      "resume",
      "curriculum vitae",
      "professional summary",
      "career objective",
      "education",
      "academic background",
      "work experience",
      "professional experience",
      "employment",
      "experience",
      "projects",
      "technical skills",
      "skills",
      "certifications",
      "internship",
      "achievements",
      "qualifications",
      "qualification",
      "education",
      "github",
      "linkedin",
      "portfolio",
      "publications",
      "research experience"

   ];


   // ----------------------------------------------------------
   // Count matches
   // ----------------------------------------------------------

   let positiveMatches = 0;

   let negativeMatches = 0;


   for (
      const indicator
      of resumeIndicators
   ) {

      if (
         normalized.includes(
            indicator
         )
      ) {

         positiveMatches++;

      }

   }


   for (
      const indicator
      of rejectionIndicators
   ) {

      if (
         normalized.includes(
            indicator
         )
      ) {

         negativeMatches++;

      }

   }


   // ----------------------------------------------------------
   // Explicit rejection
   // ----------------------------------------------------------
   //
   // A document with multiple strong non-resume indicators
   // should not be accepted just because it contains words
   // such as "skills" or "education".
   //
   // ----------------------------------------------------------

   if (
      negativeMatches >= 2 &&
      positiveMatches < 4
   ) {

      return {

         isResume: false,

         reason:
            "The uploaded document contains strong indicators of a non-resume document."

      };

   }


   // ----------------------------------------------------------
   // Strong single-document rejection
   // ----------------------------------------------------------

   if (
      negativeMatches === 1 &&
      positiveMatches === 0
   ) {

      return {

         isResume: false,

         reason:
            "The uploaded document does not appear to contain candidate resume information."

      };

   }


   // ----------------------------------------------------------
   // Candidate-profile evidence
   // ----------------------------------------------------------
   //
   // We don't require the literal word "resume".
   //
   // A genuine resume can begin with:
   //
   // Vijay Dange
   // Computer Engineering
   // Pune
   // Education
   // Projects
   // Skills
   //
   // ----------------------------------------------------------

   const hasCandidateIdentity =
      /\b(email|e-mail|phone|mobile|linkedin|github|portfolio)\b/i.test(
         normalized
      );


   const hasCandidateSections =
      positiveMatches >= 2;


   // ----------------------------------------------------------
   // Accept when sufficient resume evidence exists
   // ----------------------------------------------------------

   if (
      hasCandidateSections ||
      (
         hasCandidateIdentity &&
         positiveMatches >= 1
      )
   ) {

      return {

         isResume: true,

         reason:
            "The document contains multiple indicators of a candidate resume."

      };

   }


   // ----------------------------------------------------------
   // Otherwise reject
   // ----------------------------------------------------------

   return {

      isResume: false,

      reason:
         "The uploaded document does not contain enough resume-related information."

   };

};


// ============================================================
// DELETE FILE SAFELY
// ============================================================

const deleteUploadedFile = (
   filePath
) => {

   if (!filePath) {

      return;

   }


   try {

      if (
         fs.existsSync(
            filePath
         )
      ) {

         fs.unlinkSync(
            filePath
         );


         console.log(
            "Rejected PDF deleted:",
            filePath
         );

      }

   } catch (error) {

      console.error(
         "Failed to delete uploaded PDF:",
         error.message
      );

   }

};


// ============================================================
// UPLOAD RESUME
// ============================================================

const uploadResume = async (
   req,
   res
) => {

   let savedResume = false;


   try {

      // ======================================================
      // 1. AUTHENTICATION
      // ======================================================

      if (
         !req.user ||
         !req.user.userId
      ) {

         return res.status(401).json({

            success: false,

            message:
               "Authentication required"

         });

      }


      // ======================================================
      // 2. FILE CHECK
      // ======================================================

      if (!req.file) {

         return res.status(400).json({

            success: false,

            message:
               "Please upload a PDF resume"

         });

      }


      // ======================================================
      // 3. MIME TYPE CHECK
      // ======================================================

      if (
         req.file.mimetype !==
         "application/pdf"
      ) {

         deleteUploadedFile(
            req.file.path
         );


         return res.status(400).json({

            success: false,

            message:
               "Only PDF resumes are allowed"

         });

      }


      // ======================================================
      // 4. EXTRACT PDF TEXT
      // ======================================================

      const extractedText =
         await extractTextFromPDF(
            req.file.path
         );


      if (
         !extractedText ||
         !extractedText.trim()
      ) {

         deleteUploadedFile(
            req.file.path
         );


         return res.status(400).json({

            success: false,

            message:
               "Could not extract readable text from the uploaded PDF. If this is a scanned resume, OCR support is required."

         });

      }


      console.log(
         "Extracted text length:",
         extractedText.length
      );


      // ======================================================
      // 5. LOCAL RESUME VALIDATION
      // ======================================================
      //
      // IMPORTANT:
      //
      // Gemini is NOT used here.
      //
      // ======================================================

      console.log(
         "Validating uploaded PDF locally..."
      );


      const resumeValidation =
         validateResumeLocally(
            extractedText
         );


      console.log(
         "Local resume validation:",
         resumeValidation
      );


      if (
         !resumeValidation.isResume
      ) {

         deleteUploadedFile(
            req.file.path
         );


         return res.status(400).json({

            success: false,

            message:
               "The uploaded PDF does not appear to be a valid resume or CV. Please upload your resume.",

            reason:
               resumeValidation.reason

         });

      }


      // ======================================================
      // 6. TECHNICAL SKILL EXTRACTION
      // ======================================================
      //
      // NO GEMINI
      // NO API
      // NO AI
      //
      // The local skill dictionary supports multiple branches.
      //
      // ======================================================

      console.log(
         "Extracting technical skills locally..."
      );


      let dictionarySkills = [];


      try {

         dictionarySkills =
            extractDictionarySkills(
               extractedText
            );


         if (
            !Array.isArray(
               dictionarySkills
            )
         ) {

            dictionarySkills = [];

         }

      } catch (error) {

         console.error(
            "Technical skill extraction error:",
            error
         );


         dictionarySkills = [];

      }


      console.log(
         "Dictionary technical skills:",
         dictionarySkills
      );


      // ======================================================
      // 7. MERGE + DEDUPLICATE
      // ======================================================

      const skills =
         mergeSkills(
            dictionarySkills
         );


      console.log(
         "Final technical skills:",
         skills
      );


      // ======================================================
      // 8. SAVE RESUME
      // ======================================================

      const resume =
         await Resume.create({

            user:
               req.user.userId,

            originalName:
               req.file.originalname,

            filePath:
               req.file.path,

            extractedText:
               extractedText,

            skills:
               skills

         });


      savedResume = true;


      console.log(
         "Resume saved successfully:",
         resume._id
      );


      // ======================================================
      // 9. RESPONSE
      // ======================================================

      return res.status(201).json({

         success: true,

         message:
            skills.length > 0
               ? "Resume uploaded and technical skills extracted successfully"
               : "Resume uploaded successfully, but no recognized technical skills were detected",

         resume: {

            id:
               resume._id,

            originalName:
               resume.originalName,

            filePath:
               resume.filePath,

            skills:
               resume.skills,

            createdAt:
               resume.createdAt

         }

      });


   } catch (error) {

      console.error(
         "Resume upload error:",
         error
      );


      // ------------------------------------------------------
      // Delete uploaded file if DB save failed
      // ------------------------------------------------------

      if (
         !savedResume &&
         req.file &&
         req.file.path
      ) {

         deleteUploadedFile(
            req.file.path
         );

      }


      return res.status(500).json({

         success: false,

         message:
            "Server error during resume processing"

      });

   }

};


// ============================================================
// GET LATEST RESUME
// ============================================================

const getLatestResume = async (
   req,
   res
) => {

   try {

      // ======================================================
      // 1. AUTHENTICATION
      // ======================================================

      if (
         !req.user ||
         !req.user.userId
      ) {

         return res.status(401).json({

            success: false,

            message:
               "Authentication required"

         });

      }


      // ======================================================
      // 2. FIND LATEST RESUME
      // ======================================================

      const resume =
         await Resume.findOne({

            user:
               req.user.userId

         }).sort({

            createdAt: -1

         });


      // ======================================================
      // 3. NO RESUME
      // ======================================================

      if (!resume) {

         return res.status(404).json({

            success: false,

            message:
               "No resume found"

         });

      }


      // ======================================================
      // 4. RESPONSE
      // ======================================================

      return res.status(200).json({

         success: true,

         resume: {

            id:
               resume._id,

            originalName:
               resume.originalName,

            filePath:
               resume.filePath,

            extractedText:
               resume.extractedText,

            skills:
               resume.skills || [],

            createdAt:
               resume.createdAt,

            updatedAt:
               resume.updatedAt

         }

      });

   } catch (error) {

      console.error(
         "Get latest resume error:",
         error
      );


      return res.status(500).json({

         success: false,

         message:
            "Server error while fetching latest resume"

      });

   }

};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

   uploadResume,

   getLatestResume

};