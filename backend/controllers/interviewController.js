const Interview =
   require("../models/Interview");

const Resume =
   require("../models/Resume");

const generateAIQuestions =
   require("../services/aiQuestionGenerator");

const evaluateAnswer =
   require("../services/aiAnswerEvaluator");

const normalizeInterviewType = (type) => {

   if (!type) {
      return "technical";
   }

   const normalized =
      String(type)
         .trim()
         .toLowerCase();

   const typeMap = {

      technical: "technical",

      hr: "behavioral",

      behavioral: "behavioral",

      behaviour: "behavioral",

      mixed: "mixed"

   };

   return typeMap[normalized] || null;
};

const normalizeDifficulty = (difficulty) => {

   if (!difficulty) {
      return "medium";
   }

   const normalized =
      String(difficulty)
         .trim()
         .toLowerCase();

   if (
      ["easy", "medium", "hard"]
         .includes(normalized)
   ) {

      return normalized;
   }

   return null;
};

const sanitizeActiveQuestion = (
   question,
   index
) => {

   const safeQuestion = {

      questionNumber:
         index + 1,

      questionId:
         question._id,

      question:
         question.question,

      topic:
         question.topic,

      type:
         question.type,

      difficulty:
         question.difficulty

   };

   if (
      question.type === "mcq"
   ) {

      safeQuestion.options =
         Array.isArray(question.options)
            ? question.options
            : [];

   }

   return safeQuestion;
};

const sanitizeActiveInterview = (
   interview
) => {

   return {

      id:
         interview._id,

      type:
         interview.type,

      difficulty:
         interview.difficulty,

      numberOfQuestions:
         interview.numberOfQuestions,

      focusAreas:
         interview.focusAreas,

      status:
         interview.status,

      score:
         interview.status === "completed"
            ? interview.score
            : null,

      completedAt:
         interview.status === "completed"
            ? interview.completedAt
            : null,

      questions:
         interview.questions.map(
            sanitizeActiveQuestion
         )

   };
};

const createInterview = async (
   req,
   res
) => {

   try {

      const userId =
         req.user.userId;

      const {
         resumeId,
         type,
         difficulty,
         numberOfQuestions,
         focusAreas
      } = req.body;


      if (!resumeId) {

         return res.status(400).json({

            success: false,

            message:
               "Resume ID is required"

         });
      }


      const resume =
         await Resume.findOne({

            _id:
               resumeId,

            user:
               userId

         });


      if (!resume) {

         return res.status(404).json({

            success: false,

            message:
               "Resume not found"

         });
      }


      const normalizedType =
         normalizeInterviewType(type);


      if (!normalizedType) {

         return res.status(400).json({

            success: false,

            message:
               "Invalid interview type"

         });
      }


      const normalizedDifficulty =
         normalizeDifficulty(difficulty);


      if (!normalizedDifficulty) {

         return res.status(400).json({

            success: false,

            message:
               "Invalid interview difficulty"

         });
      }


      const questionCount =
         Number(numberOfQuestions) || 10;


      if (
         ![5, 10, 15, 20]
            .includes(questionCount)
      ) {

         return res.status(400).json({

            success: false,

            message:
               "Question count must be 5, 10, 15, or 20"

         });
      }


      let interviewFocusAreas = [];


      if (
         Array.isArray(focusAreas) &&
         focusAreas.length > 0
      ) {

         interviewFocusAreas =
            focusAreas
               .map(
                  item =>
                     String(item).trim()
               )
               .filter(Boolean);

      }


      if (
         interviewFocusAreas.length === 0 &&
         Array.isArray(resume.skills)
      ) {

         interviewFocusAreas =
            resume.skills
               .map(
                  skill =>
                     String(skill).trim()
               )
               .filter(Boolean);

      }


      if (
         interviewFocusAreas.length === 0
      ) {

         return res.status(400).json({

            success: false,

            message:
               "No focus areas or resume skills found"

         });
      }


      const interview =
         await Interview.create({

            user:
               userId,

            resume:
               resume._id,

            type:
               normalizedType,

            difficulty:
               normalizedDifficulty,

            numberOfQuestions:
               questionCount,

            focusAreas:
               interviewFocusAreas,

            questions:
               [],

            status:
               "created",

            score:
               null,

            completedAt:
               null

         });


      console.log(
         "Interview created:",
         interview._id
      );


      return res.status(201).json({

         success: true,

         message:
            "Interview created successfully",

         interview: {

            id:
               interview._id,

            type:
               interview.type,

            difficulty:
               interview.difficulty,

            numberOfQuestions:
               interview.numberOfQuestions,

            focusAreas:
               interview.focusAreas,

            status:
               interview.status,

            score:
               null,

            completedAt:
               null

         }

      });

   } catch (error) {

      console.error(
         "Interview creation error:",
         error
      );


      return res.status(500).json({

         success: false,

         message:
            "Server error while creating interview"

      });

   }

};

const generateInterviewQuestions = async (
   req,
   res
) => {

   console.log(
      "🔥 generateInterviewQuestions controller called"
   );

   console.log(
      "Interview ID:",
      req.params.id
   );


   try {

      const userId =
         req.user.userId;

      const interviewId =
         req.params.id;


      const interview =
         await Interview.findOne({

            _id:
               interviewId,

            user:
               userId

         });


      if (!interview) {

         return res.status(404).json({

            success: false,

            message:
               "Interview not found"

         });
      }


      if (
         interview.status === "completed"
      ) {

         return res.status(400).json({

            success: false,

            message:
               "This interview has already been completed"

         });
      }


      if (
         interview.status === "in-progress" &&
         interview.questions.length > 0
      ) {

         return res.status(400).json({

            success: false,

            message:
               "Questions have already been generated for this interview"

         });
      }


      const resume =
         await Resume.findOne({

            _id:
               interview.resume,

            user:
               userId

         });


      if (!resume) {

         return res.status(404).json({

            success: false,

            message:
               "Resume not found"

         });
      }


      if (
         !resume.extractedText ||
         !resume.extractedText.trim()
      ) {

         return res.status(400).json({

            success: false,

            message:
               "Resume text has not been extracted"

         });
      }


      if (
         !interview.focusAreas ||
         interview.focusAreas.length === 0
      ) {

         return res.status(400).json({

            success: false,

            message:
               "No focus areas available"

         });
      }


      console.log(
         "Generating AI interview questions..."
      );


      const questions =
         await generateAIQuestions({

            resumeText:
               resume.extractedText,

            skills:
               resume.skills || [],

            interviewType:
               interview.type,

            difficulty:
               interview.difficulty,

            numberOfQuestions:
               interview.numberOfQuestions,

            focusAreas:
               interview.focusAreas

         });


      if (
         !Array.isArray(questions) ||
         questions.length === 0
      ) {

         return res.status(500).json({

            success: false,

            message:
               "Gemini did not generate any questions"

         });
      }


      if (
         questions.length !==
         interview.numberOfQuestions
      ) {

         return res.status(500).json({

            success: false,

            message:
               `Gemini returned ${questions.length} questions instead of ${interview.numberOfQuestions}`

         });
      }

      interview.questions =
         questions;

      interview.status =
         "in-progress";

      interview.score =
         null;

      interview.completedAt =
         null;


      await interview.save();


      console.log(
         `Generated ${questions.length} questions`
      );

      const safeInterview =
         sanitizeActiveInterview(
            interview
         );


      console.log(
         "🔥 Returning sanitized interview"
      );


      console.log(
         JSON.stringify(
            safeInterview,
            null,
            2
         )
      );


      return res.status(200).json({

         success: true,

         message:
            "AI interview questions generated successfully",

         interview:
            safeInterview

      });

   } catch (error) {

      console.error(
         "AI question generation error:",
         error
      );


      if (
         error.status === 429 ||
         error.code === 429 ||
         String(error.message)
            .toLowerCase()
            .includes("quota exceeded") ||
         String(error.message)
            .includes("429")
      ) {

         return res.status(429).json({

            success: false,

            message:
               "Gemini API quota exceeded. Please try again later."

         });
      }


      return res.status(500).json({

         success: false,

         message:
            "Server error while generating AI questions"

      });

   }

};

const submitAnswer = async (
   req,
   res
) => {

   try {

      const userId =
         req.user.userId;

      const {
         id: interviewId,
         questionId
      } = req.params;

      const {
         userAnswer
      } = req.body;


      if (
         typeof userAnswer !== "string" ||
         !userAnswer.trim()
      ) {

         return res.status(400).json({

            success: false,

            message:
               "Please provide an answer"

         });
      }


      const interview =
         await Interview.findOne({

            _id:
               interviewId,

            user:
               userId

         });


      if (!interview) {

         return res.status(404).json({

            success: false,

            message:
               "Interview not found"

         });
      }


      if (
         interview.status === "completed"
      ) {

         return res.status(400).json({

            success: false,

            message:
               "Interview has already been completed"

         });
      }


      if (
         interview.status !== "in-progress"
      ) {

         return res.status(400).json({

            success: false,

            message:
               "Interview is not currently in progress"

         });
      }


      const question =
         interview.questions.id(
            questionId
         );


      if (!question) {

         return res.status(404).json({

            success: false,

            message:
               "Question not found"

         });
      }


      if (
         question.userAnswer &&
         question.userAnswer.trim()
      ) {

         return res.status(400).json({

            success: false,

            message:
               "This question has already been answered"

         });
      }


      console.log(
         "Evaluating answer with Gemini..."
      );


      const evaluation =
         await evaluateAnswer({

            question:
               question.question,

            expectedAnswer:
               question.expectedAnswer,

            userAnswer:
               userAnswer.trim(),

            topic:
               question.topic,

            type:
               question.type,

            difficulty:
               question.difficulty

         });


      if (
         !evaluation ||
         typeof evaluation.score !== "number" ||
         typeof evaluation.feedback !== "string"
      ) {

         throw new Error(
            "Invalid evaluation returned by Gemini"
         );
      }


      question.userAnswer =
         userAnswer.trim();

      question.score =
         Math.max(
            0,
            Math.min(
               10,
               evaluation.score
            )
         );

      question.feedback =
         evaluation.feedback;


      await interview.save();


      return res.status(200).json({

         success: true,

         message:
            "Answer evaluated successfully",

         result: {

            questionId:
               question._id,

            score:
               question.score,

            feedback:
               question.feedback

         }

      });

   } catch (error) {

      console.error(
         "Answer evaluation error:",
         error
      );


      if (
         error.status === 429 ||
         error.code === 429 ||
         String(error.message)
            .toLowerCase()
            .includes("quota exceeded") ||
         String(error.message)
            .includes("429")
      ) {

         return res.status(429).json({

            success: false,

            message:
               "Gemini API quota exceeded. Please try again later."

         });
      }


      return res.status(500).json({

         success: false,

         message:
            "Server error while evaluating answer"

      });

   }

};

const completeInterview = async (
   req,
   res
) => {

   try {

      const userId =
         req.user.userId;

      const interviewId =
         req.params.id;


      const interview =
         await Interview.findOne({

            _id:
               interviewId,

            user:
               userId

         });


      if (!interview) {

         return res.status(404).json({

            success: false,

            message:
               "Interview not found"

         });
      }


      if (
         interview.status === "completed"
      ) {

         return res.status(400).json({

            success: false,

            message:
               "Interview is already completed",

            result: {

               interviewId:
                  interview._id,

               status:
                  interview.status,

               score:
                  interview.score,

               completedAt:
                  interview.completedAt

            }

         });
      }

      if (
         interview.status !== "in-progress"
      ) {

         return res.status(400).json({

            success: false,

            message:
               "Interview is not currently in progress"

         });
      }

      if (
         !Array.isArray(interview.questions) ||
         interview.questions.length === 0
      ) {

         return res.status(400).json({

            success: false,

            message:
               "No questions found for this interview"

         });
      }

      const unansweredQuestions =
         interview.questions.filter(
            question =>
               !question.userAnswer ||
               !question.userAnswer.trim()
         );

      if (
         unansweredQuestions.length > 0
      ) {

         return res.status(400).json({

            success: false,

            message:
               "Please answer all questions before completing the interview",

            unansweredQuestions:
               unansweredQuestions.length

         });
      }

      const unevaluatedQuestions =
         interview.questions.filter(
            question =>
               typeof question.score !== "number"
         );


      if (
         unevaluatedQuestions.length > 0
      ) {

         return res.status(400).json({

            success: false,

            message:
               "Some answers have not been evaluated yet",

            unevaluatedQuestions:
               unevaluatedQuestions.length

         });
      }

      const totalQuestions =
         interview.questions.length;


      const totalScore =
         interview.questions.reduce(
            (total, question) =>
               total + question.score,
            0
         );

      const averageScore =
         totalQuestions > 0
            ? totalScore / totalQuestions
            : 0;

      const percentage =
         averageScore * 10;

      interview.score =
         Number(
            averageScore.toFixed(2)
         );

      interview.status =
         "completed";

      interview.completedAt =
         new Date();

      await interview.save();

      return res.status(200).json({

         success: true,

         message:
            "Interview completed successfully",

         result: {

            interviewId:
               interview._id,

            totalQuestions:
               totalQuestions,

            answeredQuestions:
               totalQuestions,

            totalScore:
               Number(
                  totalScore.toFixed(2)
               ),

            averageScore:
               Number(
                  averageScore.toFixed(2)
               ),

            percentage:
               Number(
                  percentage.toFixed(2)
               ),

            status:
               interview.status,

            score:
               interview.score,

            completedAt:
               interview.completedAt
         }

      });

   } catch (error) {

      console.error(
         "Interview completion error:",
         error
      );

      return res.status(500).json({

         success: false,

         message:
            "Server error while completing interview"

      });

   }

};

const getInterview = async (
   req,
   res
) => {

   try {

      const userId =
         req.user.userId;

      const interviewId =
         req.params.id;


      const interview =
         await Interview.findOne({

            _id:
               interviewId,

            user:
               userId

         })
            .populate(
               "resume",
               "originalName"
            );


      if (!interview) {

         return res.status(404).json({

            success: false,

            message:
               "Interview not found"

         });
      }


      const safeInterview =
         sanitizeActiveInterview(
            interview
         );


      return res.status(200).json({

         success: true,

         interview:
            safeInterview

      });

   } catch (error) {

      console.error(
         "Get interview error:",
         error
      );


      return res.status(500).json({

         success: false,

         message:
            "Server error while fetching interview"

      });

   }

};

const getInterviewResult = async (
   req,
   res
) => {

   try {

      const userId =
         req.user.userId;

      const interviewId =
         req.params.id;


      const interview =
         await Interview.findOne({

            _id:
               interviewId,

            user:
               userId

         })
            .populate(
               "resume",
               "originalName"
            );


      if (!interview) {

         return res.status(404).json({

            success: false,

            message:
               "Interview not found"

         });
      }


      if (
         interview.status !== "completed"
      ) {

         return res.status(400).json({

            success: false,

            message:
               "Interview has not been completed yet"

         });
      }


      const totalQuestions =
         interview.questions.length;


      const answeredQuestions =
         interview.questions.filter(
            question =>
               question.userAnswer &&
               question.userAnswer.trim()
         ).length;


      const totalScore =
         interview.questions.reduce(
            (total, question) =>
               total +
               (
                  typeof question.score === "number"
                     ? question.score
                     : 0
               ),
            0
         );


      const averageScore =
         totalQuestions > 0
            ? totalScore / totalQuestions
            : 0;


      const percentage =
         averageScore * 10;


      const resultQuestions =
         interview.questions.map(
            (question, index) => ({

               questionNumber:
                  index + 1,

               questionId:
                  question._id,

               question:
                  question.question,

               topic:
                  question.topic,

               type:
                  question.type,

               difficulty:
                  question.difficulty,

               options:
                  question.type === "mcq"
                     ? question.options || []
                     : [],

               userAnswer:
                  question.userAnswer,

               score:
                  question.score,

               feedback:
                  question.feedback

            })
         );

      return res.status(200).json({

         success: true,

         result: {

            interviewId:
               interview._id,

            resume:
               interview.resume,

            type:
               interview.type,

            difficulty:
               interview.difficulty,

            numberOfQuestions:
               interview.numberOfQuestions,

            focusAreas:
               interview.focusAreas,

            status:
               interview.status,

            score:
               interview.score,

            completedAt:
               interview.completedAt,

            totalQuestions:
               totalQuestions,

            answeredQuestions:
               answeredQuestions,

            totalScore:
               Number(
                  totalScore.toFixed(2)
               ),

            averageScore:
               Number(
                  averageScore.toFixed(2)
               ),

            percentage:
               Number(
                  percentage.toFixed(2)
               ),

            questions:
               resultQuestions

         }

      });

   } catch (error) {

      console.error(
         "Get interview result error:",
         error
      );

      return res.status(500).json({

         success: false,

         message:
            "Server error while fetching interview result"

      });

   }

};

const getInterviews = async (
   req,
   res
) => {

   try {

      const userId =
         req.user.userId;


      const interviews =
         await Interview.find({

            user:
               userId

         })
            .populate(
               "resume",
               "originalName"
            )
            .sort({
               createdAt: -1
            });


      const totalInterviews =
         interviews.length;


      const completedInterviews =
         interviews.filter(
            interview =>
               interview.status === "completed"
         );


      const inProgressInterviews =
         interviews.filter(
            interview =>
               interview.status === "in-progress"
         );


      const createdInterviews =
         interviews.filter(
            interview =>
               interview.status === "created"
         );


      const completedCount =
         completedInterviews.length;


      const totalScore =
         completedInterviews.reduce(
            (total, interview) =>
               total +
               (
                  typeof interview.score === "number"
                     ? interview.score
                     : 0
               ),
            0
         );

      const averageScore =
         completedCount > 0
            ? totalScore / completedCount
            : 0;


      const averagePercentage =
         averageScore * 10;


      const safeInterviews =
         interviews.map(
            interview => ({

               id:
                  interview._id,

               type:
                  interview.type,

               difficulty:
                  interview.difficulty,

               numberOfQuestions:
                  interview.numberOfQuestions,

               focusAreas:
                  interview.focusAreas,

               status:
                  interview.status,

               score:
                  interview.score,

               percentage:
                  typeof interview.score === "number"
                     ? Number(
                        (
                           interview.score * 10
                        ).toFixed(2)
                     )
                     : null,

               createdAt:
                  interview.createdAt,

               completedAt:
                  interview.completedAt,

               resume:
                  interview.resume?.originalName ||
                  null

            })
         );

      const recentInterviews =
         safeInterviews.slice(0, 10);


      return res.status(200).json({

         success: true,

         count:
            totalInterviews,

         statistics: {

            totalInterviews:
               totalInterviews,

            completedInterviews:
               completedCount,

            inProgressInterviews:
               inProgressInterviews.length,

            createdInterviews:
               createdInterviews.length,

            averageScore:
               Number(
                  averageScore.toFixed(2)
               ),

            averagePercentage:
               Number(
                  averagePercentage.toFixed(2)
               )

         },

         interviews:
            safeInterviews,

         recentInterviews:
            recentInterviews

      });

   } catch (error) {

      console.error(
         "Get interviews error:",
         error
      );


      return res.status(500).json({

         success: false,

         message:
            "Server error while fetching interviews"

      });

   }

};

module.exports = {

   createInterview,

   generateInterviewQuestions,

   submitAnswer,

   completeInterview,

   getInterview,

   getInterviewResult,

   getInterviews

};