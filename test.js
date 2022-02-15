const data = require("./data");
const user = data.users;
const chat = data.chat;

async function main() {
  const randomNums = Math.floor(Math.random() * 100000);
  console.log(randomNums);

  // try {
  //   const usr = await user.addUser("tejas", "test@123");
  //   console.log(usr);
  // } catch (error) {
  //   console.log(error);
  // }

  // try {
  //   const usr = await chat.createRoom("CS554", "620b2bc6e8fe0237c43d7b4e");
  //   console.log(usr);
  // } catch (error) {
  //   console.log(error);
  // }

  // try {
  //   const usr = await chat.addMessagesToRoom("620b2bdc9bb23c1ca89e634d", {
  //     text: "Hello there!",
  //     userId: "620b2bc6e8fe0237c43d7b4e",
  //     username: "asd",
  //   });
  //   console.log(usr);
  // } catch (error) {
  //   console.log(error);
  // }

  // try {
  //   const usr = await chat.getChatMessagesFromRoom("620b0338ea0850396c205686");
  //   console.log(usr);
  // } catch (error) {
  //   console.log(error);
  // }
}

main().catch((e) => {
  console.log(e);
});
