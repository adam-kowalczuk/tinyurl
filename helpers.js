//Creates a random string to be used as a shortURL
const generateRandomString = function() {
  return (Math.random() + 1).toString(36).substring(6);
};

//Checks to see if ID is registered (used for checking if user is logged in)
const getUserByID = function(loggedID, users) {
  for (const user in users) {
    if (users[user].id === loggedID) {
      return users[user];
    }
  }
  return null;
};

//Checks whether shortURL exists
const getShortURL = function(shortURL, urls) {
  for (const url in urls) {
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
const urlsForUser = function(id, urls) {
  let matchingURLS = {};
  for (const url in urls) {
    if (urls[url].userID === id) {
      matchingURLS[url] = urls[url];
    }
  }
  if (!Object.keys(matchingURLS).length) {
    return null;
  }
  return matchingURLS;
};

module.exports = {
  generateRandomString,
  getShortURL,
  getUserByID,
  getUserByEmail,
  urlsForUser
};