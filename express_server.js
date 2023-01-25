const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require("./helpers");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: [ 'ajsgioeewoiuskjbfjdshk' ],
}));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID",
    visit: 0,
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




const generateRandomString = () => {
  let res = "";
  for (let i = 0; i < 6; i++) {
    res += (String.fromCharCode(97 + Math.floor(Math.random() * 26)));
  }
  return res;
};

const urlsForUser = (id) => {
  let res = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      res[key] = urlDatabase[key];
    }
  }
  return res;
};



app.get("/", (req, res) => {
  res.redirect("/login");
});

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


app.get("/urls", (req, res) => {
  let templateVars = { user: "", urls: {} };
  if (users[req.session.user_id]) {
    const filteredURL = urlsForUser(req.session.user_id);
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
    userID: req.session.user_id
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

  const shortenedLinks = urlsForUser(req.session.user_id);
  if (req.params.id in shortenedLinks) {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id].email };
    return res.render("urls_show", templateVars);
  }

  res.status(403).send("Authorization Denied!");
});

app.post("/urls/:id/delete", (req, res) => {
  const shortenedLinks = urlsForUser(req.session.user_id);
  if (users[req.session.user_id] && req.params.id in shortenedLinks) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  }
  res.status(403).send("Authorization Denied!");
});

app.post("/urls/:id/edit", (req, res) => {
  const shortenedLinks = urlsForUser(req.session.user_id);
  if (users[req.session.user_id] && req.params.id in shortenedLinks) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    return res.redirect("/urls");
  }
  res.status(403).send("Authorization Denied!");
});

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    urlDatabase[req.params.id].visit = ("visit" in urlDatabase[req.params.id]) ? urlDatabase[req.params.id].visit + 1 : 1;
    return res.redirect(urlDatabase[req.params.id].longURL);
  }
  res.status(404).send("Shortened URL not found");
});


app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});