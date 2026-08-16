const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function resetPassword() {
   try {
      await mongoose.connect(process.env.MONGO_URI);

      const email = "vijaypostman@gmail.com";
      const newPassword = "Test@12345";

      const user = await User.findOne({ email });

      if (!user) {
         console.log("User not found");
         return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      user.password = hashedPassword;

      await user.save();

      console.log("Password reset successfully");
      console.log("Email:", email);
      console.log("Password:", newPassword);

   } catch (error) {
      console.error("Error:", error.message);
   } finally {
      await mongoose.disconnect();
   }
}

resetPassword();