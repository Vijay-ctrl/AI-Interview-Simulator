const express = require("express");

const {
   createInterview,
   generateInterviewQuestions,
   submitAnswer,
   completeInterview,
   getInterview,
   getInterviewResult,
   getInterviews
} = require("../controllers/interviewController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
   "/create",
   authMiddleware,
   createInterview
);

router.post(
   "/:id/generate",
   authMiddleware,
   generateInterviewQuestions
);

router.post(
   "/:id/questions/:questionId/answer",
   authMiddleware,
   submitAnswer
);

router.post(
   "/:id/complete",
   authMiddleware,
   completeInterview
);

router.get(
   "/",
   authMiddleware,
   getInterviews
);

router.get(
   "/:id/result",
   authMiddleware,
   getInterviewResult
);

router.get(
   "/:id",
   authMiddleware,
   getInterview
);


module.exports = router;