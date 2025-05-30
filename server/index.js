// index.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const Message = require("./Message");

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "https://chat-frontend-q34x.onrender.com" }));
app.use(express.json());

// index.js

require("dotenv").config(); // This loads variables from .env file (only in local dev)

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

const io = new Server(server, {
  cors: {
    origin: "https://chat-frontend-q34x.onrender.com",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🔌 New client connected");

  socket.on("message", async (msg) => {
    io.emit("message", msg); // broadcast to all clients
    try {
      const newMessage = new Message(msg);
      await newMessage.save();
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to load messages" });
  }
});

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
