const questionBank = {
   "DSA": [
      {
         question: "What is the difference between an array and a linked list?",
         topic: "DSA",
         difficulty: "medium",
         expectedAnswer:
            "An array stores elements in contiguous memory and provides O(1) random access, while a linked list stores nodes connected through pointers and provides sequential access."
      },
      {
         question: "What is the time complexity of binary search?",
         topic: "DSA",
         difficulty: "medium",
         expectedAnswer:
            "Binary search has O(log n) time complexity because the search space is divided by two at every step."
      },
      {
         question: "What is the difference between a stack and a queue?",
         topic: "DSA",
         difficulty: "easy",
         expectedAnswer:
            "A stack follows LIFO, while a queue follows FIFO."
      }
   ],

   "JavaScript": [
      {
         question: "What is the difference between let, const, and var in JavaScript?",
         topic: "JavaScript",
         difficulty: "medium",
         expectedAnswer:
            "var is function scoped, while let and const are block scoped. const cannot be reassigned after initialization."
      },
      {
         question: "What is a closure in JavaScript?",
         topic: "JavaScript",
         difficulty: "medium",
         expectedAnswer:
            "A closure occurs when a function remembers and can access variables from its outer lexical scope even after the outer function has finished execution."
      },
      {
         question: "What is the difference between == and === in JavaScript?",
         topic: "JavaScript",
         difficulty: "easy",
         expectedAnswer:
            "== performs type coercion before comparison, while === compares both value and type without coercion."
      }
   ],

   "React.js": [
      {
         question: "What is the Virtual DOM in React?",
         topic: "React.js",
         difficulty: "medium",
         expectedAnswer:
            "The Virtual DOM is an in-memory representation of the UI that React uses to efficiently determine which parts of the actual DOM need to be updated."
      },
      {
         question: "What is the difference between props and state in React?",
         topic: "React.js",
         difficulty: "easy",
         expectedAnswer:
            "Props are read-only data passed from a parent component, while state is internal component data that can change over time."
      },
      {
         question: "What is useEffect used for in React?",
         topic: "React.js",
         difficulty: "medium",
         expectedAnswer:
            "useEffect is used to perform side effects in functional components, such as API calls, subscriptions, and interacting with external systems."
      }
   ],

   "Node.js": [
      {
         question: "What is Node.js and why is it useful for backend development?",
         topic: "Node.js",
         difficulty: "easy",
         expectedAnswer:
            "Node.js is a JavaScript runtime built on Chrome's V8 engine that allows JavaScript to run outside the browser and is commonly used for server-side applications."
      },
      {
         question: "What is middleware in Express.js?",
         topic: "Node.js",
         difficulty: "medium",
         expectedAnswer:
            "Middleware functions have access to the request, response, and next function and can perform tasks such as authentication, logging, validation, and error handling."
      },
      {
         question: "What is the event loop in Node.js?",
         topic: "Node.js",
         difficulty: "hard",
         expectedAnswer:
            "The event loop allows Node.js to handle asynchronous operations without blocking the main JavaScript execution thread."
      }
   ]
};

const generateQuestions = (
   focusAreas,
   numberOfQuestions,
   difficulty
) => {
   let questions = [];

   for (const area of focusAreas) {
      const areaQuestions = questionBank[area];

      if (!areaQuestions) {
         continue;
      }

      const filteredQuestions = areaQuestions.filter(
         (question) =>
            question.difficulty === difficulty ||
            difficulty === "medium"
      );

      questions.push(...filteredQuestions);
   }

   // Remove duplicate questions
   questions = questions.filter(
      (question, index, self) =>
         index ===
         self.findIndex(
            (q) => q.question === question.question
         )
   );

   // Shuffle questions
   questions.sort(() => Math.random() - 0.5);

   // Return requested number
   return questions.slice(0, numberOfQuestions);
};

module.exports = generateQuestions;