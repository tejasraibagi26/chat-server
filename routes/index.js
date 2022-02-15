const chat = require("./chat");
const user = require("./user");

const constructor = (app) => {
  app.use("/api/v1/chat", chat);
  app.use("/api/v1/users", user);
  app.use("/test", (req, res) => {
    res.send("test route");
  });
};

module.exports = constructor;
