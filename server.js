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
  '1a2b3c' : {
    longURL:  "https://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  '2b3c4d' : {
    longURL: "https:///www.google.ca",
    userID: "user2RandomID"
  },
  '2b3c4e' : {
    longURL: "https:///www.cbc.ca",
    userID: "user2RandomID"
  },
  '2b3c4f' : {
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
}

const checkExistedEmail = function(email) {
  //let result = false;
  for (const idx in users) {
    //console.log(user);
    if (users[idx]["email"] === email) {
      return true;
    }
  }
  return false;
}

const checkValidUser = function(email, password) {
  for (const idx in users) {
    //console.log(user);
    //console.log(email);
    ///console.log(password);
    //console.log("user", users[idx]);
    if (users[idx]["email"] === email && users[idx]["password"] === password) {
     // console.log("valid");
      return idx;
    }
  }
  return false;
}

const findUrlsByUserID = function(userID) {
  let urls = {};
  //console.log("find URLs by userID", urlDatabases);
  for (const idx in urlDatabases) {
    let url = urlDatabases[idx];
    //console.log("find URLs by userID",url);
    if (url["userID"] === userID) {
      urls[idx] = url;
    }
  }

  return urls;
}


// Set template engine
app.set('view engine', 'ejs');

// Routing index page
app.get('/', (request, response) => {
  
  const userID = request.cookies["userID"];
  // Check if user loggin
  if (userID !== undefined) {
    response.redirect("/urls");
  } else {
    response.redirect("/login");
  }
});

app.get('/urls', (request, response) => {
  
  const userID = request.cookies["userID"];
  if (userID !== null) {
    const listUrls = findUrlsByUserID(userID);
    //response.send(urlDatabases);
    //console.log("Click to myurl:", listUrls);
    const templateVars = {
      username: request.cookies["userID"]
    };
    const urls = {urls: listUrls, templateVars: templateVars};
    response.render("pages/index.ejs", urls);
  }
});

// View a URL
app.get("/urls/:shortURL", (request, response) => {
  const templateVars = {
    username: request.cookies["userID"]
  };
  //response.send(urlDatabases);
  //console.log("View URL after created: ", urlDatabases);
  const url = { shortURL: request.params.shortURL, longURL: urlDatabases[request.params.shortURL], templateVars: templateVars };
  response.render("pages/urls_show", url);
});

// Create new url
app.get('/new', (request, response) => {
  const templateVars = {
    username: request.cookies["userID"]
  };
  // check logged user
  const userID = request.cookies["userID"];
  if (userID != null) {
    response.render("pages/new", {templateVars});
  } else {
    response.redirect("/login");
  }
});

app.post("/new", (request, response) => {
  /* const templateVars = {
    username: request.cookies["username"]
  }; */
  const userID = request.cookies["userID"];
  if (userID != null) {
    const randomString = generateRandomString(6);
    const newUrl = {
      longURL: request.body.longURL,
      userID: userID
    }
    urlDatabases[randomString] = newUrl;
    //urlDatabases["userID"] = userID;
    //response.send(urlDatabases);
    //console.log("After created: ", urlDatabases);
    response.redirect(`/urls/${randomString}`/* , {templateVars} */);
  } else {
    response.sendStatus(400);
  }
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
  const longUrl = urlDatabases[request.params.shortURL]["longURL"];
  if (longUrl !== undefined) {
    response.redirect(longUrl);
  } else {
    //response.cookie("error", "LongURL not found")
    response.redirect(`/urls/${request.params.shortURL}`);
  }
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
    username: request.cookies["userID"],
    error: request.cookies["error"]
  };
  response.clearCookie("error");
  //response.clearCookie("username");
  response.render('pages/login', {templateVars});
});

app.post('/login', (request, response) => {
  //const userEmail = request.body.email;
  //const userPassword = request.body.password;
  let errorMessage = "";
  // Check email is empty
  if (request.body.email === "") {
    errorMessage += "Email cannot be empty\n";
  }
  // Check password is empty
  if( request.body.password === "") {
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
    response.cookie("error", errorMessage);
    response.redirect('/login');
  } else {
    //response.send(username);
    response.cookie("userID", userID);
    //response.render('pages/login')
    response.redirect("/");
  }
});

app.post("/logout", (request, response) => {
  response.clearCookie("userID");
  response.clearCookie("error");
  response.redirect("/");
});

app.get("/register", (request, response) => {
  const templateVars = {
    username: request.cookies["userID"],
    error: request.cookies["error"]
  };
  response.clearCookie("error");
  response.render("pages/register", {templateVars})
});

app.post("/register", (request, response) => {
  //response.send(request.body);
  let errorMessage = "";

  // Check email is empty
  if (request.body.email === "") {
    errorMessage += "Email cannot be empty\n";
  }
  // Check password is empty
  if( request.body.password === "") {
    errorMessage += "Password cannot be empty";
  }

  // Check if email existed
  if (checkExistedEmail(request.body.email) === true) {
    errorMessage += "Email existed, please choose other email";
  }
  if (errorMessage !== "") {
    response.cookie("error", errorMessage);
    response.redirect('/register');
  }
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