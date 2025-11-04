const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routers/auth.route");
const chatRouter = require("./routers/chat.route");
const cors = require('cors');
const path = require('path');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use("/auth", authRouter);
app.use("/api/chat", chatRouter);


app.get("*name", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
