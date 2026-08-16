const { GoogleGenAI } =
   require("@google/genai");


const ai =
   new GoogleGenAI({
      apiKey:
         process.env.GEMINI_API_KEY
   });

const evaluateAnswer = async ({
   question,
   expectedAnswer,
   userAnswer,
   topic,
   type,
   difficulty,
   options,
   correctOption
}) => {

   if (!process.env.GEMINI_API_KEY) {

      throw new Error(
         "GEMINI_API_KEY is not configured"
      );
   }

   let mcqInformation = "";


   if (type === "mcq") {

      mcqInformation = `
This is a multiple-choice question.

OPTIONS:
${(options || []).join("\n")}

CORRECT OPTION:
${correctOption}

For an MCQ:

- If the candidate selected the correct option, award
  appropriate credit.
- If the candidate selected an incorrect option, the score
  should normally be very low.
- Do not give full credit to an incorrect option merely
  because the explanation sounds reasonable.
- If the candidate provides the correct option plus a
  technically correct explanation, give full credit.
`;
   }

   const prompt = `
You are an expert senior software engineering interviewer
evaluating a candidate's answer.

Evaluate the candidate fairly based on the actual requirements
of the question.



${question}

${topic}

${type}

${difficulty}

${expectedAnswer}

${userAnswer}

${mcqInformation}


Evaluate according to the QUESTION TYPE.

The question type is:

${type}


------------------------------------------------------------
CONCEPTUAL
------------------------------------------------------------

Consider:

- Technical correctness
- Understanding
- Completeness
- Relevance
- Clarity

Focus on actual understanding rather than memorized wording.


------------------------------------------------------------
PRACTICAL
------------------------------------------------------------

Consider:

- Whether the proposed solution would work
- Technical reasoning
- Practical implementation
- Error handling
- Trade-offs
- Real-world considerations


------------------------------------------------------------
CODING
------------------------------------------------------------

Consider:

- Algorithm correctness
- Logic
- Approach
- Edge cases
- Time complexity when relevant
- Space complexity when relevant
- Code correctness if code is provided

Do not require perfect syntax if the algorithm is correct.


------------------------------------------------------------
PROBLEM-SOLVING
------------------------------------------------------------

Consider:

- Problem understanding
- Approach
- Reasoning
- Correctness
- Optimization
- Complexity
- Edge cases


------------------------------------------------------------
DEBUGGING
------------------------------------------------------------

Consider:

- Correct identification of the problem
- Understanding why the problem occurs
- Whether the proposed fix works
- Technical reasoning
- Possible edge cases


------------------------------------------------------------
DATABASE
------------------------------------------------------------

Consider:

- Query correctness
- Indexing
- Database concepts
- Transactions
- Concurrency
- Schema decisions
- Efficiency
- SQL/MongoDB correctness


------------------------------------------------------------
API-BACKEND
------------------------------------------------------------

Consider:

- HTTP concepts
- REST API behavior
- Authentication
- Authorization
- Validation
- Error handling
- Security
- Performance
- Backend implementation


------------------------------------------------------------
SCENARIO
------------------------------------------------------------

Consider:

- Quality of reasoning
- Practicality
- Technical decision-making
- Trade-offs
- Ability to explain the approach
- Real-world engineering judgment


------------------------------------------------------------
PROJECT
------------------------------------------------------------

Consider:

- Understanding of the project
- Understanding of technologies used
- Implementation decisions
- Architecture
- Challenges
- Trade-offs
- Ability to explain their own work


------------------------------------------------------------
MCQ
------------------------------------------------------------

For an MCQ:

- Compare the candidate's selected option with the correct
  option.
- Correct option should receive high credit.
- Incorrect option should not receive high credit.
- Evaluate any explanation provided.
- Do not give full credit to an incorrect choice.


============================================================
GENERAL SCORING
============================================================

0-2:

Incorrect, irrelevant, or demonstrates almost no understanding.


3-4:

Very limited understanding.

Major technical problems exist.


5-6:

Partially correct.

Demonstrates some understanding but has important gaps.


7-8:

Good answer.

Mostly correct with only minor omissions or issues.


9:

Very strong answer.

Correct, clear, technically sound and covers important aspects.


10:

Excellent answer.

Complete, technically accurate, well-reasoned and demonstrates
strong practical understanding.


============================================================
FAIRNESS RULES
============================================================

- Do not require exact wording from expectedAnswer.
- Equivalent technically correct answers must receive credit.
- Do not penalize different wording.
- Do not give 0 simply because the answer is short.
- Give partial credit when the core idea is correct.
- Do not invent requirements.
- Do not expect advanced concepts unless required.
- Do not penalize irrelevant omissions.
- Valid alternative approaches deserve appropriate credit.
- For coding questions, evaluate the algorithm even if syntax
  is imperfect.
- For conceptual questions, evaluate understanding.
- Do not give a high score for technically incorrect claims.
- Do not blindly compare keywords.
- Judge the actual meaning of the candidate's answer.
- For MCQs, correctness of the selected option is critical.


============================================================
FEEDBACK
============================================================

Provide concise but useful interviewer feedback.

Feedback MUST contain:

1. What the candidate did well.
2. The most important missing point or mistake.
3. One concrete improvement suggestion.

Do not provide a very long explanation.


============================================================
OUTPUT
============================================================

Return ONLY valid JSON.

Do NOT use markdown.

Do NOT use code fences.

Return exactly:

{
   "score": 0,
   "feedback": "string"
}
`;

   try {

      console.log(
         "Sending answer to Gemini for evaluation..."
      );


      const interaction =
         await ai.interactions.create({

            model:
               "gemini-3.6-flash",

            input:
               prompt

         });


      const text =
         interaction.output_text;


      if (!text) {

         throw new Error(
            "Gemini returned an empty response"
         );
      }

      const cleanedText =
         text
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();


      let result;


      try {

         result =
            JSON.parse(
               cleanedText
            );

      } catch (error) {

         console.error(
            "Invalid Gemini evaluation:"
         );

         console.error(
            cleanedText
         );

         throw new Error(
            "Gemini returned invalid evaluation JSON"
         );
      }

      if (
         typeof result.score !==
         "number" ||

         typeof result.feedback !==
         "string"
      ) {

         throw new Error(
            "Invalid evaluation returned by Gemini"
         );
      }

      result.score =
         Math.max(
            0,
            Math.min(
               10,
               result.score
            )
         );


      return result;


   } catch (error) {

      console.error(
         "Gemini answer evaluation failed:",
         error
      );

      if (
         error.status === 429 ||
         error.code === 429 ||

         String(error.message)
            .includes("429") ||

         String(error.message)
            .toLowerCase()
            .includes("quota exceeded") ||

         String(error.message)
            .toLowerCase()
            .includes("rate limit")
      ) {

         const quotaError =
            new Error(
               "Gemini API quota exceeded. Please try again later."
            );


         quotaError.status =
            429;


         throw quotaError;
      }


      throw error;
   }
};

module.exports =
   evaluateAnswer;