import { Link } from "react-router-dom";

function Home() {
   return (
      <section
         style={{
            minHeight: "calc(100vh - 72px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "40px"
         }}
      >

         <div>

            <p style={{ color: "#818cf8" }}>
               AI-POWERED INTERVIEW PRACTICE
            </p>

            <h1 style={{ fontSize: "48px" }}>
               Ace Your Next Interview
            </h1>

            <p
               style={{
                  color: "#94a3b8",
                  maxWidth: "600px",
                  lineHeight: "1.7"
               }}
            >
               Practice realistic technical and behavioral interviews
               with AI-powered feedback.
            </p>

            <Link
               to="/interview/setup"
               className="navbar-button"
            >
               Start Interview →
            </Link>

         </div>

      </section>
   );
}

export default Home;