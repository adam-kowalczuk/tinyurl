//Creates a random string to be used as a shortURL
const generateRandomString = function() {
  return (Math.random() + 1).toString(36).substring(6);
};

//Checks to see if ID is registered (used for checking if user is logged in)
const getUserByID = function(loggedID) {
  for (const user in users) {
    if (users[user].id === loggedID) {
      return users[user];
    }
  }
  return null;
};

//Checks whether shortURL exists
const getShortURL = function(shortURL) {
  for (const url in urlDatabase) {
    if (url === shortURL) {
      return url;
    }
  }
  return null;
};

//Checks to see if email is already in use
const getUserByEmail = function(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

//Check for any urls with matching userID, and if so returns an object of those urls
const urlsForUser = function(id) {
  let matchingURLS = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      matchingURLS[url] = urlDatabase[url];
    }
  }
  if (!Object.keys(matchingURLS).length) {
    return null;
  }
  return matchingURLS;
};


const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const user = getUserByEmail("user@example.com", testUsers)
console.log(user.id);


module.exports = {
  generateRandomString,
  getUserByEmail,
  getUserByID,
  getShortURL,
  urlsForUser
}