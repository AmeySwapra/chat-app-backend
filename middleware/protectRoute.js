import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const protectRoute = async (req, res, next) => {
  try {
    // Extract the token from cookies
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized - No Token Provided amey" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }

    // Fetch the user using the decoded userId
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullname: true,
        username: true,
        email: true,
        avatar: true,
        gender: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Attach the user to the request object
    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default protectRoute;
