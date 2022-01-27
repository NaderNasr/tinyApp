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
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com",
  b6UTxQ: {
    longURL: "https://www.tsn.com",
    userID: "user2"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID"
  }
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
    email: "u3@example.com",
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


const urlsForUser = (id) => {
  let verifiedUser = [];
  for (const key of Object.keys(urlDatabase)) {
    if (urlDatabase[key].userID === id) {
      verifiedUser.push(urlDatabase[key].longURL);
    }
  }
  return verifiedUser;
};

console.log(`XXxxx---URLSFORUSER >>>> ${urlsForUser('userRandomID')}`);

const pleaseLoginMSG = '<h3 style="margin-left: 20px; margin-top: 10px"> Hey Stranger 👋 <br/> Please <a href="/register">Register</a> or <a href="/login">Login</a> to create short url </h3>';



//if user logged in go to urls if NOT go to login/register page
app.get("/", (req, res) => {
  const userSession = req.cookies["userId"];
  if (userSession) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


//urls_index route to render url database object.
app.get("/urls", (req, res) => {
  const userSession = req.cookies["userId"];
  // console.log('-----------------------------', verifiedUrlToUser(userSession));
  // console.log('-----------------------------', userSession);
  //SHORT URL PUBLIC ?????
  if (userSession) {
    const templateVars = {
      user: users[userSession],
      urls: urlsForUser(userSession),
      greet: greet(),
    };
    res.render("urls_index", templateVars);
  }
  res.send(pleaseLoginMSG);
});

//Form route
app.get("/urls/new", (req, res) => {
  const userSession = req.cookies["userId"];

  if (!userSession) {
    res.send(pleaseLoginMSG);
  }

  const templateVars = {
    username: req.cookies["username"],
    greet: greet(),
    user: users[userSession]
  };
  res.render("urls_new", templateVars);
});

//Post request to create a new tiny url.
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Second route to render short and long URL.
app.get("/urls/:shortURL", (req, res) => {
  const userSession = req.cookies["userId"];

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
    greet: greet(),
    user: users[userSession]
  };
  res.render("urls_show", templateVars);
});

//
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
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
  const email = req.body.email;
  const password = req.body.password[0];
  const activeUser = findUserByEmail(email);
  if (activeUser) {
    if (password === activeUser.password) {
      const userId = activeUser.id;
      res.cookie('userId', userId);
      res.redirect('/urls');
    } else {
      // res.cookie('err', 'Invalid password');
      // res.redirect('/login');
      //clear cookie
      res.status(403).send('Invalid password <a href="/login">try again</a>');
    }
  } else {
    res.status(403).send('no user with that email <a href="/login">try again</a>');
  }
  if (!email || !password) {
    res.status(403).send('Email or password cannot be empty <a href="/login">try again</a>');
  }
});

//User Login
app.get('/login', (req, res) => {
  const userSession = req.cookies["userId"];
  const templateVars = {
    user: users[userSession],
    err: req.cookies['err']
  };
  res.render('login', templateVars);
});

//logout - remove COOKIE
app.post('/logout', (req, res) => {
  res.clearCookie('userId');
  res.redirect('/');
});

//User Registration
app.get('/register', (req, res) => {
  const userSession = req.cookies["userId"];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[userSession],
    greet: greet()
  };
  
  res.render('registration', templateVars);
});

app.post('/register', (req, res) => {
  const userId = randomUserID();
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

  users[userId] = {
    id: userId,
    email,
    password
  };
  
  res.cookie("userId", userId);
  console.log(users);
  res.redirect('/urls');
});

//Start server on PORT and log to terminal.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});