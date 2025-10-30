const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const chatRouter = require("../controller/chat.controller.js");

router.post("/", authMiddleware, chatRouter.createChatController);
router.get('/', authMiddleware, chatRouter.getChats);
router.get('/messages/:id', authMiddleware, chatRouter.getMessages);

module.exports = router;
