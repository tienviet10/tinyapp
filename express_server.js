const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let username = "";

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


app.post("/login", (req, res) => {
  if (req.body.username && req.body.username.length > 0) {
    username = req.body.username;
  }
  console.log(username);
  // res.send("ok");
  res.cookie('username', username);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomStr = generateRandomString();
  urlDatabase[randomStr] = req.body.longURL;
  res.redirect(`/urls/${randomStr}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id] ? urlDatabase[req.params.id] : "/";
  res.redirect(longURL);
});





app.get("/hello", (req, res) => {
  // res.send("<html><body>Hello <b>World</b></body></html>\n");
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});