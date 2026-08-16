import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InterviewSetup.css";

const API_URL = import.meta.env.VITE_API_URL;

function InterviewSetup() {
   const navigate = useNavigate();

   const [resume, setResume] = useState(null);

   const [role, setRole] = useState("Software Engineer");
   const [experience, setExperience] = useState("Fresher");
   const [type, setType] = useState("technical");
   const [difficulty, setDifficulty] = useState("medium");
   const [numberOfQuestions, setNumberOfQuestions] = useState(5);
   const [focusAreas, setFocusAreas] = useState([]);

   const [loading, setLoading] = useState(false);
   const [resumeLoading, setResumeLoading] = useState(true);
   const [error, setError] = useState("");

   const getToken = () => {
      return (
         localStorage.getItem("token") ||
         localStorage.getItem("authToken") ||
         localStorage.getItem("jwt")
      );
   };

   useEffect(() => {
      const fetchLatestResume = async () => {
         try {
            setResumeLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
               throw new Error(
                  "Authentication token not found. Please login again."
               );
            }

            const response = await fetch(
               `${API_URL}/api/resume/latest`,
               {
                  method: "GET",
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               }
            );

            const data = await response.json();

            console.log("LATEST RESUME RESPONSE:", data);

            if (!response.ok) {
               throw new Error(
                  data.message || "Failed to fetch resume."
               );
            }

            if (!data.resume) {
               throw new Error(
                  "No resume found. Please upload your resume first."
               );
            }

            setResume(data.resume);

            if (
               Array.isArray(data.resume.skills) &&
               data.resume.skills.length > 0
            ) {
               setFocusAreas(
                  data.resume.skills.slice(0, 5)
               );
            }
         } catch (err) {
            console.error(
               "FETCH RESUME ERROR:",
               err
            );

            setError(
               err.message ||
               "Unable to load your resume."
            );
         } finally {
            setResumeLoading(false);
         }
      };

      fetchLatestResume();
   }, []);

   const handleStartInterview = async () => {
      if (loading) {
         return;
      }

      try {
         setError("");
         setLoading(true);

         const token = getToken();

         if (!token) {
            throw new Error(
               "Authentication token not found. Please login again."
            );
         }

         if (!resume?.id) {
            throw new Error(
               "Resume not found. Please upload your resume first."
            );
         }

         if (
            !Array.isArray(focusAreas) ||
            focusAreas.length === 0
         ) {
            throw new Error(
               "Please select at least one focus area."
            );
         }

         console.log("=================================");
         console.log("STARTING INTERVIEW");
         console.log("=================================");
         console.log("Resume ID:", resume.id);
         console.log("Role:", role);
         console.log("Experience:", experience);
         console.log("Type:", type);
         console.log("Difficulty:", difficulty);
         console.log("Questions:", numberOfQuestions);
         console.log("Focus Areas:", focusAreas);

         const createResponse = await fetch(
            `${API_URL}/api/interview/create`,
            {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify({
                  resumeId: resume.id,
                  type,
                  difficulty,
                  numberOfQuestions: Number(
                     numberOfQuestions
                  ),
                  focusAreas,
               }),
            }
         );

         const createData =
            await createResponse.json();

         console.log(
            "CREATE INTERVIEW RESPONSE:",
            createData
         );

         if (!createResponse.ok) {
            throw new Error(
               createData.message ||
               "Failed to create interview."
            );
         }

         if (
            !createData.success ||
            !createData.interview?.id
         ) {
            throw new Error(
               "Interview ID was not returned by backend."
            );
         }

         const interviewId =
            createData.interview.id;

         console.log(
            "Interview created:",
            interviewId
         );

         console.log(
            "Generating AI interview questions..."
         );

         const generateResponse = await fetch(
            `${API_URL}/api/interview/${interviewId}/generate`,
            {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
               },
            }
         );

         const generateData =
            await generateResponse.json();

         console.log(
            "GENERATE INTERVIEW RESPONSE:",
            generateData
         );

         if (!generateResponse.ok) {
            throw new Error(
               generateData.message ||
               "Failed to generate interview questions."
            );
         }

         if (
            !generateData.success ||
            !generateData.interview
         ) {
            throw new Error(
               "Interview questions were not generated."
            );
         }

         const generatedInterview =
            generateData.interview;

         if (
            !Array.isArray(
               generatedInterview.questions
            ) ||
            generatedInterview.questions.length === 0
         ) {
            throw new Error(
               "No questions were generated."
            );
         }

         console.log(
            "Questions generated:",
            generatedInterview.questions.length
         );

         console.log(
            "Navigating to /interview..."
         );

         navigate("/interview", {
            state: {
               interviewId,

               interview: generatedInterview,

               configuration: {
                  role,
                  experience,
                  type,
                  difficulty,
                  numberOfQuestions:
                     Number(numberOfQuestions),
                  focusAreas,
               },
            },
         });
      } catch (err) {
         console.error(
            "START INTERVIEW ERROR:",
            err
         );

         // Handle Gemini quota errors
         const errorMessage =
            err.message || "";

         if (
            errorMessage.includes("quota") ||
            errorMessage.includes("429") ||
            errorMessage.includes(
               "Too Many Requests"
            )
         ) {
            setError(
               "Gemini API quota has been exceeded. Please wait for the quota to reset before generating another interview."
            );
         } else {
            setError(
               errorMessage ||
               "Unable to start interview."
            );
         }
      } finally {
         setLoading(false);
      }
   };

   const handleFocusAreaChange = (skill) => {
      setFocusAreas((previous) => {
         if (previous.includes(skill)) {
            return previous.filter(
               (item) => item !== skill
            );
         }

         return [...previous, skill];
      });
   };

   return (
      <section className="interview-setup">

         <div className="setup-container">

            <div className="setup-header">

               <p className="setup-label">
                  AI INTERVIEW
               </p>

               <h1>
                  Configure Your Interview
               </h1>

               <p className="setup-description">
                  Choose how you want the AI
                  interview to be conducted.
               </p>

            </div>

            {error && (
               <div className="setup-error">

                  <span className="error-icon">
                     ⚠
                  </span>

                  <p>
                     {error}
                  </p>

               </div>
            )}

            <div className="setup-card">

               <div className="card-header">

                  <h2>
                     Selected Resume
                  </h2>

               </div>

               {resumeLoading ? (

                  <div className="resume-loading">

                     <div className="loading-spinner">
                     </div>

                     <p>
                        Loading resume...
                     </p>

                  </div>

               ) : resume ? (

                  <div className="resume-info">

                     <div className="resume-icon">
                        📄
                     </div>

                     <div className="resume-details">

                        <strong>
                           {resume.originalName ||
                              "Uploaded Resume"}
                        </strong>

                        <p>
                           {resume.skills?.length ||
                              0}{" "}
                           skills detected
                        </p>

                     </div>

                  </div>

               ) : (

                  <p className="empty-state">
                     No resume found.
                  </p>

               )}

            </div>

            <div className="setup-card">

               <div className="form-group">

                  <label htmlFor="role">
                     Target Role
                  </label>

                  <input
                     id="role"
                     type="text"
                     value={role}
                     onChange={(event) =>
                        setRole(
                           event.target.value
                        )
                     }
                     placeholder="e.g. Software Engineer"
                  />

               </div>

            </div>

            <div className="setup-card">

               <div className="form-group">

                  <label htmlFor="experience">
                     Experience
                  </label>

                  <select
                     id="experience"
                     value={experience}
                     onChange={(event) =>
                        setExperience(
                           event.target.value
                        )
                     }
                  >

                     <option value="Fresher">
                        Fresher
                     </option>

                     <option value="0-1 years">
                        0-1 Years
                     </option>

                     <option value="1-3 years">
                        1-3 Years
                     </option>

                     <option value="3+ years">
                        3+ Years
                     </option>

                  </select>

               </div>

            </div>

            <div className="setup-card">

               <div className="form-group">

                  <label htmlFor="type">
                     Interview Type
                  </label>

                  <select
                     id="type"
                     value={type}
                     onChange={(event) =>
                        setType(
                           event.target.value
                        )
                     }
                  >

                     <option value="technical">
                        Technical
                     </option>

                     <option value="hr">
                        HR / Behavioral
                     </option>

                     <option value="mixed">
                        Mixed
                     </option>

                  </select>

               </div>

            </div>

            <div className="setup-card">

               <div className="form-group">

                  <label htmlFor="difficulty">
                     Difficulty
                  </label>

                  <select
                     id="difficulty"
                     value={difficulty}
                     onChange={(event) =>
                        setDifficulty(
                           event.target.value
                        )
                     }
                  >

                     <option value="easy">
                        Easy
                     </option>

                     <option value="medium">
                        Medium
                     </option>

                     <option value="hard">
                        Hard
                     </option>

                  </select>

               </div>

            </div>

            <div className="setup-card">

               <div className="form-group">

                  <label htmlFor="questionCount">
                     Number of Questions
                  </label>

                  <select
                     id="questionCount"
                     value={numberOfQuestions}
                     onChange={(event) =>
                        setNumberOfQuestions(
                           Number(
                              event.target.value
                           )
                        )
                     }
                  >

                     <option value={5}>
                        5
                     </option>

                     <option value={10}>
                        10
                     </option>

                     <option value={15}>
                        15
                     </option>

                     <option value={20}>
                        20
                     </option>

                  </select>

               </div>

            </div>

            <div className="setup-card focus-area-card">

               <div className="form-group">

                  <div className="focus-area-header">

                     <div>

                        <label>
                           Focus Areas
                        </label>

                        <p className="field-description">
                           Select the skills you want
                           the AI to focus on during
                           your interview.
                        </p>

                     </div>

                     {focusAreas.length > 0 && (
                        <span className="selected-count">
                           {focusAreas.length} selected
                        </span>
                     )}

                  </div>

                  <div className="focus-area-grid">

                     {(resume?.skills || []).map(
                        (skill) => {

                           const isSelected =
                              focusAreas.includes(
                                 skill
                              );

                           return (
                              <button
                                 type="button"
                                 key={skill}
                                 className={`focus-skill ${isSelected
                                    ? "selected"
                                    : ""
                                    }`}
                                 onClick={() =>
                                    handleFocusAreaChange(
                                       skill
                                    )
                                 }
                              >

                                 <span className="skill-check">

                                    {isSelected
                                       ? "✓"
                                       : ""}

                                 </span>

                                 <span className="skill-name">
                                    {skill}
                                 </span>

                              </button>
                           );
                        }
                     )}

                  </div>

                  {(resume?.skills || []).length === 0 && (
                     <p className="focus-hint">
                        No skills were detected
                        from your resume.
                     </p>
                  )}

                  {focusAreas.length === 0 &&
                     (resume?.skills || []).length > 0 && (
                        <p className="focus-hint">
                           Choose at least one skill
                           to continue.
                        </p>
                     )}

               </div>

            </div>

            <button
               type="button"
               className="start-interview-button"
               onClick={handleStartInterview}
               disabled={
                  loading ||
                  resumeLoading ||
                  !resume ||
                  focusAreas.length === 0
               }
            >

               {loading ? (

                  <>

                     <span className="button-spinner">
                     </span>

                     Starting Interview...

                  </>

               ) : (

                  <>

                     Start Interview

                     <span className="button-arrow">
                        →
                     </span>

                  </>

               )}

            </button>

         </div>

      </section>
   );
}

export default InterviewSetup;