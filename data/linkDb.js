const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
    visit: 0,
    uniqueVisitor: new Set(),
    allVisits: [],
    createdOn: new Date().toString().replace(/G.+/, '')
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
    visit: 0,
    uniqueVisitor: new Set(),
    allVisits: [],
    createdOn: new Date().toString().replace(/G.+/, '')
  },
};

module.exports = urlDatabase;