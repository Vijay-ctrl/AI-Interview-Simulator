const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: true,
         trim: true,
         minlength: 2,
         maxlength: 50
      },

      email: {
         type: String,
         required: true,
         unique: true,
         lowercase: true,
         trim: true
      },

      password: {
         type: String,
         required: true,
         minlength: 6
      },

      profile: {
         targetRole: {
            type: String,
            default: ""
         },

         experienceLevel: {
            type: String,
            enum: ["Fresher", "Junior", "Mid-Level", "Senior"],
            default: "Fresher"
         }
      }
   },
   {
      timestamps: true
   }
);

const User = mongoose.model("User", userSchema);

module.exports = User;