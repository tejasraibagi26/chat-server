const express = require("express");
const router = express.Router();
const data = require("../data");
const chat = data.chat;
const users = data.users;

router.get("/messages/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const messages = await chat.getChatMessagesFromRoom(id);
    return res.json({ messages });
  } catch (error) {
    console.log(error);
  }
});

router.post("/create", async (req, res) => {
  const { chatName, createdBy } = req.body;

  if (!chatName || !createdBy)
    return res
      .status(400)
      .json({ status: 400, msg: "Chatroom or User Id missing" });

  try {
    const create = await chat.createRoom(chatName, createdBy);
    return res.json({ create });
  } catch (error) {
    return res.status(error.status).json({ error: error.msg });
  }
});

router.post("/join", async (req, res) => {
  const { userId, inviteCode } = req.body;

  if (!inviteCode || !userId)
    return res
      .status(400)
      .json({ status: 400, msg: "UserId or Invite code missing" });

  try {
    const create = await users.addUserToRoom(userId, inviteCode);
    return res.json({ create });
  } catch (error) {
    console.log(error);
    return res.status(error.status).json({ error: error.msg });
  }
});

module.exports = router;
