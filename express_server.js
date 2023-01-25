const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID",
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


const getUserByEmail = (email) => {
  for (let obj in users) {
    if (users[obj].email === email) {
      return users[obj];
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
  if (users[req.cookies["user_id"]]) {
    res.redirect("/urls");
  }
  res.render("registration");
});

app.post("/register", (req, res) => {
  const userObj = getUserByEmail(req.body.email || "");

  if (req.body.email === "" || req.body.password === "") {
    res.status(400).json({ message: "Email or Password is invalid!" });
  } else if (userObj) {
    res.status(400).json({ message: "Email already registered" });
  } else {
    const randId = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const newUser = {
      id: randId,
      email: req.body.email,
      password: hashedPassword,
    };
    users[randId] = newUser;
    res.cookie('user_id', randId);
    res.redirect("/urls");
  }
});


app.get("/login", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    res.redirect("/urls");
  }
  res.render("login");
});

app.post("/login", (req, res) => {
  const userObj = getUserByEmail(req.body.email || "");
  if (userObj && req.body.password && bcrypt.compareSync(req.body.password, userObj.password)) {
    res.cookie('user_id', userObj.id);
    res.redirect("/urls");
  } else {
    res.status(403).json({ message: "Email or Password not found!" });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});


app.get("/urls", (req, res) => {
  let templateVars = { user: "", urls: {} };
  if (users[req.cookies["user_id"]]) {
    const filteredURL = urlsForUser(req.cookies["user_id"]);
    templateVars = { urls: filteredURL, user: users[req.cookies["user_id"]].email };
  }
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    res.send("Please login first before accessing this functionality");
  } else {
    const randomStr = generateRandomString();
    urlDatabase[randomStr] = {
      longURL: req.body.longURL,
      userID: req.cookies["user_id"]
    };
    res.redirect(`/urls/${randomStr}`);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[req.cookies["user_id"]].email };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    res.status(403).json({ message: "Authorization Denied!" });
  } else {
    const shortenedLinks = urlsForUser(req.cookies["user_id"]);
    if (req.params.id in shortenedLinks) {
      const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.cookies["user_id"]].email };
      res.render("urls_show", templateVars);
    } else {
      res.status(403).json({ message: "Authorization Denied!" });
    }
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const shortenedLinks = urlsForUser(req.cookies["user_id"]);
  if (users[req.cookies["user_id"]] && req.params.id in shortenedLinks) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(403).json({ message: "Authorization Denied!" });
  }

});

app.post("/urls/:id/edit", (req, res) => {
  const shortenedLinks = urlsForUser(req.cookies["user_id"]);
  if (users[req.cookies["user_id"]] && req.params.id in shortenedLinks) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(403).json({ message: "Authorization Denied!" });
  }

});

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    res.redirect(urlDatabase[req.params.id].longURL);
  } else {
    res.status(404).json({ message: "Shortened URL not found" });
    // res.redirect(longURL);
  }
});


app.get("/hello", (req, res) => {
  // res.send("<html><body>Hello <b>World</b></body></html>\n");
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});