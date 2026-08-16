
const User = require("../models/User");
const Resume = require("../models/Resume");
const Interview = require("../models/Interview");

const getDashboard = async (req, res) => {
   try {
      console.log("=================================");
      console.log("GET /api/dashboard");
      console.log("req.user:", req.user);
      console.log("=================================");

      const userId =
         req.user?.userId ||
         req.user?.id ||
         req.user?._id;

      if (!userId) {
         console.error(
            "Dashboard error: User ID missing from req.user"
         );

         return res.status(401).json({
            success: false,
            message: "Authentication failed. User ID not found."
         });
      }

      console.log("Dashboard userId:", userId);

      const user = await User.findById(userId)
         .select("-password")
         .lean();

      if (!user) {
         console.error(
            "Dashboard error: User not found:",
            userId
         );

         return res.status(404).json({
            success: false,
            message: "User not found."
         });
      }

      console.log(
         "Dashboard user found:",
         user.email
      );

      const resume = await Resume.findOne({
         user: userId
      })
         .sort({
            createdAt: -1
         })
         .lean();

      console.log(
         "Dashboard resume:",
         resume ? resume.originalName : "No resume"
      );

      const interviews = await Interview.find({
         user: userId
      })
         .sort({
            createdAt: -1
         })
         .lean();

      console.log(
         "Dashboard interviews:",
         interviews.length
      );

      const totalInterviews =
         interviews.length;

      const completedInterviews =
         interviews.filter(
            (interview) =>
               interview.status === "completed"
         );

      const inProgressInterviews =
         interviews.filter(
            (interview) =>
               interview.status === "in-progress"
         );

      const createdInterviews =
         interviews.filter(
            (interview) =>
               interview.status === "created"
         );

      let averageScore = 0;

      if (completedInterviews.length > 0) {
         const totalScore =
            completedInterviews.reduce(
               (sum, interview) => {
                  const score =
                     Number(interview.score);

                  return (
                     sum +
                     (
                        Number.isFinite(score)
                           ? score
                           : 0
                     )
                  );
               },
               0
            );

         averageScore =
            totalScore /
            completedInterviews.length;
      }

      const averagePercentage =
         averageScore * 10;

      const recentInterviews =
         interviews
            .slice(0, 10)
            .map((interview) => {
               const score =
                  Number(interview.score);

               const validScore =
                  Number.isFinite(score);

               return {
                  id:
                     interview._id,

                  type:
                     interview.type || "mixed",

                  difficulty:
                     interview.difficulty || "medium",

                  numberOfQuestions:
                     interview.numberOfQuestions || 0,

                  focusAreas:
                     Array.isArray(
                        interview.focusAreas
                     )
                        ? interview.focusAreas
                        : [],

                  status:
                     interview.status || "created",

                  score:
                     validScore
                        ? score
                        : null,

                  percentage:
                     validScore
                        ? Number(
                           (
                              score * 10
                           ).toFixed(2)
                        )
                        : null,

                  createdAt:
                     interview.createdAt,

                  completedAt:
                     interview.updatedAt,

                  resume:
                     null
               };
            });

      const dashboardData = {
         success: true,

         user: {
            id:
               user._id,

            name:
               user.name || "User",

            email:
               user.email || ""
         },

         resume: resume
            ? {
               id:
                  resume._id,

               originalName:
                  resume.originalName ||
                  "Resume.pdf",

               skills:
                  Array.isArray(
                     resume.skills
                  )
                     ? resume.skills
                     : [],

               createdAt:
                  resume.createdAt
            }
            : null,

         statistics: {
            totalInterviews,

            completedInterviews:
               completedInterviews.length,

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

         recentInterviews
      };

      console.log(
         "Dashboard data prepared successfully."
      );

      return res.status(200).json(
         dashboardData
      );

   } catch (error) {
      console.error(
         "================================="
      );

      console.error(
         "DASHBOARD CONTROLLER ERROR"
      );

      console.error(
         "Message:",
         error.message
      );

      console.error(
         "Stack:",
         error.stack
      );

      console.error(
         "================================="
      );

      return res.status(500).json({
         success: false,
         message:
            "Server error while loading dashboard",

         error:
            process.env.NODE_ENV === "production"
               ? undefined
               : error.message
      });
   }
};

module.exports = {
   getDashboard
};