/* eslint-disable camelcase */
require("dotenv").config();
const express = require("express");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const generateRandomString = require("./helpers/generalHelpers");
const { checkUserById, checkAuthentication, addNewUser, getEmailFromCookie } = require("./helpers/userHelpers");
const { urlsForUser, createShortLink, getLongFromShort, getAllVisitorsFromShort, editOrDeleteURL, trackingAnalytics } = require("./helpers/linkHelpers");

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSIONKEY1, process.env.SESSIONKEY2],
}));

// Redirect every routes except routes in whitelist to /login
app.use((req,res, next) => {
  const userId = checkUserById(req.session.user_id);
  const whiteList = ["/", "/login", "/register", "/logout", "/urls"];

  if (userId || whiteList.includes(req.url) || req.url.includes("/u/")) {
    return next();
  }

  return res.redirect("/login");
});

//--------------------------------ENDPOINTS---------------------------------------

// Redirect "/" route to login route
app.get("/", (req, res) => {
  res.redirect("/login");
});


//---- Registration
// Send the registration page to user
app.get("/register", (req, res) => {
  if (checkUserById(req.session.user_id)) {
    return res.redirect("/urls");
  }

  res.render("registration");
});

// Check and add a user to the database
app.post("/register", (req, res) => {
  const { message } = checkAuthentication(req.body.email, req.body.password, "register");
  if (message) {
    return res.status(400).send(message);
  }

  const randId  = addNewUser(req.body.password, req.body.email);
  req.session.user_id = randId;
  res.redirect("/urls");
});


//---- Login & Logout
// Send the login page to user
app.get("/login", (req, res) => {
  if (checkUserById(req.session.user_id)) {
    return res.redirect("/urls");
  }

  res.render("login");
});

// Verify and log the user into the system
app.post("/login", (req, res) => {
  const {message, data} = checkAuthentication(req.body.email, req.body.password, "login");
  if (message) {
    return res.status(400).send(message);
  }

  req.session.user_id = data.id;
  return res.redirect("/urls");
});

// Log user out and clear cache
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


//---- URLs related requests
// Send a page in which users can see their short links
app.get("/urls", (req, res) => {
  let templateVars = { urls: {}, user: "" };
  if (checkUserById(req.session.user_id)) {
    const filteredURL = urlsForUser(req.session.user_id);
    templateVars = { urls: filteredURL, user: getEmailFromCookie(req.session.user_id) };
  }

  res.render("urls_index", templateVars);
});

// Create a new short link
app.post("/urls", (req, res) => {
  if (!checkUserById(req.session.user_id)) {
    return res.send("Please login first before accessing this functionality");
  }

  const randomStr = createShortLink(req.body.longURL, req.session.user_id);
  res.redirect(`/urls/${randomStr}`);
});

// Send a page for registered users to create a short link
app.get("/urls/new", (req, res) => {
  const templateVars = { user: getEmailFromCookie(req.session.user_id) };
  res.render("urls_new", templateVars);
});

// Check and get information of the short link
app.get("/urls/:id", (req, res) => {
  const shortenedLinks = urlsForUser(req.session.user_id);
  if (!(req.params.id in shortenedLinks)) {
    return res.status(403).send("Cannot access this short link! Please <a href='/urls'>try again</a>!");
  }

  const templateVars = { id: req.params.id, longURL: getLongFromShort(req.params.id), user: getEmailFromCookie(req.session.user_id), history: getAllVisitorsFromShort(req.params.id) };
  return res.render("urls_show", templateVars);
});

// Edit the short link by the owner
app.put("/urls/:id", (req, res) => {
  if (editOrDeleteURL(req.session.user_id, req.params.id, req.body.longURL, "edit")) {
    return res.redirect("/urls");
  }

  res.status(403).send("Authorization Denied!");
});

// Delete the short link by the owner
app.delete("/urls/:id", (req, res) => {
  if (editOrDeleteURL(req.session.user_id, req.params.id, "", "delete")) {
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

  // Save cookie information to database
  const { error, data } = trackingAnalytics(req.params.id, req.session.userIdForTimestamp, req.session.uniqueSiteUserId);
  if (!error) {
    return res.redirect(data);
  }

  res.status(404).send("Shortened URL not found");
});

//--------------------------------------------------------------------------------

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`);
});
