const bcrypt = require("bcryptjs");
const users = require('../data/userDb');
const generateRandomString = require('./generalHelpers');
const salt = bcrypt.genSaltSync(10);

users.userRandomID.password = bcrypt.hashSync(process.env.PASSWORD1, salt);

const getUserByEmail = (email) => {
  const usersList = Object.values(users);

  for (let user of usersList) {
    if (user.email === email) {
      return user;
    }
  }

  return undefined;
};

//Check if user is in the user database
const checkUserById = (usesId) => {
  return users[usesId] ? true : false;
};

// Check authentication for both registration and log in purposes
const checkAuthentication = (email, password, from) => {
  let returnTemplate = `Please <a href="/${from}">try again</a>!`;
  if (!email || !password) {
    return {message : `Please enter valid username and password! ${returnTemplate}`, data: null};
  }

  const userObj = getUserByEmail(email || "");
  if (from === "register") {
    return userObj ? {message : `Email already registered! ${returnTemplate}`, data: null} : {message: null, data: null};
  }

  if (userObj && password && bcrypt.compareSync(password, userObj.password) && from === "login") {
    return {message : null, data: userObj};
  }

  return {message : `Email or Password not found! ${returnTemplate}`, data: null};
};

const addNewUser = (password, email) => {
  const randId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, salt);
  const newUser = {
    id: randId,
    email,
    password: hashedPassword,
  };
  users[randId] = newUser;

  return randId;
};

const getEmailFromCookie = (userId) => {
  return users[userId].email;
};


module.exports = { checkUserById, checkAuthentication, addNewUser, getEmailFromCookie };