const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const express = require("express");
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['df9c8e16-42ca-46a3-8457-aa83a2e94930', 'dd2f9568-af42-4ccf-abfe-da1f5563d6d0']
}));

//helper functions
const {
  urlsForUser,
  findUserByEmail,
  generateRandomString,
  randomUserID,
  greet
} = require('./helpers/functions');

//Databases
const {
  users,
  urlDatabase
} = require('./databases/mockDatabases');


const pleaseLoginMSG = '<h3 style="margin-left: 20px; margin-top: 10px"> Hey Stranger 👋 <br/> Please <a href="/register">Register</a> or <a href="/login">Login</a> to create short url </h3>';


//if user logged in go to urls if NOT go to login/register page
app.get("/", (req, res) => {
  const userSession = req.session["userId"];
  if (userSession) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


//urls_index route to render url database object.
app.get("/urls", (req, res) => {
  const userSession = req.session["userId"];
  if (userSession) {
    const templateVars = {
      user: users[userSession],
      urls: urlsForUser(userSession),
      greet: greet(),
    };
    res.render("urls_index", templateVars);
  } else {
    res.send(pleaseLoginMSG);
  }
  
});

//Form route
app.get("/urls/new", (req, res) => {
  const userSession = req.session["userId"];

  if (!userSession) {
    res.send(pleaseLoginMSG);
  }

  const templateVars = {
    username: req.session["username"],
    greet: greet(),
    user: users[userSession]
  };
  res.render("urls_new", templateVars);
});

//Post request to create a new tiny url.
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  const urlObject = {
    longURL,
    userID: req.session['userId']
  };

  urlDatabase[shortURL] = urlObject;
  res.redirect(`/urls/${shortURL}`);
});

//Second route to render short and long URL.
app.get("/urls/:shortURL", (req, res) => {
  const userSession = req.session["userId"];
  if (!userSession) {
    res.send(pleaseLoginMSG);
  }
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    username: req.session["username"],
    greet: greet(),
    user: users[userSession]
  };
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Delete a url
app.post('/urls/:shortURL/delete', (req, res) => {
  const userSession = req.session["userId"];
  if (!userSession) {
    res.send(pleaseLoginMSG);
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
  
});

//Modify/Edit current long URL and keep current short URL
app.post("/urls/:shortURL", (req, res) => {
  const userSession = req.session["userId"];
  if (!userSession) {
    res.send(pleaseLoginMSG);
  }
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

//Login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password[0];
  //if email and/or password are not available
  if (!email || !password) {
    res.status(403).send('Email or password cannot be empty <a href="/login"> Please try again</a>');
  }
  const activeUser = findUserByEmail(email, users);
  //if there is an authenticated user
  if (activeUser) {
    //if the authenticated users passwords match
    if (bcrypt.compareSync(password, activeUser.password)) {
      const userId = activeUser.id;
      req.session['userId'] = userId;
      res.redirect('/urls');
    } else {
      res.status(403).send('Invalid password <a href="/login"> Please try again</a>');
    }
  } else {
    res.status(403).send('no user with that email <a href="/login"> Please try again</a>');
  }
  
});
//User Login
app.get('/login', (req, res) => {
  const userSession = req.session["userId"];
  const templateVars = {
    user: users[userSession]
  };
  res.render('login', templateVars);
});

//logout - remove COOKIE
app.post('/logout', (req, res) => {
  req.session['userId'] = null;
  res.redirect('/');
});

//User Registration
app.get('/register', (req, res) => {
  const userSession = req.session["userId"];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[userSession],
    greet: greet()
  };
  
  res.render('registration', templateVars);
});


// Add new user to database and hash password
app.post('/register', (req, res) => {
  const userId = randomUserID();
  const email = req.body.email;
  const password = req.body.password[0];
  const hashedPassword = bcrypt.hashSync(password,10);
  const user = findUserByEmail(email, users);
  //check to see if email or password are not available.
  if (email === '' || password === '') {
    return res.status(400).send("email and/or password can not be blank. Please <a href='/register'>try again</a>");
  }
  // if email already exists in the database.
  if (user) {
    return res.status(400).send("A user with that email already exists. Please<a href='/register'>Try again</a>");
  }
  // if this is a new user registering.
  users[userId] = {
    id: userId,
    email,
    password: hashedPassword
  };
  req.session['userId'] = userId;
  res.redirect('/urls');
});

//Start server on PORT and log to terminal.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});