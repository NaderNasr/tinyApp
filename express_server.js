const bodyParser = require("body-parser");
const cookie = require("cookie-parser");
const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080;

app.use(cookie());
app.use(morgan('dev'));
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

//Mock User Database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2": {
    id: "user2",
    email: "user2@example.com",
    password: "123"
  }
};

//Generate random string for userID
const randomUserID = () => {
  return Math.random().toString(36).slice(7);
};

// Generate random string for short URL
const generateRandomString = () => {
  return Math.random().toString(36).substring(7);
};

const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};


//urls_index route to render url database object.
app.get("/urls", (req, res) => {
  const userSession = req.cookies["user_id"];
  const templateVars = {
    urls: urlDatabase,
    greet: greet(),
    user: users[userSession]
  };
  res.render("urls_index", templateVars);
});

//Form route
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    greet: greet(),
    user: req.cookies["user_id"]
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
    greet: greet(),
    user: req.cookies["user_id"]
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
  const user = req.body.username[0];
  console.log(`🚔🚔CONSOLE ALERT🚔🚔 ===> ${user}`);
  
  res.cookie('user_id', user);
  res.redirect('/urls');
});

//logout - remove COOKIE
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//User Registration
app.get('/register', (req, res) => {
  const userSession = req.cookies["user_Id"];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[userSession],
    greet: greet()
  };
  
  
  res.render('registration', templateVars);
});

app.post('/register', (req, res) => {
  const user_id = randomUserID();
  const email = req.body.email;
  const password = req.body.password[0];
  // const cookieUserId = req.cookies[userId];
  const user = findUserByEmail(email);

  if (!email || !password) {
    return res.status(400).send("email and/or password can not be blank. Please <a href='/register'>try again</a>");
  }

  if (user) {
    return res.status(400).send("A user with that email already exists. Please<a href='/register'>Try again</a>");
  }
  
  users[user_id] = {
    user_id,
    email,
    password
  };

  
  res.cookie("user_id", user_id);
  console.log(users[user_id]);
  res.redirect('/urls');
});

//Start server on PORT and log to terminal.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});