require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

console.log("MongoDB URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.log("MongoDB Connection Error", error));

const DrawingSchema = new mongoose.Schema({
  paths: Array,
});

const Drawing = mongoose.model("Drawing", DrawingSchema);

let users = 0;
let drawingHistory = [];

app.get("/api/drawings", async (req, res) => {
  try {
    const savedDrawing = await Drawing.findOne();
    res.json(savedDrawing ? savedDrawing.paths : []);
  } catch (error) {
    console.error("Error fetching drawings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

io.on("connection", async (socket) => {
  console.log("User connected:", socket.id);
  users++;
  io.emit("userCount", users);

  const savedDrawing = await Drawing.findOne();
  if (savedDrawing) {
    drawingHistory = savedDrawing.paths;
    socket.emit("loadCanvas", drawingHistory);
  }

  socket.on("userJoined", (username) => {
    socket.username = username;
    console.log(`${username} joined`);
    io.emit("notification", `${username} has joined the whiteboard`);
  });

  socket.on("userLeft", (username) => {
    console.log(`${username} left`);
    io.emit("notification", `${username} has left the whiteboard`);
  });

  socket.on("disconnect", () => {
    users--;
    io.emit("userCount", users);
    if (socket.username) {
      console.log(`${socket.username} disconnected`);
      io.emit("notification", `${socket.username} has left the whiteboard`);
    }
  });

  socket.on("draw", async (data) => {
    drawingHistory.push(data);
    socket.broadcast.emit("draw", data);
    try {
      await Drawing.updateOne({}, { paths: drawingHistory }, { upsert: true });
    } catch (error) {
      console.error("Error saving drawing:", error);
    }
  });

  socket.on("clearCanvas", async () => {
    drawingHistory = [];
    try {
      await Drawing.updateOne({}, { paths: [] });
      io.emit("clearCanvas");
    } catch (error) {
      console.error("Error clearing canvas:", error);
    }
  });
});

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
