const mongoCollections = require("../config/mongoCollections");
const userCollection = mongoCollections.users;
const chatCollection = mongoCollections.chat;
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const SALT = 16;
const chatData = require("./chat");

const login = async (username, password) => {
  if (username == null || password == null)
    throw "Username and Password are required";

  const users = await userCollection();
  const user = await users.findOne({ username });
  if (!user) throw "User not found";

  if (!bcrypt.compare(password, user.password))
    throw { status: 400, msg: "Incorrect username or password" };

  return { status: 200, msg: { username, _id: user._id } };
};

const findUser = async (userId) => {
  if (userId == null) throw { status: 400, msg: "UserId cannot be empty" };

  if (!ObjectId.isValid(userId)) throw { status: 400, msg: "Invalid userId" };

  userId = ObjectId(userId);

  const users = await userCollection();
  const user = await users.findOne({ _id: userId }, { password: 0 });
  if (!user) throw { status: 404, msg: "User does not exist" };

  return user;
};

const addUser = async (username, password) => {
  if (username == null || password == null)
    throw { status: 400, msg: "Username and Password are required" };

  const users = await userCollection();
  const user = await users.findOne({ username });
  if (user) throw { status: 401, msg: "User already exists" };

  const hashPassword = await bcrypt.hash(password, SALT);
  const currentDateTime = new Date();
  const data = {
    _id: new ObjectId(),
    username,
    password: hashPassword,
    createdAt: currentDateTime.toLocaleString(),
    updatedAt: currentDateTime.toLocaleString(),
    chatrooms: [],
  };

  const addUser = await users.insertOne(data);
  if (addUser.insertedCount === 0)
    throw { status: 500, msg: "Error adding user." };

  return { status: 200, msg: { username, _id: addUser.insertedId } };
};

const addUserToRoom = async (userId, roomId) => {
  if (userId == null || roomId == null)
    throw "Username and RoomId are required";
  let userPresent;
  try {
    const chat = await chatCollection();
    userPresent = await chat.findOne(
      { inviteCode: Number(roomId) },
      { $in: { users: userId } }
    );
    if (userPresent?.users.includes(userId)) {
      console.log("user present");
      return;
    }
  } catch (error) {
    console.log(error);
  }
  console.log("as");
  let data;
  try {
    data = await chatData.getChatDetails(roomId);
  } catch (error) {
    throw { status: 404, msg: error.msg };
  }

  //!CHECK THIS
  const chat = await chatCollection();
  const addUserToChat = await chat.updateOne(
    { inviteCode: Number(roomId) },
    { $push: { users: userId } }
  );

  if (addUserToChat.insertedCount === 0)
    throw { status: 500, msg: "Unable to add user to chatroom" };

  const chatrooms = {
    roomId: roomId,
    roomName: userPresent.roomName,
    inviteCode: Number(roomId),
  };
  const user = await userCollection();
  const addChatroomData = await user.updateOne(
    { _id: ObjectId(userId) },
    { $push: { chatrooms } }
  );

  if (addChatroomData.modifiedCount === 0)
    throw { status: 500, msg: "Unable to update user chatroom" };

  return { status: 200, msg: "User added" };
};

const removeUserFromRoom = async (userId, roomId) => {
  if (userId == null || roomId == null)
    throw "Username and RoomId are required";

  const chat = await chatCollection();
  const removeUser = await chat.updateOne(
    { _id: ObjectId(roomId) },
    { $pull: { users: userId } }
  );

  if (removeUser.modifiedCount === 0)
    throw { status: 500, msg: "Error removing user from chat" };

  return { status: 200, msg: "Removed user" };
};

const getUserJoinedChatrooms = async (userId) => {
  if (userId == null) throw { status: 400, msg: "No userId provided" };
  if (!ObjectId.isValid(userId))
    throw { status: 400, msg: "Invalid userId provided" };

  const user = await userCollection();
  const rooms = await user.findOne({ _id: ObjectId(userId) }, { chatroom: 1 });

  if (!rooms) throw { status: 404, msg: "Join a room" };
  console.log(rooms);
  return {
    status: 200,
    msg: { chatrooms: rooms.chatrooms, invite: rooms.inviteCode },
  };
};

module.exports = {
  findUser,
  addUser,
  addUserToRoom,
  removeUserFromRoom,
  login,
  getUserJoinedChatrooms,
};
