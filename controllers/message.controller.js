import prisma from "../lib/prisma.js";
import { getReceiverSocketId, io } from "../socket/socket.js";





export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params; 
    const senderId = req.user.id; 
   
    let conversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          hasEvery: [senderId, receiverId],
        },
      },
    });

   
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: [senderId, receiverId],
        },
      });
    }

   
    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        message,
      },
    });

    
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        messages: {
          push: newMessage.id,
        },
      },
    });

    
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user.id;

    const conversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          hasEvery: [senderId, userToChatId],
        },
      },
    });

    if (!conversation) {
      return res.status(200).json([]);
    }

    const messageIds = conversation.messages;

    const messages = await prisma.message.findMany({
      where: {
        id: { in: messageIds },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
