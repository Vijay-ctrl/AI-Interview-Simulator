import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "./InterviewResult.css";

const API_URL = import.meta.env.VITE_API_URL;

function InterviewResult() {
   const location = useLocation();
   const navigate = useNavigate();

   const stateInterviewId =
      location.state?.interviewId;

   const searchParams =
      new URLSearchParams(location.search);

   const queryInterviewId =
      searchParams.get("id");

   const interviewId =
      stateInterviewId || queryInterviewId;

   const [result, setResult] =
      useState(null);

   const [loading, setLoading] =
      useState(true);

   const [error, setError] =
      useState("");

   const getToken = () => {
      return (
         localStorage.getItem("token") ||
         localStorage.getItem("authToken") ||
         localStorage.getItem("jwt")
      );
   };

   useEffect(() => {
      const fetchResult = async () => {
         if (!interviewId) {
            setError(
               "Interview ID was not found."
            );

            setLoading(false);
            return;
         }

         const token = getToken();

         if (!token) {
            setError(
               "Authentication token not found. Please login again."
            );

            setLoading(false);
            return;
         }

         try {
            setLoading(true);
            setError("");

            const response = await fetch(
               `${API_URL}/api/interview/${interviewId}/result`,
               {
                  method: "GET",

                  headers: {
                     Authorization:
                        `Bearer ${token}`,

                     "Content-Type":
                        "application/json"
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
               throw new Error(
                  data.message ||
                  "Failed to fetch interview result."
               );
            }

            if (!data.success) {
               throw new Error(
                  data.message ||
                  "Failed to load interview result."
               );
            }

            setResult(data.result);

         } catch (error) {
            console.error(
               "Result fetch error:",
               error
            );

            setError(
               error.message ||
               "Unable to load interview result."
            );

         } finally {
            setLoading(false);
         }
      };

      fetchResult();

   }, [interviewId]);

   if (loading) {
      return (
         <section className="result-page">

            <div className="result-container">

               <div className="result-loading-card">

                  <div className="loading-spinner" />

                  <h2>
                     Preparing your interview result
                  </h2>

                  <p>
                     Please wait while we load your performance.
                  </p>

               </div>

            </div>

         </section>
      );
   }

   if (error) {
      return (
         <section className="result-page">

            <div className="result-container">

               <div className="result-error-card">

                  <div className="error-icon">
                     !
                  </div>

                  <h2>
                     Unable to load result
                  </h2>

                  <p>
                     {error}
                  </p>

                  <button
                     type="button"
                     className="primary-button"
                     onClick={() =>
                        navigate("/interview/setup")
                     }
                  >
                     Start New Interview
                  </button>

               </div>

            </div>

         </section>
      );
   }

   if (!result) {
      return (
         <section className="result-page">

            <div className="result-container">

               <div className="result-error-card">

                  <div className="error-icon">
                     !
                  </div>

                  <h2>
                     Result unavailable
                  </h2>

                  <p>
                     Interview result could not be loaded.
                  </p>

                  <button
                     type="button"
                     className="primary-button"
                     onClick={() =>
                        navigate("/interview/setup")
                     }
                  >
                     Start New Interview
                  </button>

               </div>

            </div>

         </section>
      );
   }

   const percentage =
      Number(result.percentage || 0);

   const totalQuestions =
      Number(result.totalQuestions || 0);

   const answeredQuestions =
      Number(result.answeredQuestions || 0);

   const totalScore =
      Number(result.totalScore || 0);

   const averageScore =
      Number(result.averageScore || 0);

   return (
      <section className="result-page">

         <div className="result-container">

            <header className="result-header">

               <div className="result-complete-badge">
                  <span className="complete-dot">
                     ✓
                  </span>

                  INTERVIEW COMPLETED
               </div>

               <h1>
                  Your Interview Result
               </h1>

               <p className="result-description">
                  Here's how you performed in your
                  AI-powered interview.
               </p>

            </header>

            <section className="overall-result-card">

               <div className="score-visual">

                  <div
                     className="score-circle"
                     style={{
                        "--score":
                           `${percentage * 3.6}deg`
                     }}
                  >

                     <div className="score-circle-inner">

                        <strong>
                           {percentage}%
                        </strong>

                        <span>
                           Overall Score
                        </span>

                     </div>

                  </div>

               </div>


               <div className="overall-content">

                  <span className="result-status">
                     Interview Complete
                  </span>

                  <h2>
                     {percentage >= 80
                        ? "Excellent performance"
                        : percentage >= 60
                           ? "Good performance"
                           : "Keep improving"}
                  </h2>

                  <p>
                     Your interview has been evaluated
                     across all {totalQuestions} questions.
                  </p>


                  <div className="interview-meta">

                     <span>
                        <small>
                           Type
                        </small>

                        <strong>
                           {result.type}
                        </strong>
                     </span>

                     <span>
                        <small>
                           Difficulty
                        </small>

                        <strong>
                           {result.difficulty}
                        </strong>
                     </span>

                  </div>

               </div>

            </section>

            <section className="score-grid">

               <div className="summary-card">

                  <div className="summary-icon">
                     ★
                  </div>

                  <span>
                     Average Score
                  </span>

                  <strong>
                     {averageScore.toFixed(1)}
                     <small>/10</small>
                  </strong>

                  <div className="mini-progress">
                     <div
                        style={{
                           width:
                              `${averageScore * 10}%`
                        }}
                     />
                  </div>

               </div>


               <div className="summary-card">

                  <div className="summary-icon">
                     ✓
                  </div>

                  <span>
                     Total Score
                  </span>

                  <strong>
                     {totalScore}
                     <small>
                        /{totalQuestions * 10}
                     </small>
                  </strong>

                  <div className="mini-progress">
                     <div
                        style={{
                           width:
                              `${percentage}%`
                        }}
                     />
                  </div>

               </div>


               <div className="summary-card">

                  <div className="summary-icon">
                     #
                  </div>

                  <span>
                     Questions Answered
                  </span>

                  <strong>
                     {answeredQuestions}
                     <small>
                        /{totalQuestions}
                     </small>
                  </strong>

                  <div className="mini-progress">
                     <div
                        style={{
                           width:
                              totalQuestions
                                 ? `${(
                                    answeredQuestions /
                                    totalQuestions
                                 ) * 100}%`
                                 : "0%"
                        }}
                     />
                  </div>

               </div>

            </section>

            <section className="analysis-section">

               <div className="section-heading">

                  <div>

                     <p>
                        PERFORMANCE REVIEW
                     </p>

                     <h2>
                        Question-wise Performance
                     </h2>

                  </div>

                  <span>
                     {totalQuestions} questions
                  </span>

               </div>


               <div className="question-results">

                  {result.questions?.map(
                     (question) => {

                        const score =
                           Number(question.score || 0);

                        let scoreClass =
                           "score-low";

                        if (score >= 8) {
                           scoreClass =
                              "score-good";
                        } else if (score >= 5) {
                           scoreClass =
                              "score-average";
                        }

                        return (
                           <article
                              className="question-result"
                              key={
                                 question.questionId
                              }
                           >

                              <div className="question-result-header">

                                 <div className="question-number-badge">
                                    {String(
                                       question.questionNumber
                                    ).padStart(2, "0")}
                                 </div>

                                 <div className="question-heading">

                                    <span>
                                       Question{" "}
                                       {question.questionNumber}
                                    </span>

                                    <div
                                       className={
                                          `question-score ${scoreClass}`
                                       }
                                    >
                                       {score}/10
                                    </div>

                                 </div>

                              </div>


                              <h3>
                                 {question.question}
                              </h3>


                              <div className="answer-block">

                                 <div className="answer-label">
                                    <span>
                                       YOUR ANSWER
                                    </span>
                                 </div>

                                 <p>
                                    {question.userAnswer ||
                                       "No answer provided."}
                                 </p>

                              </div>


                              <div className="feedback-block">

                                 <div className="feedback-label">
                                    <span>
                                       AI FEEDBACK
                                    </span>
                                 </div>

                                 <p>
                                    {question.feedback ||
                                       "No feedback available."}
                                 </p>

                              </div>

                           </article>
                        );
                     }
                  )}

               </div>

            </section>

            <div className="result-actions">

               <button
                  type="button"
                  className="new-interview-button"
                  onClick={() =>
                     navigate("/interview/setup")
                  }
               >
                  Start New Interview
               </button>

               <button
                  type="button"
                  className="home-button"
                  onClick={() =>
                     navigate("/")
                  }
               >
                  Back to Home
               </button>

            </div>

         </div>

      </section>
   );
}

export default InterviewResult;