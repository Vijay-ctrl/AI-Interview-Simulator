import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

const API_URL = "http://localhost:5000";

function Login() {
   const navigate = useNavigate();

   const [formData, setFormData] = useState({
      email: "",
      password: ""
   });

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   const handleChange = (event) => {
      const { name, value } = event.target;

      setFormData((previous) => ({
         ...previous,
         [name]: value
      }));
   };

   const handleSubmit = async (event) => {
      event.preventDefault();

      setError("");

      if (!formData.email || !formData.password) {
         setError("Please enter email and password.");
         return;
      }

      try {
         setLoading(true);

         const response = await fetch(
            `${API_URL}/api/auth/login`,
            {
               method: "POST",
               headers: {
                  "Content-Type": "application/json"
               },
               body: JSON.stringify(formData)
            }
         );

         const data = await response.json();

         if (!response.ok) {
            throw new Error(
               data.message || "Login failed"
            );
         }

         // Save JWT
         localStorage.setItem(
            "token",
            data.token
         );

         // Save user
         localStorage.setItem(
            "user",
            JSON.stringify(data.user)
         );

         console.log("Login successful:", data);

         navigate("/dashboard");

      } catch (error) {
         console.error("Login error:", error);

         setError(
            error.message ||
            "Unable to login. Please try again."
         );
      } finally {
         setLoading(false);
      }
   };

   return (
      <section className="auth-page">

         <div className="auth-card">

            <div className="auth-header">
               <div className="auth-logo">
                  AI
               </div>

               <h1>Welcome Back</h1>

               <p>
                  Login to continue your AI interview practice.
               </p>
            </div>

            {error && (
               <div className="auth-error">
                  {error}
               </div>
            )}

            <form onSubmit={handleSubmit}>

               <div className="form-group">
                  <label htmlFor="email">
                     Email
                  </label>

                  <input
                     id="email"
                     name="email"
                     type="email"
                     placeholder="Enter your email"
                     value={formData.email}
                     onChange={handleChange}
                     disabled={loading}
                  />
               </div>

               <div className="form-group">
                  <label htmlFor="password">
                     Password
                  </label>

                  <input
                     id="password"
                     name="password"
                     type="password"
                     placeholder="Enter your password"
                     value={formData.password}
                     onChange={handleChange}
                     disabled={loading}
                  />
               </div>

               <button
                  type="submit"
                  className="auth-button"
                  disabled={loading}
               >
                  {loading
                     ? "Logging in..."
                     : "Login"}
               </button>

            </form>

            <div className="auth-footer">
               <p>
                  Don't have an account?{" "}
                  <Link to="/register">
                     Register
                  </Link>
               </p>
            </div>

         </div>

      </section>
   );
}

export default Login;