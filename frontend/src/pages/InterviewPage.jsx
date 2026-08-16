import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "./InterviewPage.css";

const API_URL = "http://localhost:5000";

function InterviewPage() {
   const location = useLocation();
   const navigate = useNavigate();

   const interviewId = location.state?.interviewId;
   const initialInterview = location.state?.interview;
   const configuration = location.state?.configuration;

   const [interview, setInterview] = useState(
      initialInterview || null
   );

   const [currentQuestion, setCurrentQuestion] =
      useState(0);

   const [answers, setAnswers] = useState([]);

   const [timeLeft, setTimeLeft] = useState(120);

   const [loading, setLoading] = useState(false);

   const [pageLoading, setPageLoading] =
      useState(!initialInterview);

   const [error, setError] = useState("");

   const [submittedQuestions, setSubmittedQuestions] =
      useState(new Set());

   const [handlingTimeout, setHandlingTimeout] =
      useState(false);

   const [timeoutLocked, setTimeoutLocked] =
      useState(false);

   const getToken = () => {
      return (
         localStorage.getItem("token") ||
         localStorage.getItem("authToken") ||
         localStorage.getItem("jwt")
      );
   };

   const clearAuthAndRedirect = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("jwt");

      navigate("/login", {
         replace: true
      });
   };

   useEffect(() => {
      if (!interviewId) {
         navigate("/interview/setup", {
            replace: true
         });

         return;
      }

      if (initialInterview) {
         setInterview(initialInterview);
         setPageLoading(false);
         return;
      }


      const fetchInterview = async () => {
         try {
            setPageLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
               clearAuthAndRedirect();
               return;
            }


            const response = await fetch(
               `${API_URL}/api/interview/${interviewId}`,
               {
                  method: "GET",

                  headers: {
                     Authorization: `Bearer ${token}`
                  }
               }
            );


            let data;

            try {
               data = await response.json();
            } catch {
               throw new Error(
                  "Invalid response received from server."
               );
            }


            if (!response.ok) {
               if (response.status === 401) {
                  clearAuthAndRedirect();
                  return;
               }

               throw new Error(
                  data.message ||
                  "Failed to load interview."
               );
            }


            if (
               !data.interview ||
               !Array.isArray(data.interview.questions)
            ) {
               throw new Error(
                  "Invalid interview data received from server."
               );
            }


            setInterview(data.interview);

         } catch (error) {
            console.error(
               "Interview loading error:",
               error
            );

            setError(
               error.message ||
               "Unable to load interview."
            );

         } finally {
            setPageLoading(false);
         }
      };


      fetchInterview();

   }, [
      interviewId,
      initialInterview,
      navigate
   ]);

   const questions =
      interview?.questions || [];

   const totalQuestions =
      questions.length;

   useEffect(() => {
      if (
         !interviewId ||
         !interview ||
         totalQuestions === 0
      ) {
         return;
      }


      setAnswers(previousAnswers => {
         if (
            previousAnswers.length ===
            totalQuestions
         ) {
            return previousAnswers;
         }

         return Array(
            totalQuestions
         ).fill("");
      });

   }, [
      interviewId,
      interview,
      totalQuestions
   ]);

   useEffect(() => {
      if (
         pageLoading ||
         !interviewId ||
         !interview ||
         totalQuestions === 0 ||
         loading ||
         handlingTimeout ||
         timeoutLocked
      ) {
         return;
      }


      if (timeLeft <= 0) {
         setHandlingTimeout(true);
         return;
      }


      const timer = setInterval(() => {
         setTimeLeft(previous => previous - 1);
      }, 1000);


      return () => {
         clearInterval(timer);
      };

   }, [
      timeLeft,
      pageLoading,
      interviewId,
      interview,
      totalQuestions,
      loading,
      handlingTimeout,
      timeoutLocked
   ]);

   const currentQuestionData =
      questions[currentQuestion];

   const getQuestionId = question => {
      return (
         question?.questionId ||
         question?._id ||
         null
      );
   };

   const submitCurrentAnswer = async () => {
      const token = getToken();

      if (!token) {
         throw new Error(
            "Authentication token not found. Please login again."
         );
      }


      if (!currentQuestionData) {
         throw new Error(
            "Current question could not be found."
         );
      }


      const questionId =
         getQuestionId(
            currentQuestionData
         );


      if (!questionId) {
         throw new Error(
            "Question ID is missing."
         );
      }


      if (
         submittedQuestions.has(
            questionId
         )
      ) {
         return null;
      }


      const userAnswer =
         answers[currentQuestion]?.trim();


      if (!userAnswer) {
         throw new Error(
            "Please answer the question before continuing."
         );
      }


      const response = await fetch(
         `${API_URL}/api/interview/${interviewId}/questions/${questionId}/answer`,
         {
            method: "POST",

            headers: {
               "Content-Type":
                  "application/json",

               Authorization:
                  `Bearer ${token}`
            },

            body: JSON.stringify({
               userAnswer
            })
         }
      );


      let data;

      try {
         data = await response.json();
      } catch {
         throw new Error(
            "Invalid response received from server."
         );
      }


      if (!response.ok) {

         if (response.status === 401) {
            clearAuthAndRedirect();

            throw new Error(
               "Your session has expired. Please login again."
            );
         }


         throw new Error(
            data.message ||
            "Failed to submit answer."
         );
      }


      setSubmittedQuestions(previous => {
         const updated =
            new Set(previous);

         updated.add(questionId);

         return updated;
      });


      console.log(
         "Answer evaluated successfully:",
         data.result
      );


      return data.result;
   };

   const completeInterview = async () => {
      const token = getToken();

      if (!token) {
         throw new Error(
            "Authentication token not found. Please login again."
         );
      }


      const response = await fetch(
         `${API_URL}/api/interview/${interviewId}/complete`,
         {
            method: "POST",

            headers: {
               "Content-Type":
                  "application/json",

               Authorization:
                  `Bearer ${token}`
            }
         }
      );


      let data;

      try {
         data = await response.json();
      } catch {
         throw new Error(
            "Invalid response received from server."
         );
      }


      if (!response.ok) {

         if (response.status === 401) {
            clearAuthAndRedirect();

            throw new Error(
               "Your session has expired. Please login again."
            );
         }


         throw new Error(
            data.message ||
            "Failed to complete interview."
         );
      }


      console.log(
         "Interview completed successfully:",
         data.result
      );


      navigate(
         "/interview/result",
         {
            state: {
               interviewId
            }
         }
      );
   };

   const moveAfterAnswer = async () => {

      if (
         currentQuestion <
         totalQuestions - 1
      ) {

         setCurrentQuestion(
            previous =>
               previous + 1
         );

         setTimeLeft(120);

         setTimeoutLocked(false);

         setError("");

      } else {

         await completeInterview();

      }
   };

   useEffect(() => {

      if (
         !handlingTimeout ||
         loading ||
         pageLoading ||
         !interviewId ||
         !interview ||
         totalQuestions === 0
      ) {
         return;
      }


      const processTimeout = async () => {

         try {

            setError("");
            setLoading(true);


            const question =
               questions[currentQuestion];


            if (!question) {
               throw new Error(
                  "Current question could not be found."
               );
            }


            const questionId =
               getQuestionId(question);


            if (!questionId) {
               throw new Error(
                  "Question ID is missing."
               );
            }


            const currentAnswer =
               answers[currentQuestion]?.trim();


            // Already submitted
            if (
               submittedQuestions.has(
                  questionId
               )
            ) {

               await moveAfterAnswer();

               return;
            }


            // Empty answer at timeout
            if (!currentAnswer) {

               setError(
                  "Time is up. Please provide an answer before continuing."
               );

               setTimeLeft(0);

               setTimeoutLocked(true);

               return;
            }


            // Submit answered question
            await submitCurrentAnswer();

            await moveAfterAnswer();

         } catch (error) {

            console.error(
               "Timeout handling error:",
               error
            );

            setError(
               error.message ||
               "Unable to continue after timeout."
            );

         } finally {

            setLoading(false);
            setHandlingTimeout(false);

         }
      };


      processTimeout();

   }, [handlingTimeout]);

   const handleAnswerChange = event => {

      const value =
         event.target.value;


      if (!currentQuestionData) {
         return;
      }


      const questionId =
         getQuestionId(
            currentQuestionData
         );


      if (
         submittedQuestions.has(
            questionId
         )
      ) {
         return;
      }


      setAnswers(previousAnswers => {

         const updatedAnswers = [
            ...previousAnswers
         ];


         updatedAnswers[
            currentQuestion
         ] = value;


         return updatedAnswers;

      });
   };

   const handleNext = async () => {

      if (
         loading ||
         handlingTimeout
      ) {
         return;
      }


      try {

         setError("");
         setLoading(true);


         await submitCurrentAnswer();

         await moveAfterAnswer();

      } catch (error) {

         console.error(
            "Next question error:",
            error
         );


         setError(
            error.message ||
            "Unable to continue."
         );

      } finally {

         setLoading(false);

      }
   };

   const handlePrevious = () => {

      if (
         currentQuestion === 0 ||
         loading ||
         handlingTimeout
      ) {
         return;
      }


      setError("");


      setCurrentQuestion(
         previous =>
            previous - 1
      );


      setTimeLeft(120);

      setTimeoutLocked(false);

   };

   const handleSubmit = async () => {
      await handleNext();
   };

   if (pageLoading) {

      return (
         <section className="interview-page">

            <div className="interview-container">

               <div className="interview-loading">
                  Loading interview...
               </div>

            </div>

         </section>
      );
   }

   if (
      !interviewId ||
      !interview ||
      totalQuestions === 0
   ) {

      return (
         <section className="interview-page">

            <div className="interview-container">

               <div className="interview-error">

                  {error ||
                     "Interview data could not be loaded."}

               </div>

            </div>

         </section>
      );
   }


   if (!currentQuestionData) {
      return null;
   }

   const progress =
      (
         (currentQuestion + 1) /
         totalQuestions
      ) * 100;

   const minutes =
      Math.floor(
         timeLeft / 60
      );


   const seconds =
      timeLeft % 60;


   const formattedTime =
      `${String(minutes).padStart(
         2,
         "0"
      )}:${String(seconds).padStart(
         2,
         "0"
      )}`;

   const currentAnswer =
      answers[currentQuestion] || "";

   const currentQuestionId =
      getQuestionId(
         currentQuestionData
      );


   const isSubmitted =
      submittedQuestions.has(
         currentQuestionId
      );

   return (

      <section className="interview-page">

         <div className="interview-container">

            <div className="interview-header">

               <div>

                  <p className="interview-label">
                     AI INTERVIEW
                  </p>


                  <h1>
                     {configuration?.role ||
                        "Technical Interview"}
                  </h1>


                  <p className="interview-meta">

                     {interview.type}

                     {" • "}

                     {interview.difficulty}

                     {" • "}

                     {configuration?.experience ||
                        "Fresher"}

                  </p>

               </div>


               <div
                  className={
                     `timer ${
                        timeLeft <= 30
                           ? "timer-warning"
                           : ""
                     }`
                  }
               >

                  ⏱ {formattedTime}

               </div>

            </div>

            {error && (

               <div className="interview-error">
                  {error}
               </div>

            )}

            <div className="progress-section">

               <div className="progress-info">

                  <span>

                     Question{" "}
                     {currentQuestion + 1}
                     {" "}of{" "}
                     {totalQuestions}

                  </span>


                  <span>
                     {Math.round(progress)}%
                  </span>

               </div>


               <div className="progress-bar">

                  <div
                     className="progress-fill"
                     style={{
                        width:
                           `${progress}%`
                     }}
                  />

               </div>

            </div>

            <div className="question-card">

               <div className="question-number">

                  QUESTION{" "}
                  {currentQuestion + 1}

               </div>


               <h2>
                  {currentQuestionData.question}
               </h2>


               <div className="question-meta">

                  {currentQuestionData.type && (

                     <span className="question-type">

                        Type:{" "}
                        {currentQuestionData.type}

                     </span>

                  )}


                  {currentQuestionData.topic && (

                     <span className="question-topic">

                        Topic:{" "}
                        {currentQuestionData.topic}

                     </span>

                  )}


                  {currentQuestionData.difficulty && (

                     <span className="question-difficulty">

                        Difficulty:{" "}
                        {currentQuestionData.difficulty}

                     </span>

                  )}

               </div>

            </div>

            <div className="answer-section">

               <label htmlFor="answer">
                  Your Answer
               </label>

               {currentQuestionData.type ===
                  "mcq" ? (

                  <div className="mcq-options">

                     {(
                        currentQuestionData.options ||
                        []
                     ).map(
                        (
                           option,
                           index
                        ) => (

                           <label
                              key={option}
                              className={
                                 `mcq-option ${
                                    currentAnswer ===
                                    option
                                       ? "selected"
                                       : ""
                                 }`
                              }
                           >

                              <input
                                 type="radio"

                                 name={
                                    `question-${currentQuestionId}`
                                 }

                                 value={option}

                                 checked={
                                    currentAnswer ===
                                    option
                                 }

                                 onChange={
                                    handleAnswerChange
                                 }

                                 disabled={
                                    loading ||
                                    isSubmitted
                                 }
                              />


                              <span className="mcq-letter">

                                 {String.fromCharCode(
                                    65 + index
                                 )}

                              </span>


                              <span>
                                 {option}
                              </span>

                           </label>

                        )
                     )}

                  </div>

               ) : (

                  <textarea

                     id="answer"

                     value={
                        currentAnswer
                     }

                     onChange={
                        handleAnswerChange
                     }

                     placeholder={
                        currentQuestionData.type ===
                           "coding"
                           ? "Explain your approach, algorithm, complexity, edge cases, and code if required..."
                           : "Type your answer here..."
                     }

                     disabled={
                        loading ||
                        isSubmitted
                     }

                  />

               )}

               <div className="answer-footer">

                  <span>
                     {currentAnswer.length}{" "}
                     characters
                  </span>


                  <span>

                     {currentQuestionData.type ===
                        "mcq"
                        ? "Select the best answer."
                        : "Explain your answer clearly."}

                  </span>

               </div>

            </div>

            <div className="interview-actions">

               <button
                  type="button"

                  className="previous-button"

                  onClick={
                     handlePrevious
                  }

                  disabled={
                     currentQuestion === 0 ||
                     loading ||
                     handlingTimeout
                  }
               >

                  ← Previous

               </button>


               <div className="right-actions">

                  {currentQuestion <
                     totalQuestions - 1 ? (

                     <button
                        type="button"

                        className="next-button"

                        onClick={
                           handleNext
                        }

                        disabled={
                           loading ||
                           handlingTimeout
                        }
                     >

                        {loading
                           ? "Evaluating..."
                           : "Next Question →"}

                     </button>

                  ) : (

                     <button
                        type="button"

                        className="submit-button"

                        onClick={
                           handleSubmit
                        }

                        disabled={
                           loading ||
                           handlingTimeout
                        }
                     >

                        {loading
                           ? "Evaluating & Submitting..."
                           : "Submit Interview ✓"}

                     </button>

                  )}

               </div>

            </div>

         </div>

      </section>

   );
}

export default InterviewPage;