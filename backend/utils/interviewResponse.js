const sanitizeInterview = (interview) => {

   if (!interview) {
      return null;
   }

   const source =
      typeof interview.toObject === "function"
         ? interview.toObject()
         : interview;

   return {

      id:
         source._id,

      type:
         source.type,

      difficulty:
         source.difficulty,

      numberOfQuestions:
         source.numberOfQuestions,

      focusAreas:
         source.focusAreas || [],

      status:
         source.status,

      score:
         source.score,

      completedAt:
         source.completedAt,

      createdAt:
         source.createdAt,

      resume:
         source.resume
            ? {
               _id:
                  source.resume._id,

               originalName:
                  source.resume.originalName
            }
            : null,

      questions:
         Array.isArray(source.questions)

            ? source.questions.map(
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
                     Array.isArray(
                        question.options
                     )
                        ? question.options
                        : [],

                  userAnswer:
                     question.userAnswer || "",

                  score:
                     typeof question.score === "number"
                        ? question.score
                        : null,

                  feedback:
                     question.feedback || ""

               })
            )

            : []

   };
};

const sanitizeInterviewListItem = (
   interview
) => {

   if (!interview) {
      return null;
   }

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
         interview.focusAreas || [],

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

   };
};

module.exports = {

   sanitizeInterview,

   sanitizeInterviewListItem

};