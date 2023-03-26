//"DATABASES"

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "abc"
  },
  "9sm5xk": {
    longURL: "http://www.google.com",
    userID: "def"
  }
};

const users = {
  abc: {
    id: "abc",
    email: "a@a.com",
    //FOR EVALUATOR: Plaintext password is '1234'
    password: "$2a$10$/KNVWX0qJSrHpKQ42vV5Juqv0G9kRaEnYz6lKiJSCtyZnvQUDpEI6",
  },
  def: {
    id: "def",
    email: "b@b.com",
    //FOR EVALUATOR: Plaintext password is '5678'
    password: "$2a$10$8Qxt4EDtL00oRfNfof50uOGxyqsM19HaHWCsutpry1WZDP3Ee69oS",
  },
};

module.exports = {
  users,
  urlDatabase
}