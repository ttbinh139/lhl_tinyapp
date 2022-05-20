const { response } = require("express");
const { generateRandomString } = require('./helper');

const bcrypt = require('bcryptjs');

const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

/* const cookieParser = require("cookie-parser");
app.use(cookieParser()); */

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const urlDatabases = {
  '1a2b3c': {
    longURL: "https://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  '2b3c4d': {
    longURL: "https:///www.google.ca",
    userID: "user2RandomID"
  },
  '2b3c4e': {
    longURL: "https:///www.cbc.ca",
    userID: "user2RandomID"
  },
  '2b3c4f': {
    longURL: "https:///bbc.co.uk",
    userID: "user2RandomID"
  }
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
};

const checkExistedEmail = function (email) {
  for (const idx in users) {
    if (users[idx]["email"] === email) {
      return true;
    }
  }
  return false;
};

const checkValidUser = function (email, password) {
  for (const idx in users) {
    let hashPassword = users[idx]["password"];
    if (users[idx]["email"] === email && bcrypt.compareSync(password, hashPassword) === true) {
      // console.log("valid");
      return idx;
    }
  }
  return false;
};

const findUrlsByUserID = function (userID) {
  let urls = {};
  for (const idx in urlDatabases) {
    let url = urlDatabases[idx];
    if (url["userID"] === userID) {
      urls[idx] = url;
    }
  }
  return urls;
};


// Set template engine
app.set('view engine', 'ejs');

// Routing index page
app.get('/', (request, response) => {
  console.log("Read userID from cookie");
  const userID = request.session.userID;
  // Check if user loggin
  if (userID !== undefined) {
    response.redirect("/urls");
  } else {
    response.redirect("/login");
  }
});

app.get('/urls', (request, response) => {
  const userID = request.session.userID;
  if (userID !== null) {
    const listUrls = findUrlsByUserID(userID);
    const templateVars = {
      username: userID
    };
    const urls = { urls: listUrls, templateVars: templateVars };
    response.render("pages/index.ejs", urls);
  }
});

// View a URL
app.get("/urls/:shortURL", (request, response) => {
  const templateVars = {
    username: request.session.userID //request.cookies["userID"]
  };
  const url = { shortURL: request.params.shortURL, longURL: urlDatabases[request.params.shortURL], templateVars: templateVars };
  response.render("pages/urls_show", url);
});

// Create new url
app.get('/new', (request, response) => {
  const userID = request.session.userID;
  const templateVars = {
    username:  userID//;request.cookies["userID"]
  };
  
  if (userID != null) {
    response.render("pages/new", { templateVars });
  } else {
    response.redirect("/login");
  }
});

app.post("/new", (request, response) => {
  const userID = request.session.userID;;
  if (userID != null) {
    const randomString = generateRandomString(6);
    const newUrl = {
      longURL: request.body.longURL,
      userID: userID
    }
    urlDatabases[randomString] = newUrl;
    response.redirect(`/urls/${randomString}`/* , {templateVars} */);
  } else {
    response.sendStatus(400);
  }
});

// Update URL
app.post("/update/:shortURL", (request, response) => {
  const userID = request.session.userID;;
  if (userID != null) {
    const shortURL = request.params.shortURL;
    const longURL = request.body.longURL;
    urlDatabases[shortURL]["longURL"] = longURL;
    response.redirect("/");
  } else {
    response.sendStatus(400);
  }

});

// Redirec URL
app.get("/u/:shortURL", (request, response) => {
  const longUrl = urlDatabases[request.params.shortURL]["longURL"];
  if (longUrl !== undefined) {
    response.redirect(longUrl);
  } else {
    //response.cookie("error", "LongURL not found")
    response.redirect(`/urls/${request.params.shortURL}`);
  }
});

// Delete URL
app.post("/urls/:shortURL/delete", (request, response) => {
  //const userID = request.cookies["userID"];
  const userID = request.session.userID;
  if (userID != null) {
    const shortURL = request.params.shortURL;
    //response.send(shortURL);
    delete urlDatabases[shortURL];
    response.redirect("/");
  } else {
    response.sendStatus(400);
  }
});

// About pages
app.get('/about', (request, response) => {
  response.render("pages/about");
});

// Login pages
app.get('/login', (request, response) => {
  //console.log("Login page:", request.session);
  const templateVars = {
    username: request.session.userID, //;request.cookies["userID"],
    error: request.session.error
  };
  //console.log("Login page: ", templateVars);
  request.session.error = null;
  response.render('pages/login', { templateVars });
});

app.post('/login', (request, response) => {
  let errorMessage = "";
  // Check email is empty
  if (request.body.email === "") {
    errorMessage += "Email cannot be empty\n";
  }
  // Check password is empty
  if (request.body.password === "") {
    errorMessage += "Password cannot be empty";
  }
  // Check valid user information
  let userID = false;
  if (request.body.email !== "" && request.body.password !== "") {
    userID = checkValidUser(request.body.email, request.body.password);
    //response.send(userID);
    if (userID === false) {
      errorMessage += "Incorrect login details";
    }
  }
  if (errorMessage !== "") {
    request.session.error = errorMessage;
    response.redirect('/login');
  } else {
    request.session.userID = userID;
    response.redirect("/");
  }
});

app.post("/logout", (request, response) => {
  request.session = null
  response.redirect("/");
});

app.get("/register", (request, response) => {
  const templateVars = {
    username: request.session.userID,
    error: request.session.error
  };
  request.session.error = null;
  response.render("pages/register", { templateVars })
});

app.post("/register", (request, response) => {
  let errorMessage = "";

  // Check email is empty
  if (request.body.email === "") {
    errorMessage += "Email cannot be empty\n";
  }
  // Check password is empty
  if (request.body.password === "") {
    errorMessage += "Password cannot be empty";
  }

  // Check if email existed
  if (checkExistedEmail(request.body.email) === true) {
    errorMessage += "Email existed, please choose other email";
  }
  if (errorMessage !== "") {
    request.session.error = errorMessage;
    response.redirect('/register');
  }
  const newUserID = generateRandomString(6);

  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(request.body.password, salt);
  const newUserObj = {
    id: newUserID,
    email: request.body.email,
    password: hashPassword
  };

  users[newUserID] = newUserObj;
  response.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});