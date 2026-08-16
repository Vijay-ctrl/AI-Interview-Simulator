import { Link, useLocation } from "react-router-dom";

function Navbar() {

   const location = useLocation();

   return (
      <header className="navbar">

         <div className="navbar-container">

            {/* Logo */}
            <Link to="/" className="navbar-logo">

               <div className="logo-icon">
                  AI
               </div>

               <div className="logo-text">
                  Interview<span>AI</span>
               </div>

            </Link>


            {/* Navigation */}
            <nav className="navbar-links">

               <Link
                  to="/"
                  className={location.pathname === "/" ? "active" : ""}
               >
                  Home
               </Link>

               <Link
                  to="/interview/setup"
                  className={
                     location.pathname === "/interview/setup"
                        ? "active"
                        : ""
                  }
               >
                  Practice
               </Link>

            </nav>


            {/* Right side */}
            <div className="navbar-actions">

               <Link
                  to="/interview/setup"
                  className="navbar-button"
               >
                  Start Interview
               </Link>

            </div>

         </div>

      </header>
   );
}

export default Navbar;