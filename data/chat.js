const { ObjectId } = require("mongodb");
const mongoCollections = require("../config/mongoCollections");
const chatCollection = mongoCollections.chat;
const userCollection = mongoCollections.users;

const getChatDetails = async (roomId) => {
  if (roomId == null) throw { status: 400, msg: "RoomId required" };
  // if (!ObjectId.isValid(roomId)) throw { status: 400, msg: "Incorrect RoomId" };
  const chat = await chatCollection();
  const chatDetails = await chat.findOne({ inviteCode: Number(roomId) });
  if (!chatDetails) throw { status: 404, msg: "Chatroom not found" };

  return { status: 200, msg: chatDetails };
};

const getChatMessagesFromRoom = async (roomId) => {
  if (!roomId) throw { status: 400, msg: "RoomId required" };
  if (!ObjectId.isValid(roomId)) throw { status: 400, msg: "Incorrect RoomId" };
  const chat = await chatCollection();
  const chatDetails = await chat.findOne({ _id: ObjectId(roomId) });
  if (!chatDetails) throw { status: 404, msg: "Chatroom not found" };
  return { status: 200, msg: chatDetails.messages };
};

const addMessagesToRoom = async (roomId, message) => {
  if (roomId == null || message == null)
    throw { status: 400, msg: "RoomId and message are required" };

  const chat = await chatCollection();
  const data = new Date();
  const msgObj = {
    _id: new ObjectId(),
    text: message.text,
    userId: message.userId,
    username: message.username,
    timestamp: data.toLocaleString(),
  };
  const addMsg = await chat.updateOne(
    { inviteCode: Number(roomId) },
    { $push: { messages: msgObj } }
  );

  if (addMsg.modifiedCount === 0)
    throw { status: 500, msg: "Error adding message" };

  return { status: 200, msg: "Messaged added" };
};

const createRoom = async (roomName, createdBy) => {
  if (!roomName && !createdBy) throw { status: 400, msg: "Details Missing" };
  const inviteCode = Math.floor(Math.random() * 100000);
  const chat = await chatCollection();
  const obj = {
    _id: new ObjectId(),
    roomName,
    createdBy,
    users: [createdBy],
    messages: [],
    inviteCode,
  };
  const addChat = await chat.insertOne(obj);
  if (addChat.insertCount == 0)
    throw { status: 500, msg: "Error creating room" };

  const chatrooms = {
    roomId: addChat.insertedId.toString(),
    roomName,
    inviteCode,
  };
  const user = await userCollection();
  const addChatroomData = await user.updateOne(
    { _id: ObjectId(createdBy) },
    { $push: { chatrooms } }
  );

  if (addChatroomData.modifiedCount === 0)
    throw { status: 500, msg: "Unable to update user chatroom" };

  return { status: 200, msg: "Room created" };
};

module.exports = {
  getChatDetails,
  getChatMessagesFromRoom,
  addMessagesToRoom,
  createRoom,
};
