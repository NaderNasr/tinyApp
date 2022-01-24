const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
