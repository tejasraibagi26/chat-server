const express = require("express");
const router = express.Router();
const data = require("../data");
const user = data.users;
const { ObjectId } = require("mongodb");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userData = await user.login(username, password);
    return res.json({ userData });
  } catch (error) {
    res.status(error.status).json({ error: error.msg });
  }
});

router.post("/register", async (req, res) => {
  const { username, password, confPassword } = req.body;
  if (!username || !password || !confPassword)
    return res.status(400).json({ error: "Missing form data" });

  if (password !== confPassword)
    return res.status(400).json({ error: "Passwords do not match" });

  try {
    const userData = await user.addUser(username, password);
    return res.json({ userData });
  } catch (error) {
    console.log(error);
    res.status(error.status).json({ error: error.msg });
  }
});

router.get("/chatroom", async (req, res) => {
  const userId = req.query.userId;

  if (userId == null) throw { status: 400, msg: "No userId provided" };
  if (!ObjectId.isValid(userId))
    throw { status: 400, msg: "Invalid userId provided" };

  try {
    const rooms = await user.getUserJoinedChatrooms(userId);
    return res.json({ rooms });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
