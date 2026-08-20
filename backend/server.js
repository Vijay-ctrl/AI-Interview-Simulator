require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);
console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);
console.log("GEMINI_API_KEY loaded:", !!process.env.GEMINI_API_KEY);

const allowedOrigins = [
   "http://localhost:5173",
   "https://ai-interview-simulator-frontend-v2.onrender.com"
];

app.use(
   cors({
      origin: (origin, callback) => {

         if (!origin) {
            return callback(null, true);
         }

         if (allowedOrigins.includes(origin)) {
            return callback(null, true);
         }

         console.error(
            "CORS blocked origin:",
            origin
         );

         return callback(
            new Error(
               `CORS blocked origin: ${origin}`
            )
         );
      },

      credentials: true
   })
);

app.use(
   cors({
      origin: (origin, callback) => {

         // Allow requests without an Origin header
         // such as Postman/server-to-server requests.
         if (!origin) {
            return callback(null, true);
         }

         if (allowedOrigins.includes(origin)) {
            return callback(null, true);
         }

         console.error(
            "CORS blocked origin:",
            origin
         );

         return callback(
            new Error(
               `CORS blocked origin: ${origin}`
            )
         );
      },

      credentials: true
   })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
   res.status(200).json({
      success: true,
      message: "AI Interview Simulator API is running"
   });
});

app.use((req, res) => {
   res.status(404).json({
      success: false,
      message: "API route not found"
   });
});

app.use((err, req, res, next) => {
   console.error("Server error:", err);

   res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error"
   });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
   try {
      await connectDB();

      app.listen(PORT, () => {
         console.log("----------------------------------------");
         console.log(`Server running on port ${PORT}`);
         console.log("MongoDB connected successfully");
         console.log("----------------------------------------");
      });

   } catch (error) {
      console.error("Failed to start server:");
      console.error(error.message);

      process.exit(1);
   }
};

startServer();