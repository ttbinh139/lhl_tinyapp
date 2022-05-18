const { response } = require("express");
const { generateRandomString } = require('./helper');

const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const urlDatabases = {
  '1a2b3c' : "https://www.lighthouselabs.ca",
  '2b3c4d' : "https:///www.google.ca"
};

const users = { 
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
}

// Set template engine
app.set('view engine', 'ejs');

// Routing index page
app.get('/', (request, response) => {
  
  const templateVars = {
    username: request.cookies["userID"]
  };
  const urls = {urls: urlDatabases, templateVars: templateVars};
  response.render("pages/index.ejs", urls);
});

app.get('/urls', (request, response) => {
  const templateVars = {
    username: request.cookies["userID"]
  };
  const urls = {urls: urlDatabases, templateVars: templateVars};
  response.render("pages/index.ejs", urls);
});

// View a URL
app.get("/urls/:shortURL", (request, response) => {
  const templateVars = {
    username: request.cookies["userID"]
  };
  const url = { shortURL: request.params.shortURL, longURL: urlDatabases[request.params.shortURL], templateVars: templateVars };
  response.render("pages/urls_show", url);
});

// Create new url
app.get('/new', (request, response) => {
  const templateVars = {
    username: request.cookies["userID"]
  };
  response.render("pages/new", {templateVars});
});

app.post("/new", (request, response) => {
  /* const templateVars = {
    username: request.cookies["username"]
  }; */
  const randomString = generateRandomString(6);
  urlDatabases[randomString] = request.body.longURL;
  response.redirect(`/urls/${randomString}`/* , {templateVars} */);
});

// Update URL
app.post("/update/:shortURL", (request, response) => {
  //response.send(request.body.longURL);
  const shortURL = request.params.shortURL;
  const longURL = request.body.longURL;
  urlDatabases[shortURL] = longURL;
  //response.send(urlDatabases);
  response.redirect("/");
});

// Redirec URL
app.get("/u/:shortURL", (request, response) => {
  console.log(urlDatabases);
  const longUrl = urlDatabases[request.params.shortURL];
  response.redirect(longUrl);
})

// Delete URL
app.get("/delete/:shortURL", (request, response) => {
  //response.send(request.params);
  const shortURL = request.params.shortURL;
  //response.send(shortURL);
  delete urlDatabases[shortURL];
  response.redirect("/");
});

// About pages
app.get('/about', (request, response) => {
  response.render("pages/about");
});

// Login pages
app.get('/login', (request, response) => {
  const templateVars = {
    username: request.cookies["userID"]
  };
  response.render('pages/login', {templateVars})
});

app.post('/login', (request, response) => {
  const username = request.body.username;
  //response.send(username);
  response.cookie("username", username);
  //response.render('pages/login')
  response.redirect("/");
});

app.post("/logout", (request, response) => {
  response.clearCookie("userID");
  response.redirect("/");
});

app.get("/register", (request, response) => {
  const templateVars = {
    username: request.cookies["userID"]
  };
  response.render("pages/register", {templateVars})
});

app.post("/register", (request, response) => {
  //response.send(request.body);
  const newUserID = generateRandomString(6);
  
  const newUserObj = {
    id: newUserID,
    email: request.body.email,
    password: request.body.password
  };
  
  users[newUserID] = newUserObj;
  //response.send(users);
  response.cookie("userID", newUserID);
  response.redirect("/");
})

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});