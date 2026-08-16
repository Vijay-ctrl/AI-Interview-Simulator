const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
   {

      question: {
         type: String,
         required: true,
         trim: true
      },

      topic: {
         type: String,
         required: true,
         trim: true
      },

      type: {
         type: String,

         enum: [
            "conceptual",
            "practical",
            "coding",
            "problem-solving",
            "debugging",
            "database",
            "api-backend",
            "scenario",
            "project",
            "mcq"
         ],

         required: true
      },

      options: {
         type: [String],

         default: []
      },

      correctOption: {
         type: String,

         default: "",

         trim: true
      },

      difficulty: {
         type: String,

         enum: [
            "easy",
            "medium",
            "hard"
         ],

         default: "medium"
      },

      expectedAnswer: {
         type: String,

         default: "",

         trim: true
      },

      userAnswer: {
         type: String,

         default: "",

         trim: true
      },

      score: {
         type: Number,

         default: null,

         min: 0,

         max: 10
      },

      feedback: {
         type: String,

         default: "",

         trim: true
      }
   },

   {
      _id: true
   }
);

const interviewSchema = new mongoose.Schema(
   {

      user: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "User",

         required: true,

         index: true
      },

      resume: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "Resume",

         required: true
      },

      type: {
         type: String,

         enum: [
            "technical",
            "behavioral",
            "mixed"
         ],

         default: "technical"
      },

      difficulty: {
         type: String,

         enum: [
            "easy",
            "medium",
            "hard"
         ],

         default: "medium"
      },

      numberOfQuestions: {
         type: Number,

         enum: [
            5,
            10,
            15,
            20
         ],

         default: 10
      },

      focusAreas: {
         type: [String],

         default: []
      },

      questions: {
         type: [questionSchema],

         default: []
      },

      status: {
         type: String,

         enum: [
            "created",
            "in-progress",
            "completed"
         ],

         default: "created",

         index: true
      },

      score: {
         type: Number,

         default: null,

         min: 0,

         max: 10
      },

      completedAt: {
         type: Date,

         default: null
      }
   },

   {
      timestamps: true
   }
);

interviewSchema.index({
   user: 1,
   createdAt: -1
});

interviewSchema.index({
   user: 1,
   status: 1
});

const Interview =
   mongoose.model(
      "Interview",
      interviewSchema
   );

module.exports =
   Interview;