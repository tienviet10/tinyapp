const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/", (req, res) => {
  res.send("Hello!");
});



app.get("/register", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    res.redirect("/urls");
  }
  res.render("registration");
});

app.post("/register", (req, res) => {
  const userObj = getUserByEmail(req.body.email || "");
  
  if (req.body.email === "" || req.body.password === "" || userObj) {
    res.status(400).json({ message: "Email or Password is invalid!" });
  } else {
    const randId = generateRandomString();
    const newUser = {
      id: randId,
      email: req.body.email,
      password: req.body.password,
    };
    users[randId] = newUser;
    res.cookie('user_id', randId);
    res.redirect("/urls");
  }

});

app.post("/login", (req, res) => {
  const userObj = getUserByEmail(req.body.email || "");
  if (userObj && req.body.password && req.body.password === userObj.password) {
    res.cookie('user_id', userObj.id);
    res.redirect("/urls");
  } else {
    res.status(403).json({ message: "Email or Password not found!" });
  }
});

app.get("/login", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    res.redirect("/urls");
  }
  res.render("login");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] || {} };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    res.send("Please loin first before accessing this functionality");
  } else {
    const randomStr = generateRandomString();
    urlDatabase[randomStr] = req.body.longURL;
    res.redirect(`/urls/${randomStr}`);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    res.redirect("/login");
  }

  const templateVars = { user: users[req.cookies["user_id"]] || {} };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]] || {} };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  if (req.params.id in urlDatabase) {
    delete urlDatabase[req.params.id];
  }
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  if (req.params.id in urlDatabase) {
    urlDatabase[req.params.id] = req.body.longURL;
  }
  res.redirect("/urls");
});


app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    res.redirect(urlDatabase[req.params.id]);
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