import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
dotenv.config()

export const signUp = async (req, res) => {
  const { fullname, username, email, password, confirmpassword, gender } =
    req.body;

  try {
  
    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

   
    const genderEnum = ["MALE", "FEMALE", "OTHER"];
    if (!genderEnum.includes(gender?.toUpperCase())) {
      return res.status(400).json({ message: "Invalid gender value" });
    }

    
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullname,
        username,
        email,
        password: hashedPassword,
        confirmpassword: hashedPassword,
        avatar:
          gender.toUpperCase() === "MALE"
            ? "https://avatar.iran.liara.run/public/boy"
            : "https://avatar.iran.liara.run/public/girl",
        gender: gender.toUpperCase(),
      },
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};




export const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Check if all required fields are provided
    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username },
        ],
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

   
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    
    res.cookie("jwt", token, {
      httpOnly: true,
      secure : true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'None',
    });

  
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        avatar: user.avatar
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", { httpOnly: true, });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Error logging out" });
  }
};
