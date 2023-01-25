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
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//--------------------------------ENDPOINTS---------------------------------------

app.get("/", (req, res) => {
  res.redirect("/login");
});

// Registration
app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect("/urls");
  }
  res.render("registration");
});

app.post("/register", (req, res) => {
  const userObj = getUserByEmail(req.body.email || "", users);

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Email or Password is invalid!");
  }
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

// Login & Logout
app.get("/login", (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect("/urls");
  }
  res.render("login");
});

app.post("/login", (req, res) => {
  const userObj = getUserByEmail(req.body.email || "", users);
  if (userObj && req.body.password && bcrypt.compareSync(req.body.password, userObj.password)) {
    req.session.user_id = userObj.id;
    return res.redirect("/urls");
  }

  res.status(403).send("Email or Password not found!");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//URLs related requests
app.get("/urls", (req, res) => {
  let templateVars = { user: "", urls: {} };
  if (users[req.session.user_id]) {
    const filteredURL = urlsForUser(req.session.user_id, urlDatabase);
    templateVars = { urls: filteredURL, user: users[req.session.user_id].email };
  }
  res.render("urls_index", templateVars);
});

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

app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.session.user_id].email };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.status(403).send("Authorization Denied!");
  }

  const shortenedLinks = urlsForUser(req.session.user_id, urlDatabase);
  if (req.params.id in shortenedLinks) {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id].email };
    return res.render("urls_show", templateVars);
  }

  res.status(403).send("Authorization Denied!");
});

app.put("/urls/:id", (req, res) => {
  const shortenedLinks = urlsForUser(req.session.user_id, urlDatabase);
  if (users[req.session.user_id] && req.params.id in shortenedLinks) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    return res.redirect("/urls");
  }
  res.status(403).send("Authorization Denied!");
});

app.delete("/urls/:id", (req, res) => {
  const shortenedLinks = urlsForUser(req.session.user_id, urlDatabase);
  if (users[req.session.user_id] && req.params.id in shortenedLinks) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  }
  res.status(403).send("Authorization Denied!");
});


// Redirect to longURL (anyone can access this)
app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    urlDatabase[req.params.id].visit = ("visit" in urlDatabase[req.params.id]) ? urlDatabase[req.params.id].visit + 1 : 1;
    return res.redirect(urlDatabase[req.params.id].longURL);
  }
  res.status(404).send("Shortened URL not found");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});