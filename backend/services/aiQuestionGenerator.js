
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
   apiKey: process.env.GEMINI_API_KEY
});

const allowedTypes = [
   "conceptual",
   "practical",
   "coding",
   "problem-solving",
   "debugging",
   "database",
   "api-backend",
   "scenario",
   "project",
   "mcq"
];

const allowedDifficulties = [
   "easy",
   "medium",
   "hard"
];


const cleanQuestionText = (text) => {

   if (typeof text !== "string") {
      return "";
   }

   let cleaned = text.trim();

   cleaned =
      cleaned.replace(
         /^```(?:cpp|c\+\+|c|javascript|js|python|java|sql|typescript|ts)?\s*/i,
         ""
      );

   cleaned =
      cleaned.replace(
         /\s*```$/i,
         ""
      );

   cleaned =
      cleaned.replace(
         /^(?:cpp|c\+\+|c|javascript|js|python|java|sql|typescript|ts)\s*\n/i,
         ""
      );

   cleaned =
      cleaned.replace(
         /^code\s*:\s*/i,
         ""
      );


   return cleaned.trim();
};

const cleanTopic = (topic) => {

   if (typeof topic !== "string") {
      return "";
   }

   return topic
      .trim()
      .replace(/\s+/g, " ");
};

const cleanExpectedAnswer = (answer) => {

   if (typeof answer !== "string") {
      return "";
   }

   return answer
      .trim()
      .replace(/\s+/g, " ");
};

const cleanOption = (option) => {

   if (typeof option !== "string") {
      return "";
   }

   return option
      .trim()
      .replace(/\s+/g, " ");
};

const generateAIQuestions = async ({
   resumeText,
   skills,
   interviewType,
   difficulty,
   numberOfQuestions,
   focusAreas
}) => {

   if (!process.env.GEMINI_API_KEY) {

      throw new Error(
         "GEMINI_API_KEY is not configured"
      );
   }

   let questionStrategy = "";

   if (interviewType === "technical") {

      questionStrategy = `
Create a realistic software engineering technical interview.

The interview MUST contain a mixture of question types.

Do NOT make the interview purely theoretical.

Prefer:

- practical
- scenario
- coding
- problem-solving
- debugging
- database
- api-backend
- project

Use conceptual questions selectively.

For 5 questions, prefer something similar to:

- 1 practical/scenario
- 1 coding/problem-solving
- 1 debugging/database/API
- 1 project/practical
- 1 conceptual/MCQ/scenario

Do NOT follow this exact order every time.

The questions should feel like they are being asked by a
real software engineer.

Avoid basic definition questions.

Instead of:

"What is polymorphism?"

Prefer:

"You are designing a payment system where new payment
providers must be added without modifying the checkout
service. How would you design this?"

Instead of:

"What is an index?"

Prefer:

"A query filtering millions of transaction records by
user_id and sorting by created_at has become slow. How would
you investigate and optimize it?"
`;
   }

   else if (interviewType === "behavioral") {

      questionStrategy = `
Create a realistic behavioral software engineering interview.

Focus on:

- project experience
- teamwork
- communication
- conflict resolution
- leadership
- decision making
- failure
- deadlines
- adaptability
- technical decisions

Avoid generic textbook questions.

Prefer realistic professional scenarios.
`;
   }

   else if (interviewType === "mixed") {

      questionStrategy = `
Create a realistic mixed software engineering interview.

Mix technical and behavioral questions.

Technical questions may include:

- practical
- coding
- problem-solving
- debugging
- database
- API/backend
- scenario
- project
- conceptual
- MCQ

Behavioral questions may include:

- teamwork
- communication
- conflict
- leadership
- decision making
- project experience
- failure handling

Do not group similar question types together.
`;
   }

   const prompt = `
You are an expert senior software engineering interviewer.

Create a realistic professional interview for this candidate.

The interview must feel like a real interview conducted by
an experienced engineer.

Do NOT create a textbook quiz.

${resumeText}

${(skills || []).join(", ")}

Interview Type:
${interviewType}

Difficulty:
${difficulty}

Focus Areas:
${(focusAreas || []).join(", ")}

Number Of Questions:
${numberOfQuestions}

${questionStrategy}

Questions must be based primarily on:

1. Candidate resume
2. Detected skills
3. Selected focus areas
4. Interview type
5. Requested difficulty

Do not introduce unrelated technologies.

For project questions, only ask about technologies actually
present in the resume.


============================================================
QUESTION QUALITY
============================================================

Every question should require at least one of:

- reasoning
- application
- debugging
- implementation
- optimization
- architecture
- trade-off analysis
- complexity analysis
- engineering decision
- realistic scenario

Avoid simple definitions.

Avoid repetitive questions.

Avoid asking the same concept in different wording.


============================================================
TECHNICAL QUESTION REQUIREMENT
============================================================

For technical interviews, at least HALF of the questions must
be application-oriented.

Application-oriented types include:

- practical
- coding
- problem-solving
- debugging
- database
- api-backend
- scenario
- project
- mcq

Conceptual questions must NOT dominate.


============================================================
MCQ REQUIREMENTS
============================================================

If type is "mcq":

- exactly 4 options
- exactly one correct option
- meaningful distractors
- no obviously silly answers
- correct option position should vary
- test reasoning or understanding
- correctOption must exactly match one option

For non-MCQ questions:

options must be []

correctOption must be ""


============================================================
CODING QUESTION REQUIREMENTS
============================================================

Coding questions do not necessarily require executable code.

They may ask the candidate to:

- explain an algorithm
- write pseudocode
- analyze complexity
- explain edge cases
- design a solution
- reason about existing code

If source code is included in a question:

IMPORTANT:

1. Do NOT wrap the source code inside Markdown code fences.

2. Do NOT put a language label such as:
   cpp
   python
   java
   javascript

   immediately before the code.

3. Put the source code directly inside the question string.

4. Keep the code syntactically valid.

Example:

Identify the bug in this C++ function:

std::vector<int*> createPointerVector() {
    std::vector<int*> ptrs;

    for (int i = 0; i < 5; ++i) {
        int temp = i * 10;
        ptrs.push_back(&temp);
    }

    return ptrs;
}

Do NOT generate:

cpp
std::vector<int*> ...

Do NOT generate:

\`\`\`cpp
std::vector<int*> ...
\`\`\`


============================================================
EXPECTED ANSWER
============================================================

expectedAnswer is for the server-side evaluator.

It must contain the important points a strong candidate should
mention.

Keep it concise and evaluation-friendly.

Do not reveal expectedAnswer inside the question.


============================================================
OUTPUT FORMAT
============================================================

Return ONLY valid JSON.

No markdown.

No code fences.

Return exactly:

{
   "questions": [
      {
         "question": "string",
         "topic": "string",
         "type": "conceptual|practical|coding|problem-solving|debugging|database|api-backend|scenario|project|mcq",
         "difficulty": "easy|medium|hard",
         "options": [],
         "correctOption": "",
         "expectedAnswer": "string"
      }
   ]
}


============================================================
FINAL VALIDATION
============================================================

Before returning:

- exactly ${numberOfQuestions} questions
- no duplicate questions
- every question is relevant
- every question matches the requested difficulty
- technical interviews contain application-oriented questions
- every question has a valid type
- every question has an expectedAnswer
- every MCQ has exactly 4 options
- every MCQ has exactly one correctOption
- correctOption exactly matches one option
- non-MCQ questions have empty options
- non-MCQ questions have empty correctOption
- coding questions contain no Markdown code fences
- coding questions contain no standalone language labels
- valid JSON
`;


   // =======================================================
   // CALL GEMINI
   // =======================================================

   try {

      console.log(
         "Sending interview generation request to Gemini..."
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
            .replace(/^\s*```json\s*/i, "")
            .replace(/\s*```\s*$/i, "")
            .trim();


      let result;


      try {

         result =
            JSON.parse(cleanedText);

      } catch (error) {

         console.error(
            "Invalid Gemini JSON:"
         );

         console.error(
            cleanedText
         );

         throw new Error(
            "Gemini returned invalid JSON"
         );
      }

      if (
         !result.questions ||
         !Array.isArray(result.questions)
      ) {

         throw new Error(
            "Invalid question format returned by Gemini"
         );
      }

      if (
         result.questions.length !==
         Number(numberOfQuestions)
      ) {

         throw new Error(
            `Gemini returned ${result.questions.length} questions instead of ${numberOfQuestions}`
         );
      }

      result.questions =
         result.questions.map(
            question => {

               return {

                  ...question,

                  question:
                     cleanQuestionText(
                        question.question
                     ),

                  topic:
                     cleanTopic(
                        question.topic
                     ),

                  type:
                     typeof question.type === "string"
                        ? question.type
                           .trim()
                           .toLowerCase()
                        : "",

                  difficulty:
                     typeof question.difficulty === "string"
                        ? question.difficulty
                           .trim()
                           .toLowerCase()
                        : "",

                  expectedAnswer:
                     cleanExpectedAnswer(
                        question.expectedAnswer
                     ),

                  options:
                     Array.isArray(question.options)
                        ? question.options.map(
                           cleanOption
                        )
                        : [],

                  correctOption:
                     typeof question.correctOption === "string"
                        ? question.correctOption.trim()
                        : ""

               };

            }
         );

      for (
         const question
         of result.questions
      ) {

         const basicValid =

            question.question &&
            question.topic &&
            allowedTypes.includes(
               question.type
            ) &&
            allowedDifficulties.includes(
               question.difficulty
            ) &&
            question.expectedAnswer;


         if (!basicValid) {

            throw new Error(
               "One or more generated questions have an invalid format"
            );
         }

         if (
            question.type !== "mcq"
         ) {

            if (
               !Array.isArray(question.options) ||
               question.options.length !== 0
            ) {

               throw new Error(
                  "Non-MCQ question contains options"
               );
            }


            if (
               question.correctOption !== ""
            ) {

               throw new Error(
                  "Non-MCQ question contains correctOption"
               );
            }


            continue;
         }

         if (
            !Array.isArray(question.options)
         ) {

            throw new Error(
               "MCQ options must be an array"
            );
         }


         if (
            question.options.length !== 4
         ) {

            throw new Error(
               "Every MCQ must contain exactly 4 options"
            );
         }


         if (
            question.options.some(
               option =>
                  typeof option !== "string" ||
                  !option.trim()
            )
         ) {

            throw new Error(
               "MCQ contains an invalid option"
            );
         }

         const uniqueOptions =
            new Set(
               question.options.map(
                  option =>
                     option.trim().toLowerCase()
               )
            );


         if (
            uniqueOptions.size !== 4
         ) {

            throw new Error(
               "MCQ options must be unique"
            );
         }

         if (
            typeof question.correctOption !== "string" ||
            !question.correctOption.trim()
         ) {

            throw new Error(
               "MCQ is missing correctOption"
            );
         }


         if (
            !question.options.includes(
               question.correctOption
            )
         ) {

            throw new Error(
               "MCQ correctOption does not match any option"
            );
         }

      }

      const normalizedQuestions =
         result.questions.map(
            question =>
               question.question
                  .trim()
                  .toLowerCase()
                  .replace(/\s+/g, " ")
         );


      const uniqueQuestions =
         new Set(
            normalizedQuestions
         );


      if (
         uniqueQuestions.size !==
         normalizedQuestions.length
      ) {

         throw new Error(
            "Gemini generated duplicate questions"
         );
      }

      if (
         interviewType === "technical" &&
         Number(numberOfQuestions) >= 5
      ) {

         const conceptualCount =
            result.questions.filter(
               question =>
                  question.type === "conceptual"
            ).length;


         const applicationCount =
            result.questions.filter(
               question =>
                  question.type !== "conceptual"
            ).length;

         if (
            conceptualCount >
            Math.floor(
               Number(numberOfQuestions) / 2
            )
         ) {

            throw new Error(
               "Generated interview contains too many conceptual questions"
            );
         }

         if (
            applicationCount <
            Math.ceil(
               Number(numberOfQuestions) / 2
            )
         ) {

            throw new Error(
               "Generated interview does not contain enough application-oriented questions"
            );
         }

      }

      console.log(
         `Gemini generated ${result.questions.length} professional interview questions`
      );


      console.log(
         "Question types:",
         result.questions.map(
            question =>
               question.type
         )
      );


      return result.questions;

   } catch (error) {

      console.error(
         "Gemini question generation failed:",
         error
      );

      throw error;
   }

};

module.exports =
   generateAIQuestions;