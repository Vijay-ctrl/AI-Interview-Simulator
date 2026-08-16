import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Dashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
   const navigate = useNavigate();

   const [dashboard, setDashboard] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   const getToken = () => {
      return (
         localStorage.getItem("token") ||
         localStorage.getItem("authToken") ||
         localStorage.getItem("jwt")
      );
   };

   useEffect(() => {
      const fetchDashboard = async () => {
         try {
            setLoading(true);
            setError("");

            console.log("Fetching dashboard...");

            const token = getToken();

            if (!token) {
               navigate("/login", {
                  replace: true
               });

               return;
            }

            const response = await fetch(
               `${API_URL}/api/dashboard`,
               {
                  method: "GET",
                  headers: {
                     Authorization: `Bearer ${token}`,
                     "Content-Type": "application/json"
                  }
               }
            );

            console.log(
               "Dashboard response status:",
               response.status
            );

            const responseText =
               await response.text();

            let data = {};

            if (responseText) {
               try {
                  data = JSON.parse(responseText);
               } catch (parseError) {
                  console.error(
                     "Dashboard response is not valid JSON:",
                     parseError
                  );

                  throw new Error(
                     `Server returned an invalid response (${response.status}).`
                  );
               }
            }

            console.log(
               "Dashboard response data:",
               data
            );

            if (response.status === 401) {
               localStorage.removeItem("token");
               localStorage.removeItem("authToken");
               localStorage.removeItem("jwt");

               navigate("/login", {
                  replace: true
               });

               return;
            }

            if (!response.ok) {
               throw new Error(
                  data.message ||
                  data.error ||
                  `Server error while loading dashboard (${response.status}).`
               );
            }

            if (data.success === false) {
               throw new Error(
                  data.message ||
                  "Failed to load dashboard."
               );
            }

            setDashboard(data);

         } catch (error) {
            console.error(
               "Dashboard error:",
               error
            );

            setError(
               error.message ||
               "Unable to load dashboard."
            );

         } finally {
            setLoading(false);
         }
      };

      fetchDashboard();

   }, [navigate]);

   if (loading) {
      return (
         <section className="dashboard-page">
            <div className="dashboard-loading">
               Loading your dashboard...
            </div>
         </section>
      );
   }

   if (error) {
      return (
         <section className="dashboard-page">
            <div className="dashboard-error">

               <h2>
                  Unable to load dashboard
               </h2>

               <p>
                  {error}
               </p>

               <button
                  type="button"
                  onClick={() =>
                     window.location.reload()
                  }
               >
                  Try Again
               </button>

            </div>
         </section>
      );
   }

   if (!dashboard) {
      return null;
   }

   const user =
      dashboard.user || {};

   const resume =
      dashboard.resume || null;

   const statistics =
      dashboard.statistics || {};

   const recentInterviews =
      Array.isArray(
         dashboard.recentInterviews
      )
         ? dashboard.recentInterviews
         : [];

   const totalInterviews =
      Number(
         statistics.totalInterviews || 0
      );

   const completedInterviews =
      Number(
         statistics.completedInterviews || 0
      );

   const inProgressInterviews =
      Number(
         statistics.inProgressInterviews || 0
      );

   const averageScore =
      Number(
         statistics.averageScore || 0
      );

   const averagePercentage =
      Number(
         statistics.averagePercentage || 0
      );

   const completionPercentage =
      totalInterviews > 0
         ? Math.round(
            (completedInterviews /
               totalInterviews) *
            100
         )
         : 0;

   const handleContinueInterview =
      async (interviewId) => {

         try {
            if (!interviewId) {
               throw new Error(
                  "Interview ID is missing."
               );
            }

            const token =
               getToken();

            if (!token) {
               navigate("/login");
               return;
            }

            const response =
               await fetch(
                  `${API_URL}/api/interview/${interviewId}`,
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

            const responseText =
               await response.text();

            let data = {};

            if (responseText) {
               try {
                  data =
                     JSON.parse(
                        responseText
                     );
               } catch {
                  throw new Error(
                     "Invalid response received from server."
                  );
               }
            }

            if (
               response.status === 401
            ) {
               localStorage.removeItem(
                  "token"
               );

               localStorage.removeItem(
                  "authToken"
               );

               localStorage.removeItem(
                  "jwt"
               );

               navigate(
                  "/login",
                  {
                     replace: true
                  }
               );

               return;
            }

            if (!response.ok) {
               throw new Error(
                  data.message ||
                  "Unable to load interview."
               );
            }

            if (!data.interview) {
               throw new Error(
                  "Interview data was not returned by the server."
               );
            }

            navigate(
               "/interview",
               {
                  state: {
                     interviewId:
                        data.interview._id,

                     interview:
                        data.interview,

                     configuration: {
                        type:
                           data.interview.type,

                        difficulty:
                           data.interview.difficulty,

                        numberOfQuestions:
                           data.interview
                              .numberOfQuestions,

                        focusAreas:
                           data.interview
                              .focusAreas || []
                     }
                  }
               }
            );

         } catch (error) {
            console.error(
               "Continue interview error:",
               error
            );

            alert(
               error.message ||
               "Unable to continue interview."
            );
         }
      };

   const handleViewResult =
      (interviewId) => {

         if (!interviewId) {
            console.error(
               "Interview ID is missing."
            );

            return;
         }

         navigate(
            "/interview/result",
            {
               state: {
                  interviewId
               }
            }
         );
      };

   const formatDate =
      (date) => {

         if (!date) {
            return "N/A";
         }

         const parsedDate =
            new Date(date);

         if (
            Number.isNaN(
               parsedDate.getTime()
            )
         ) {
            return "N/A";
         }

         return parsedDate.toLocaleDateString(
            "en-IN",
            {
               day: "2-digit",
               month: "short",
               year: "numeric"
            }
         );
      };

   return (
      <section className="dashboard-page">

         <div className="dashboard-container">

            <div className="dashboard-welcome">

               <div>

                  <p className="dashboard-label">
                     AI INTERVIEW
                  </p>

                  <h1>
                     Welcome back,{" "}
                     {user.name || "User"} 👋
                  </h1>

                  <p>
                     Track your interview
                     preparation and improve
                     your performance.
                  </p>

               </div>

               <button
                  type="button"
                  className="start-dashboard-button"
                  onClick={() =>
                     navigate(
                        "/interview/setup"
                     )
                  }
               >
                  Start New Interview →
               </button>

            </div>

            <div className="dashboard-card resume-dashboard-card">

               <div className="card-header">

                  <div>

                     <p className="card-label">
                        YOUR RESUME
                     </p>

                     <h2>
                        Resume Profile
                     </h2>

                  </div>

                  <span className="resume-check">
                     ✓
                  </span>

               </div>

               {resume ? (

                  <div className="resume-dashboard-content">

                     <div className="resume-file">

                        <div className="resume-icon">
                           PDF
                        </div>

                        <div>

                           <strong>
                              {resume.originalName ||
                                 "Resume"}
                           </strong>

                           <p>
                              Uploaded{" "}
                              {formatDate(
                                 resume.createdAt
                              )}
                           </p>

                        </div>

                     </div>

                     <div className="resume-skills">

                        <strong>
                           {resume.skills?.length || 0}{" "}
                           skills detected
                        </strong>

                        <div className="skills-list">

                           {(resume.skills || [])
                              .slice(0, 12)
                              .map(
                                 (skill) => (
                                    <span
                                       key={skill}
                                    >
                                       {skill}
                                    </span>
                                 )
                              )}

                        </div>

                     </div>

                     <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                           navigate(
                              "/resume/upload"
                           )
                        }
                     >
                        Upload New Resume
                     </button>

                  </div>

               ) : (

                  <div>

                     <p>
                        No resume uploaded.
                     </p>

                     <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                           navigate(
                              "/resume/upload"
                           )
                        }
                     >
                        Upload Resume
                     </button>

                  </div>

               )}

            </div>

            <div className="dashboard-section">

               <div className="section-heading">

                  <p className="dashboard-label">
                     PERFORMANCE
                  </p>

                  <h2>
                     Interview Statistics
                  </h2>

               </div>

               <div className="statistics-grid">

                  <div className="stat-card">

                     <span>
                        Total Interviews
                     </span>

                     <strong>
                        {totalInterviews}
                     </strong>

                  </div>

                  <div className="stat-card">

                     <span>
                        Completed
                     </span>

                     <strong>
                        {completedInterviews}
                     </strong>

                  </div>

                  <div className="stat-card">

                     <span>
                        In Progress
                     </span>

                     <strong>
                        {inProgressInterviews}
                     </strong>

                  </div>

                  <div className="stat-card">

                     <span>
                        Average Score
                     </span>

                     <strong>
                        {averageScore}/10
                     </strong>

                  </div>

               </div>

            </div>

            <div className="dashboard-card progress-card">

               <div className="card-header">

                  <div>

                     <p className="card-label">
                        OVERALL PROGRESS
                     </p>

                     <h2>
                        Interview Progress
                     </h2>

                  </div>

                  <strong className="progress-percentage">
                     {completionPercentage}%
                  </strong>

               </div>

               <div className="dashboard-progress-bar">

                  <div
                     className="dashboard-progress-fill"
                     style={{
                        width:
                           `${completionPercentage}%`
                     }}
                  />

               </div>

               <div className="progress-details">

                  <span>
                     {completedInterviews} of{" "}
                     {totalInterviews} interviews
                     completed
                  </span>

                  <span>
                     Average:{" "}
                     {averagePercentage}%
                  </span>

               </div>

            </div>

            <div className="dashboard-section">

               <div className="section-heading">

                  <p className="dashboard-label">
                     HISTORY
                  </p>

                  <h2>
                     Recent Interviews
                  </h2>

               </div>

               {recentInterviews.length === 0 ? (

                  <div className="empty-dashboard">

                     <h3>
                        No interviews yet
                     </h3>

                     <p>
                        Start your first AI
                        interview to track
                        your progress.
                     </p>

                     <button
                        type="button"
                        onClick={() =>
                           navigate(
                              "/interview/setup"
                           )
                        }
                     >
                        Start Interview →
                     </button>

                  </div>

               ) : (

                  <div className="interview-history">

                     {recentInterviews.map(
                        (item) => {

                           const interviewId =
                              item.id ||
                              item._id;

                           const normalizedStatus =
                              (
                                 item.status ||
                                 "created"
                              )
                                 .toLowerCase()
                                 .replace(
                                    /\s+/g,
                                    "-"
                                 );

                           const difficulty =
                              item.difficulty
                                 ? item.difficulty
                                    .charAt(0)
                                    .toUpperCase() +
                                 item.difficulty.slice(1)
                                 : "N/A";

                           let interviewTitle =
                              "Mixed Interview";

                           if (
                              item.type ===
                              "technical"
                           ) {
                              interviewTitle =
                                 "Technical Interview";
                           }

                           if (
                              item.type ===
                              "behavioral"
                           ) {
                              interviewTitle =
                                 "HR / Behavioral Interview";
                           }

                           return (
                              <div
                                 className="interview-history-card"
                                 key={
                                    interviewId
                                 }
                              >

                                 <div className="history-main">

                                    <div className="history-icon">
                                       AI
                                    </div>

                                    <div>

                                       <h3>
                                          {interviewTitle}
                                       </h3>

                                       <p>
                                          {difficulty}
                                          {" • "}
                                          {item.numberOfQuestions || 0}
                                          {" "}
                                          Questions
                                       </p>

                                       <div className="history-focus">

                                          {(
                                             item.focusAreas ||
                                             []
                                          )
                                             .slice(0, 5)
                                             .map(
                                                (area) => (
                                                   <span
                                                      key={area}
                                                   >
                                                      {area}
                                                   </span>
                                                )
                                             )}

                                       </div>

                                    </div>

                                 </div>

                                 <div className="history-right">

                                    <span
                                       className={
                                          `status-badge ${normalizedStatus}`
                                       }
                                    >
                                       {normalizedStatus ===
                                          "completed"
                                          ? "Completed"
                                          : normalizedStatus ===
                                             "in-progress"
                                             ? "In Progress"
                                             : "Created"}
                                    </span>

                                    <small>
                                       {formatDate(
                                          item.createdAt
                                       )}
                                    </small>

                                    {normalizedStatus ===
                                       "completed" ? (

                                       <button
                                          type="button"
                                          className="history-button"
                                          onClick={() =>
                                             handleViewResult(
                                                interviewId
                                             )
                                          }
                                       >
                                          View Result
                                       </button>

                                    ) : (

                                       <button
                                          type="button"
                                          className="history-button"
                                          onClick={() =>
                                             handleContinueInterview(
                                                interviewId
                                             )
                                          }
                                       >
                                          Continue →
                                       </button>

                                    )}

                                 </div>

                              </div>
                           );
                        }
                     )}

                  </div>

               )}

            </div>

         </div>

      </section>
   );
}

export default Dashboard;

