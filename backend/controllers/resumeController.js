const Resume = require("../models/Resume");
const extractTextFromPDF = require("../utils/pdfParser");
const extractSkills = require("../utils/skillExtractor");

const uploadResume = async (req, res) => {
   try {

      if (!req.user || !req.user.userId) {
         return res.status(401).json({
            success: false,
            message: "Authentication required"
         });
      }

      if (!req.file) {
         return res.status(400).json({
            success: false,
            message: "Please upload a PDF resume"
         });
      }

      if (
         req.file.mimetype !== "application/pdf"
      ) {
         return res.status(400).json({
            success: false,
            message: "Only PDF resumes are allowed"
         });
      }

      const extractedText =
         await extractTextFromPDF(
            req.file.path
         );


      if (
         !extractedText ||
         !extractedText.trim()
      ) {
         return res.status(400).json({
            success: false,
            message:
               "Could not extract text from the resume"
         });
      }

      const skills =
         extractSkills(extractedText);


      console.log(
         "Extracted text length:",
         extractedText.length
      );

      console.log(
         "Detected skills:",
         skills
      );

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
               Array.isArray(skills)
                  ? skills
                  : []

         });

      console.log(
         "Resume saved successfully:",
         resume._id
      );

      return res.status(201).json({

         success: true,

         message:
            "Resume uploaded and analyzed successfully",

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


      return res.status(500).json({

         success: false,

         message:
            "Server error during resume processing"

      });
   }
};

const getLatestResume = async (req, res) => {

   try {

      if (!req.user || !req.user.userId) {

         return res.status(401).json({

            success: false,

            message:
               "Authentication required"

         });
      }

      const resume =
         await Resume.findOne({

            user:
               req.user.userId

         }).sort({

            createdAt: -1

         });

      if (!resume) {

         return res.status(404).json({

            success: false,

            message:
               "No resume found"

         });
      }
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

module.exports = {

   uploadResume,

   getLatestResume

};