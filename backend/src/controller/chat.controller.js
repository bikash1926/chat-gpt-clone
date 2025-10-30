const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");

// Create a new chat
async function createChatController(req, res) {
  try {
    const { title } = req.body;
    const user = req.user;

    if (!user || !title) {
      return res.status(400).json({ message: "User and title are required" });
    }

    const chat = await chatModel.create({ user, title });

    res.status(201).json({
      message: "Chat created successfully",
      chat,
    });
  } catch (err) {
    console.error("Error creating chat:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getChats(req, res) {
  const user = req.user;

  const chats = await chatModel.find({ user: user._id });

  res.status(200).json({
    message: "Chats retrieved successfully",
    chats: chats.map((chat) => ({
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user,
    })),
  });
}
async function getMessages(req, res) {
  const chatId = req.params.id;

  const messages = await messageModel
    .find({ chat: chatId })
    .sort({ createdAt: 1 });

  res.status(200).json({
    message: "Messages retrieved successfully",
    messages: messages,
  });
}

module.exports = {
  createChatController,
  getChats,
  getMessages
};
