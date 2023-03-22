const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs"); //Tells Express to use EJS as it's templating engine

//GLOBAL FUNCTIONS

function generateRandomString() { //Creates a random 6-character string to be used as a shortURL
  return (Math.random() + 1).toString(36).substring(6);
};

const getUserByEmail = function(newEmail) {
  for (const user in users) {
    if (users[user].email === newEmail) {
      return users[user];
    }
  }
  return null;
};

//GLOBAL OBJECTS

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
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

//MIDDLEWARE

app.use(express.urlencoded({ extended: true })); //Express library's body parsing middleware to make the POST request body human readable
app.use(cookieParser()); //Populates req.cookie
app.use(morgan("dev")); //Prints dev updates to server

//BROWSE

app.get("/urls", (req, res) => { //A list of generated shortURLs with corresponding longURLS (homepage);
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//ADD

app.post("/urls", (req, res) => { //Adds generated-id:longURL pair to urlDatabase
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
});

app.post("/login", (req, res) => { //Creates coookie from user login submission
  res.cookie("username", `${req.body.username}`);
  console.log(`User ${req.body.username} logged in!`);
  res.redirect("/urls");
});

app.post("/register", (req, res) => { //Creates object of user info (id, email, password) and adds it users database
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const existentUser = getUserByEmail(email);

  if (!email || !password) {
    return res.status(400).send("Please provide an email and a password");
  }

  if (existentUser) {
    res.status(400).send("Email unavailable");
  }

  let user = {
    id,
    email,
    password
  };

  users[id] = user;

  res.cookie("user_id", id); //Creates user_id cookie

  res.redirect("/urls");
});

//READ

app.get("/urls/new", (req, res) => { //Renders template for creating new shortURLs
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => { //Renders template for registering a new user
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("register", templateVars);
});

app.get("/urls/:id", (req, res) => { //Renders template showing information for particular shortURL
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => { //Redirects user to longURL stored in shortURL
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//EDIT

app.post("/urls/:id", (req, res) => { //Updates id:longURL pair in urlDatabase
  urlDatabase[req.params.id] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls`);
});


//DELETE

app.post("/urls/:id/delete", (req, res) => { //Deletes shortURL:longURL from urlDatabase
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => { //Clears login cookie 
  res.clearCookie("username");
  res.redirect("/urls");
});

//LISTEN

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});