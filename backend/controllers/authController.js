const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (userId) => {
   return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
   );
};

const registerUser = async (req, res) => {
   try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
         return res.status(400).json({
            success: false,
            message: "Name, email and password are required"
         });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
         return res.status(409).json({
            success: false,
            message: "User already exists"
         });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.create({
         name,
         email,
         password: hashedPassword
      });

      const token = generateToken(user._id);

      res.status(201).json({
         success: true,
         message: "User registered successfully",
         token,
         user: {
            id: user._id,
            name: user.name,
            email: user.email
         }
      });

   } catch (error) {
      console.error("Registration error:", error.message);

      res.status(500).json({
         success: false,
         message: "Server error during registration"
      });
   }
};

const loginUser = async (req, res) => {
   try {
      const { email, password } = req.body;

      if (!email || !password) {
         return res.status(400).json({
            success: false,
            message: "Email and password are required"
         });
      }

      const user = await User.findOne({ email });

      if (!user) {
         return res.status(401).json({
            success: false,
            message: "Invalid email or password"
         });
      }

      const passwordMatch = await bcrypt.compare(
         password,
         user.password
      );

      if (!passwordMatch) {
         return res.status(401).json({
            success: false,
            message: "Invalid email or password"
         });
      }

      const token = generateToken(user._id);

      res.status(200).json({
         success: true,
         message: "Login successful",
         token,
         user: {
            id: user._id,
            name: user.name,
            email: user.email
         }
      });

   } catch (error) {
      console.error("Login error:", error.message);

      res.status(500).json({
         success: false,
         message: "Server error during login"
      });
   }
};

module.exports = {
   registerUser,
   loginUser
};