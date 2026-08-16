import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

const API_URL = import.meta.env.VITE_API_URL;

function Register() {
   const navigate = useNavigate();

   const [formData, setFormData] = useState({
      name: "",
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

      if (
         !formData.name ||
         !formData.email ||
         !formData.password
      ) {
         setError(
            "Name, email and password are required."
         );

         return;
      }

      if (formData.password.length < 6) {
         setError(
            "Password must contain at least 6 characters."
         );

         return;
      }

      try {
         setLoading(true);

         const response = await fetch(
            `${API_URL}/api/auth/register`,
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
               data.message ||
               "Registration failed"
            );
         }

         // Save JWT returned after registration
         localStorage.setItem(
            "token",
            data.token
         );

         localStorage.setItem(
            "user",
            JSON.stringify(data.user)
         );

         console.log(
            "Registration successful:",
            data
         );

         navigate("/interview/setup");

      } catch (error) {
         console.error(
            "Registration error:",
            error
         );

         setError(
            error.message ||
            "Unable to register."
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

               <h1>Create Account</h1>

               <p>
                  Create your account and start practicing interviews.
               </p>

            </div>

            {error && (
               <div className="auth-error">
                  {error}
               </div>
            )}

            <form onSubmit={handleSubmit}>

               <div className="form-group">
                  <label htmlFor="name">
                     Full Name
                  </label>

                  <input
                     id="name"
                     name="name"
                     type="text"
                     placeholder="Enter your name"
                     value={formData.name}
                     onChange={handleChange}
                     disabled={loading}
                  />
               </div>

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
                     placeholder="Minimum 6 characters"
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
                     ? "Creating Account..."
                     : "Create Account"}
               </button>

            </form>

            <div className="auth-footer">
               <p>
                  Already have an account?{" "}
                  <Link to="/login">
                     Login
                  </Link>
               </p>
            </div>

         </div>

      </section>
   );
}

export default Register;