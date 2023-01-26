/* eslint-disable camelcase */
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const methodOverride = require('method-override');
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['ajsgioeewoiuskjbfjdshk'],
}));

//--------------------------------DATABASE---------------------------------------

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID",
    visit: 0,
    uniqueVisitor: new Set(),
    allVisits: []
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
    visit: 0,
    uniqueVisitor: new Set(),
    allVisits: []
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("hello", 10),
  }
};

//--------------------------------ENDPOINTS---------------------------------------

// Redirect "/" route to login route
app.get("/", (req, res) => {
  res.redirect("/login");
});

//---- Registration
// Send the registration page to user
app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect("/urls");
  }
  res.render("registration");
});

// Check and add a user to the database
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Email or Password is invalid!");
  }
  
  const userObj = getUserByEmail(req.body.email || "", users);
  if (userObj) {
    return res.status(400).send("Email already registered");
  }

  const randId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const newUser = {
    id: randId,
    email: req.body.email,
    password: hashedPassword,
  };
  users[randId] = newUser;
  req.session.user_id = randId;
  res.redirect("/urls");
});

//---- Login & Logout
// Send the login page to user
app.get("/login", (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect("/urls");
  }
  res.render("login");
});

// Verify and log the user into the system
app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Email or Password is invalid!");
  }

  const userObj = getUserByEmail(req.body.email || "", users);
  if (userObj && req.body.password && bcrypt.compareSync(req.body.password, userObj.password)) {
    req.session.user_id = userObj.id;
    return res.redirect("/urls");
  }
  res.status(403).send("Email or Password not found!");
});

// Log user out and clear cache
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//---- URLs related requests
// Send a page in which users can see their short links
app.get("/urls", (req, res) => {
  let templateVars = { user: "", urls: {} };
  if (users[req.session.user_id]) {
    const filteredURL = urlsForUser(req.session.user_id, urlDatabase);
    templateVars = { urls: filteredURL, user: users[req.session.user_id].email };
  }
  res.render("urls_index", templateVars);
});

// Create a new short link
app.post("/urls", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.send("Please login first before accessing this functionality");
  }
  const randomStr = generateRandomString();
  urlDatabase[randomStr] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    visit: 0,
    uniqueVisitor: new Set(),
    allVisits: []
  };
  res.redirect(`/urls/${randomStr}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Send a page for registered users to create a short link
app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.session.user_id].email };
  res.render("urls_new", templateVars);
});

// Check and get information of the short link
app.get("/urls/:id", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.status(403).send("Authorization Denied!");
  }

  const shortenedLinks = urlsForUser(req.session.user_id, urlDatabase);
  if (req.params.id in shortenedLinks) {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id].email, history: urlDatabase[req.params.id].allVisits };
    return res.render("urls_show", templateVars);
  }

  res.status(403).send("Authorization Denied!");
});

// Check and edit the short link by the owner
app.put("/urls/:id", (req, res) => {
  const shortenedLinks = urlsForUser(req.session.user_id, urlDatabase);
  if (users[req.session.user_id] && req.params.id in shortenedLinks) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    return res.redirect("/urls");
  }
  res.status(403).send("Authorization Denied!");
});

// Check and delete the short link by the owner
app.delete("/urls/:id", (req, res) => {
  const shortenedLinks = urlsForUser(req.session.user_id, urlDatabase);
  if (users[req.session.user_id] && req.params.id in shortenedLinks) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  }
  res.status(403).send("Authorization Denied!");
});


//---- Redirect to longURL (anyone can access this)
// Redirect to long URL and keep track of analytics
app.get("/u/:id", (req, res) => {

  // Keep track of timestamp and userID per short link
  const randId = generateRandomString();
  if (!req.session.userIdForTimestamp) {
    req.session.userIdForTimestamp = randId;
  }

  // Keep track of unique visitors per short link
  if (!req.session.uniqueSiteUserId) {
    req.session.uniqueSiteUserId = randId;
  }

  if (urlDatabase[req.params.id]) {
    // Save information for cookies when the short link exist
    urlDatabase[req.params.id].allVisits.push({
      timestamp: (new Date()).toString(),
      userId: req.session.userIdForTimestamp
    });
    urlDatabase[req.params.id].uniqueVisitor.add(req.session.uniqueSiteUserId);

    urlDatabase[req.params.id].visit = ("visit" in urlDatabase[req.params.id]) ? urlDatabase[req.params.id].visit + 1 : 1;
    return res.redirect(urlDatabase[req.params.id].longURL);
  }
  res.status(404).send("Shortened URL not found");
});

//-------------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});