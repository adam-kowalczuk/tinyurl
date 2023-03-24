const express = require("express");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
//Helper functions available to view in helpers.js
const { generateRandomString, getUserByEmail, getShortURL, getUserByID, urlsForUser } = require('./helpers'); 

const app = express();
const PORT = 8080;

//Tells Express to use EJS as it's templating engine
app.set("view engine", "ejs"); 

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

//MIDDLEWARE

//Express library's body parsing middleware to make the POST request body human readable
app.use(express.urlencoded({ extended: true })); 
//Prints dev updates to server
app.use(morgan("dev")); 
//Populates req.session
app.use(cookieSession({ 
  name: 'session',
  keys: ['secret']
}));


//BROWSE

//Redirects to either /login or /urls depending on login status
app.get("/", (req, res) => {
  const user = getUserByID(req.session.user_id, users);
  if (!user) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

//A list of generated shortURLs with corresponding longURLS;
app.get("/urls", (req, res) => {
  const user = getUserByID(req.session.user_id, users);
  const urls = urlsForUser(req.session.user_id, urlDatabase);

  const templateVars = {
    user,
    urls
  };
  return res.render("urls_index", templateVars);
});

//ADD

//Creates and adds generated-shortURL:longURL pair to urlDatabase
app.post("/urls", (req, res) => {
  const user = getUserByID(req.session.user_id, users);
  if (!user) {
    return res.status(403).send("403 Forbidden: Only registered users may create shortURLs");
  }

  const id = generateRandomString();
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${id}`);
});

//Checks first if email or password input is undefined, user exists, and password is correct length. If all checks pass, creates object of user info (id, email, password) and adds it to users database
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const existentUser = getUserByEmail(email, users);

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
    id: id,
    email: email,
    password: hashedPassword
  };
  users[id] = user;

  //Creates user_id cookie
  req.session.user_id = id;
  res.redirect("/urls");
});

//Checks first if user exists and if password matches. If both checks pass, creates user_id cookie and sends user back to /urls
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const existentUser = getUserByEmail(email, users);


  if (!existentUser) {
    return res.status(403).send("403 Forbidden: User not found");
  };

  const result = bcrypt.compareSync(password, existentUser.password);

  if (!result) {
    return res.status(403).send("403 Forbidden: Invalid password");
  }

  //Creates user_id cookie
  req.session.user_id = existentUser.id;
  res.redirect("/urls");
});

//READ

//Renders template for creating new shortURLs
app.get("/urls/new", (req, res) => {
  const user = getUserByID(req.session.user_id, users);
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
  const user = getUserByID(req.session.user_id, users);
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
  const user = getUserByID(req.session.user_id, users);
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
  const shortURL = getShortURL(req.params.id, urlDatabase);
  const user = getUserByID(req.session.user_id, users);
  const urls = urlsForUser(req.session.user_id, urlDatabase);
  
  if (!shortURL) {
    return res.status(404).send("404 Not Found: shortURL does not exist");
  }
  
  if (!user) {
    return res.status(403).send("403 Forbidden: Please login in to view shortURL info");
  }

  if (!urls[req.params.id]) {
    return res.status(403).send("403 Forbidden: Current user access denied");
  }

  const templateVars = {
    user,
    id: shortURL,
    longURL: urls[req.params.id].longURL
  };
  return res.render("urls_show", templateVars);
});

//Redirects user to longURL stored in shortURL
app.get("/u/:id", (req, res) => {
  const id = getShortURL(req.params.id, urlDatabase);
  if (!id) {
    return res.status(404).send("404 Not Found: shortURL does not exist");
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//EDIT

//Updates shortURL:longURL pair in urlDatabase. First check whether shortURL exists, user is logged, and if logged in user is owner of shortURL
app.post("/urls/:id", (req, res) => {
  const shortURL = getShortURL(req.params.id, urlDatabase);
  const user = getUserByID(req.session.user_id, users);
  const urls = urlsForUser(req.session.user_id, urlDatabase);

  if (!shortURL) {
    return res.status(404).send("404 Not Found: shortURL does not exist");
  }

  if (!user) {
    return res.status(401).send("401 Unauthorized: Please sign in to edit shortURL");
  }

  if (!urls[req.params.id]) {
    return res.status(403).send("403 Forbidden: Do not have access to edit shortURL");
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

//DELETE

//Deletes shortURL:longURL from urlDatabase. First check whether shortURL exists, user is logged, and if logged in user is owner of shortURL
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = getShortURL(req.params.id, urlDatabase);
  const user = getUserByID(req.session.user_id, users);
  const urls = urlsForUser(req.session.user_id, urlDatabase);

  if (!shortURL) {
    return res.status(404).send("404 Not Found: shortURL does not exist");
  }

  if (!user) {
    return res.status(401).send("401 Unauthorized: Please sign in to delete shortURL");
  }

  if (!urls[req.params.id]) {
    return res.status(403).send("403 Forbidden: Do not have permission to delete shortURL");
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//Clears session cookie 
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//TURN THE SERVER ON

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});