const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync(process.env.PASSWORD1, salt),
  }
};

module.exports = users;