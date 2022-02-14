const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  return res.send("Working");
});

const users = {};

io.on("connection", (socket) => {
  console.log(`User connected with socketId: ${socket.id}`);

  socket.on("join", (data) => {
    socket.emit("chat-message", {
      text: `${data.username} joined the room`,
      username: "Admin",
    });
    socket.broadcast.to(data.roomName).emit("chat-message", {
      text: `${data.username} joined the room`,
      username: "Admin",
    });

    socket.join(data.roomName);
    if (users[data.roomName] == null) {
      users[data.roomName] = [];
    }

    users[data.roomName].push(data.username);

    console.log(users);
  });

  socket.on("chat-text", (data) => {
    console.log(data);
    const returnData = {
      text: data.text,
      username: data.username,
    };
    socket.to(data.roomName).emit("chat-message", returnData);
    console.log("Emitted text to room");
  });

  socket.on("leave", (data) => {
    const usrArr = users[data.roomName];
    const userIdx = usrArr.indexOf(data.username);
    users[data.roomName].splice(userIdx, 1);
    socket.broadcast.to(data.roomName).emit("chat-message", {
      text: `${data.username} left the room`,
      username: "Admin",
    });
  });

  socket.on("disconnect", () => console.log("User disconnected"));
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => console.log("Server is on"));
