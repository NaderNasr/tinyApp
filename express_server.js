const bodyParser = require("body-parser");
const cookie = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080;

app.use(cookie());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

//Login time of day greeting
const greet = () => {
  let newDate = new Date();
  let hours = newDate.getHours();
  let greet = '';
  if (hours < 12) {
    greet = 'Good Morning';
  } else if (hours >= 12 && hours <= 17) {
    greet = 'Good Afternoon';
  } else if (hours >= 17 && hours <= 24) {
    greet = 'Good Evening';
  }
  return greet;
};

//Mock Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Generate random string for short URL
const generateRandomString = () => {
  return Math.random().toString(36).substring(7);
};

//urls_index route to render url database object.
app.get("/urls", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = {
    urls: urlDatabase,
    username: username,
    greet: greet()
  };
  res.render("urls_index", templateVars);
});

//Form route
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    greet: greet()
  };
  res.render("urls_new", templateVars);
});

//Post request to create a new tiny url.
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Second route to render short and long URL.
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
    greet: greet()
  };
  res.render("urls_show", templateVars);
});

//
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

// Delete a url
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//Modify/Edit current long URL and keep current short URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

//Login - COOKIE
app.post('/login', (req, res) => {
  const username = req.body.username[0];
  console.log(`🚔🚔CONSOLE ALERT🚔🚔 ===> ${username}`);
  
  res.cookie('username', username);
  res.redirect('/urls');
});

//logout - remove COOKIE
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

//Start server on PORT and log to terminal.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
