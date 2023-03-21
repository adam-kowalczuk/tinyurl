const express = require("express");
const app = express();
const PORT = 8080;

function generateRandomString() { //Creates a random 6-character string to be used as a shortURL
  return (Math.random() + 1).toString(36).substring(6);
};

app.set("view engine", "ejs"); //Tells Express to use EJS as it's templating engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

//MIDDLEWARE

app.use(express.urlencoded({ extended: true })); //Express library's body parsing middleware to make the POST request body human readable

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// })

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// })

//BROWSE

app.get("/urls", (req, res) => { //A list of created shortURLs with corresponding longURLS (homepage);
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//ADD

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL; //Add generated-id:longURL pair to urlDatabase;
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`)
});

//READ

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//EDIT

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL; //Update id:longURL pair in urlDatabase;
  console.log(urlDatabase);
  res.redirect(`/urls`)
});


//DELETE

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});