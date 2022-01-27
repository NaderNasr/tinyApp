const { urlDatabase } = require('../databases/mockDatabases');


const urlsForUser = (id) => {
  let verifiedUser = {};
  for (const key of Object.keys(urlDatabase)) {
    if (urlDatabase[key].userID === id) {
      verifiedUser[key] = urlDatabase[key];
    }
  }
  return verifiedUser;
};

const findUserByEmail = (email, userDB) => {
  for (const userId in userDB) {
    const user = userDB[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// Generate random string for short URL
const generateRandomString = () => {
  let result = '';
  let chars = 'AB67CDJK234LMNOPQRopqrstuvwxyz01589';
  for (let i in chars) {
    result += chars[i].charAt(Math.random() * 3);
  }
  return result.substring(0, 6);
};

//Generate random string for userID
const randomUserID = () => {
  return Math.random().toString(36).slice(7);
};

//Login time of day greeting
const greet = () => {
  const newDate = new Date();
  const hours = newDate.getHours();
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

module.exports = {
  urlsForUser,
  findUserByEmail,
  generateRandomString,
  randomUserID,
  greet,
};