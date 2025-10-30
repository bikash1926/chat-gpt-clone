const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const aiService = require("../service/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../service/vector.service");

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
  });

  // ✅ Socket authentication
  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      const token = cookies.token;

      if (!token) {
        return next(new Error("Authentication error: No token found"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { _id: decoded.id };
      next();
    } catch (err) {
      console.error("Socket Auth Error:", err.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });

    // 🧠 Handle AI message
    socket.on("ai-message", async (messagePayload) => {
      console.log("📩 Incoming message:", messagePayload);

      try {
        // 1️⃣ Store user message & generate vector
        const [message, vector] = await Promise.all([
          messageModel.create({
            chat: messagePayload.chat,
            user: socket.user._id,
            content: messagePayload.content,
            role: "user",
          }),
          aiService.generateVector(messagePayload.content),
        ]);

        // 2️⃣ Save vector in Pinecone
        await createMemory({
          vector,
          messageId: message._id,
          metadata: {
            chat: messagePayload.chat,
            user: socket.user._id,
            text: messagePayload.content,
          },
        });

        // 3️⃣ Query memory & recent chat
        const [memory, chatHistory] = await Promise.all([
          queryMemory({
            queryVector: vector,
            limit: 3,
            metadata: { user: socket.user._id },
          }),
          messageModel
            .find({ chat: messagePayload.chat })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
            .then((messages) => messages.reverse()),
        ]);

        // 4️⃣ Prepare context for AI
        const stm = chatHistory.map((item) => ({
          role: item.role,
          parts: [{ text: item.content }],
        }));

        const ltm = [
          {
            role: "user",
            parts: [
              {
                text: `
These are some previous messages from the chat. Use them to generate a coherent response:
${memory.map((item) => item.metadata.text).join("\n")}
                `,
              },
            ],
          },
        ];

        // 5️⃣ Generate AI response
        const response = await aiService.generateResponse([...ltm, ...stm]);

        // 6️⃣ Emit AI response to frontend
        socket.emit("ai-response", {
          content: response,
          chat: messagePayload.chat,
        });

        // 7️⃣ Store AI message & vector
        const [responseMessage, responseVector] = await Promise.all([
          messageModel.create({
            chat: messagePayload.chat,
            user: socket.user._id,
            content: response,
            role: "model",
          }),
          aiService.generateVector(response),
        ]);

        await createMemory({
          vector: responseVector,
          messageId: responseMessage._id,
          metadata: {
            chat: messagePayload.chat,
            user: socket.user._id,
            text: response,
          },
        });

        console.log("🤖 AI response sent successfully.");
      } catch (err) {
        console.error("❌ Error handling ai-message:", err);
      }
    });
  });

  return io;
}

module.exports = initSocket;
