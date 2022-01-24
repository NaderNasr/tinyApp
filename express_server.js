const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  return (Math.random() + 1).toString(36).substring(7);
};

//landing page route.
app.get("/", (req, res) => {
  res.send("Welcome to tiny app");
});

//urls_index route to render url database object.
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

//Form route
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Post request to create a new tiny url.
app.post("/urls", (req, res) => {
  console.log(req.params);
  res.send(generateRandomString());
});

//Second route to render short and long URL.
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

//Start server on PORT and log to terminal.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
