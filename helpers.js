const getUserByEmail = (email, database) => {
  for (let obj in database) {
    if (database[obj].email === email) {
      return database[obj];
    }
  }
  return undefined;
};

const generateRandomString = () => {
  let res = "";
  for (let i = 0; i < 6; i++) {
    res += (String.fromCharCode(97 + Math.floor(Math.random() * 26)));
  }
  return res;
};

const urlsForUser = (id, urlDatabase) => {
  let res = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      res[key] = urlDatabase[key];
    }
  }
  return res;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };