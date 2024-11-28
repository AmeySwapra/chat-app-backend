import prisma from "../lib/prisma.js";

export const getUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    const filteredUsers = await prisma.user.findMany({
      where: {
        id: { not: loggedInUserId },
      },
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

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
