const getUserByEmail = (email, database) => {
  for (let obj in database) {
    if (database[obj].email === email) {
      return database[obj];
    }
  }
  return undefined;
};

module.exports = {getUserByEmail};