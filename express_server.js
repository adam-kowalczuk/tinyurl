const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs"); //Tells Express to use EJS as it's templating engine

//GLOBAL OBJECTS

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
    password: "1234",
  },
  def: {
    id: "def",
    email: "b@b.com",
    password: "1234",
  },
};

//GLOBAL FUNCTIONS

//Creates a random string to be used as a shortURL
const generateRandomString = function() {
  return (Math.random() + 1).toString(36).substring(6);
};

//Checks to see if email is already in use
const getUserByEmail = function(newEmail) {
  for (const user in users) {
    if (users[user].email === newEmail) {
      return users[user];
    }
  }
  return null;
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

//Check for any urls with matching userID, and if so returns an object of those urls
const urlsForUser = function(id) {
  matchingURLS = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      matchingURLS[url] = urlDatabase[url];
    }
  }
  if (matchingURLS === {}) {
    return null;
  }
  return matchingURLS;
};

//MIDDLEWARE

app.use(express.urlencoded({ extended: true })); //Express library's body parsing middleware to make the POST request body human readable
app.use(cookieParser()); //Populates req.cookie
app.use(morgan("dev")); //Prints dev updates to server

//BROWSE

//A list of generated shortURLs with corresponding longURLS;
app.get("/urls", (req, res) => {
  const user = getUserByID(req.cookies["user_id"]);

  const urls = urlsForUser(req.cookies["user_id"]);
  if (urls) {
    const templateVars = {
      user,
      urls
    };
    console.log(templateVars);
    return res.render("urls_index", templateVars);
  }
});

//ADD

//Creates and adds generated-shortURL:longURL pair to urlDatabase
app.post("/urls", (req, res) => {
  const user = getUserByID(req.cookies["user_id"]);
  if (!user) {
    return res.status(403).send("403 Forbidden: Only registered users may create shortURLs");
  }
  const id = generateRandomString();
  urlDatabase[id] = { longURL: req.body.longURL, userID: user.id };
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
});

//Checks if email or password input is undefined, user exists, and password is correct length. If all checks pass, creates object of user info (id, email, password) and adds it to users database
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const existentUser = getUserByEmail(email);

  if (!email || !password) {
    return res.status(400).send("400 Bad Request: Please provide an email and a password");
  }

  if (existentUser) {
    return res.status(400).send("400 Bad Request: Email unavailable");
  }

  if (password.length < 4 || password.length > 12) {
    return res.status(400).send("400 Bad Request: Please provide a password between 4 and 12 characters");
  }

  let user = {
    id,
    email,
    password
  };
  users[id] = user;

  //Creates user_id cookie
  res.cookie("user_id", id);
  res.redirect("/urls");
});

//Checks if user exists and if password matches. If both checks pass, creates user_id cookie and sends user back to /urls
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const existentUser = getUserByEmail(email);

  if (!existentUser) {
    return res.status(403).send("403 Forbidden: User not found");
  };

  if (existentUser.password !== password) {
    return res.status(403).send("403 Forbidden: Invalid password");
  }

  //Creates user_id cookie
  res.cookie("user_id", existentUser.id);
  res.redirect("/urls");
});

//READ

//Renders template for creating new shortURLs
app.get("/urls/new", (req, res) => {
  const user = getUserByID(req.cookies["user_id"]);
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

//Renders template for registering a new user (redirects to /urls if already registered)
app.get("/register", (req, res) => {
  const user = getUserByID(req.cookies["user_id"]);
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user
  };
  res.render("register", templateVars);
});

//Renders template for logging in (redirects to /urls if already logged in)
app.get("/login", (req, res) => {
  const user = getUserByID(req.cookies["user_id"]);
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user
  };
  res.render("login", templateVars);
});

//Renders template showing information for particular shortURL
app.get("/urls/:id", (req, res) => {
  const user = getUserByID(req.cookies["user_id"]);
  if (!user) {
    return res.status(403).send("403 Forbidden: Please login in to view shortURL info");
  }

  const urls = urlsForUser(req.cookies["user_id"]);
  if (!urls[req.params.id]) {
    return res.status(403).send("403 Forbidden: Current user access denied");
  }
  
  console.log("urls", urls);

  const templateVars = {
    user,
    id: req.params.id,
    longURL: urls[req.params.id].longURL
  };
  return res.render("urls_show", templateVars);
});

//Redirects user to longURL stored in shortURL
app.get("/u/:id", (req, res) => {
  const id = getShortURL(req.params.id);
  if (!id) {
    return res.status(404).send("404 Not Found: shortURL does not exist");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//EDIT

//Updates shortURL:longURL pair in urlDatabase
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls`);
});

//DELETE

//Deletes shortURL:longURL from urlDatabase
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//Clears user_id cookie 
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  console.log(users);
  res.redirect("/login");
});

//TURN THE SERVER ON

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});