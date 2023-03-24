//Checks to see if email is already in use

const getUserByEmail = function(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

module.exports = {
  getUserByEmail
}