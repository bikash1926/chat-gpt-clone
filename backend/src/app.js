const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routers/auth.route");
const chatRouter = require("./routers/chat.route");
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

// Routes
app.use("/auth", authRouter);
app.use("/api/chat", chatRouter);

module.exports = app;
