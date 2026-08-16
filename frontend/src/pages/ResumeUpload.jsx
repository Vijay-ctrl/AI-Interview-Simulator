import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResumeUpload.css";

const API_URL = "http://localhost:5000";

function ResumeUpload() {
   const navigate = useNavigate();

   const [file, setFile] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [success, setSuccess] = useState("");
   const [resume, setResume] = useState(null);

   const getToken = () => {
      return (
         localStorage.getItem("token") ||
         localStorage.getItem("authToken") ||
         localStorage.getItem("jwt")
      );
   };

   const handleFileChange = (event) => {
      const selectedFile = event.target.files?.[0];

      setError("");
      setSuccess("");
      setResume(null);

      if (!selectedFile) {
         setFile(null);
         return;
      }

      if (selectedFile.type !== "application/pdf") {
         setError("Please select a PDF resume.");
         setFile(null);
         return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
         setError("Resume must be smaller than 5 MB.");
         setFile(null);
         return;
      }

      setFile(selectedFile);
   };

   const handleUpload = async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
         setError("Please login before uploading your resume.");
         return;
      }

      if (!file) {
         setError("Please select a PDF resume.");
         return;
      }

      try {
         setLoading(true);

         const formData = new FormData();
         formData.append("resume", file);

         const response = await fetch(
            `${API_URL}/api/resume/upload`,
            {
               method: "POST",
               headers: {
                  Authorization: `Bearer ${token}`
               },
               body: formData
            }
         );

         const data = await response.json();

         if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("authToken");
            localStorage.removeItem("jwt");

            setError(
               "Your session has expired. Please login again."
            );

            return;
         }

         if (!response.ok) {
            throw new Error(
               data.message || "Resume upload failed."
            );
         }

         const resumeId = data?.resume?.id;

         if (!resumeId) {
            throw new Error(
               "Resume ID was not returned by the server."
            );
         }

         localStorage.setItem("resumeId", resumeId);
         localStorage.setItem("uploadedResumeId", resumeId);

         setResume(data.resume);

         setSuccess(
            "Resume uploaded and analyzed successfully!"
         );

      } catch (error) {
         console.error("Resume upload error:", error);

         setError(
            error.message ||
            "Something went wrong while uploading your resume."
         );

      } finally {
         setLoading(false);
      }
   };

   const startInterview = () => {
      const resumeId = localStorage.getItem("resumeId");

      if (!resumeId) {
         setError(
            "Resume ID not found. Please upload your resume again."
         );

         return;
      }

      navigate("/interview/setup");
   };

   return (
      <section className="resume-page">

         <div className="resume-container">

            <div className="resume-header">

               <span className="resume-badge">
                  AI INTERVIEW
               </span>

               <h1>
                  Upload Your Resume
               </h1>

               <p>
                  Upload your resume so AI can personalize
                  your interview questions.
               </p>

            </div>

            <form
               className="resume-card"
               onSubmit={handleUpload}
            >

               {error && (
                  <div className="resume-message resume-error">
                     <span>!</span>
                     {error}
                  </div>
               )}

               {success && (
                  <div className="resume-message resume-success">
                     <span>✓</span>
                     {success}
                  </div>
               )}

               <label
                  className={`upload-box ${file ? "has-file" : ""
                     }`}
               >

                  <input
                     type="file"
                     accept=".pdf,application/pdf"
                     onChange={handleFileChange}
                     disabled={loading}
                  />

                  {!file ? (
                     <>
                        <div className="upload-icon">
                           ↑
                        </div>

                        <h3>
                           Select your resume
                        </h3>

                        <p>
                           PDF files only · Maximum 5 MB
                        </p>

                        <span className="choose-file">
                           Choose PDF
                        </span>
                     </>
                  ) : (
                     <>
                        <div className="pdf-icon">
                           PDF
                        </div>

                        <h3>
                           Resume selected
                        </h3>

                        <p className="selected-name">
                           {file.name}
                        </p>

                        <span className="change-file">
                           Click to change file
                        </span>
                     </>
                  )}

               </label>

               <button
                  type="submit"
                  className="upload-button"
                  disabled={loading || !file}
               >
                  {loading ? (
                     <>
                        <span className="button-spinner"></span>
                        Uploading & Analyzing...
                     </>
                  ) : (
                     "Upload & Analyze Resume"
                  )}
               </button>

               {resume && (
                  <div className="resume-result">

                     <div className="result-header">

                        <div>
                           <span className="result-label">
                              RESUME ANALYSIS
                           </span>

                           <h2>
                              Resume Ready
                           </h2>
                        </div>

                        <span className="result-check">
                           ✓
                        </span>

                     </div>


                     <div className="resume-file-info">

                        <div className="resume-file-icon">
                           PDF
                        </div>

                        <div>
                           <strong>
                              {resume.originalName}
                           </strong>

                           <span>
                              Successfully analyzed
                           </span>
                        </div>

                     </div>


                     <div className="skills-section">

                        <div className="skills-heading">
                           <strong>
                              Skills Detected
                           </strong>

                           <span>
                              {resume.skills?.length || 0} skills
                           </span>
                        </div>

                        <div className="skills-list">

                           {resume.skills &&
                              resume.skills.length > 0 ? (
                              resume.skills.map(
                                 (skill) => (
                                    <span
                                       key={skill}
                                       className="skill-tag"
                                    >
                                       {skill}
                                    </span>
                                 )
                              )
                           ) : (
                              <span className="no-skills">
                                 No skills detected
                              </span>
                           )}

                        </div>

                     </div>


                     <button
                        type="button"
                        className="start-button"
                        onClick={startInterview}
                     >
                        Configure Interview
                        <span>→</span>
                     </button>

                  </div>
               )}

            </form>

         </div>

      </section>
   );
}

export default ResumeUpload;