const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const data = require("./data");
const users = data.users;
const chat = data.chat;
const constructor = require("./routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

constructor(app);
// const users = {};

io.on("connection", (socket) => {
  console.log(`User connected with socketId: ${socket.id}`);

  socket.on("join", async (data, callback) => {
    /*
      Add user to the room
      @params userId [String]
      @params roomId [String]
    */
    try {
      await users.addUserToRoom(data.userId, data.roomId);
    } catch (error) {
      callback(error);
    }

    socket.to(data.roomId).emit("chat-message", {
      text: `${data.username} joined the room`,
      username: "Admin",
    });

    socket.join(data.roomId);
  });

  socket.on("chat-text", async (data, callback) => {
    const returnData = {
      text: data.text,
      username: data.username,
    };

    const msgObj = {
      text: data.text,
      userId: data.userId,
      username: data.username,
    };

    try {
      await chat.addMessagesToRoom(data.roomId, msgObj);
      socket.to(data.roomId).emit("chat-message", returnData);
      return;
    } catch (error) {
      return callback(error);
    }
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
