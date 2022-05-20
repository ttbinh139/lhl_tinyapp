//const { response } = require("express");
// Load constant, dummy database and helper
require('./constant');
const { urlDatabases, userDatabases } = require('./dummyData');
const { generateRandomString, checkExistedEmail, checkValidUser, findUrlsByUserID, findUserEmailFromID } = require('./helper');

const bcrypt = require('bcryptjs');

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// Init cookie session
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// Set template engine
app.set('view engine', 'ejs');

/**
 * GET
 * View homepage
 * If logged in user -> redirect to view all urls
 * If not logged in user -> redirect to login page
 */
app.get('/', (request, response) => {
  // Get userID from cookie
  const userID = request.session.userID;
  console.log(userID);
  // Check if user logged in
  if (userID !== null) {
    // Redirect to /urls
    response.redirect("/urls");
  } else {
    // Redirect to login page
    response.redirect("/login");
  }
});

/**
 * GET
 * View all user's urls
 * Only logged in user can access
 * If user is not logged in: display error message
 */
app.get('/urls', (request, response) => {
  // Get userID from cookie
  const userID = request.session.userID;
  const userEmail = findUserEmailFromID(userID, userDatabases);

  // If cookie contain userID
  if (userID !== null) {
    // Get list of urls belongs to user
    const listUrls = findUrlsByUserID(userID, urlDatabases);

    // Init template variables to pass to emplate engine
    const templateVars = {
      userEmail: userEmail
    };
    const urls = { urls: listUrls, templateVars: templateVars };
    // Render index.ejs with template variables
    response.render("pages/index.ejs", urls);
  }
});

/**
 * GET
 * Logged in user can view his's specific url
 * Logged in user can edit url at the same page
 * Not logged user: can view, cannot edit.
 */
app.get("/urls/:shortURL", (request, response) => {
  // Get userID from cookie
  const userID = request.session.userID;
  const userEmail = findUserEmailFromID(userID, userDatabases);

  // Init template variables to pass to emplate engine
  // Template variable contain username get from cookie
  const templateVars = {
    userEmail: userEmail
  };
  const url = {
    shortURL: request.params.shortURL,
    longURL: urlDatabases[request.params.shortURL],
    templateVars: templateVars
  };

  // Call render page with template variables
  response.render("pages/urls_show", url);
});

/**
 * GET
 * Logged user can creat new shorten url
 * Not logged in user -> redirect to login page
 */
app.get('/new', (request, response) => {
  // Get userID from cookie
  const userID = request.session.userID;
  const userEmail = findUserEmailFromID(userID, userDatabases);
  // If has userID
  if (userID != null) {
    // Init template variables with userID from cookie
    const templateVars = {
      userEmail: userEmail//;request.cookies["userID"]
    };
    response.render("pages/new", { templateVars });
  } else {
    // Redirect to login page
    response.redirect("/login");
  }
});

/**
 * POST - Handle create new shorten URL submitted form
 * If logged in user -> create new shorten url
 * If not logged in user -> Send error messages
 */
app.post("/new", (request, response) => {
  // Get userID from cookie
  const userID = request.session.userID;
  if (userID != null) {
    // Generate random string for short URL
    const randomString = generateRandomString(6);
    const creationDate = new Date().toDateString();
    // Create new URL object
    const newUrl = {
      longURL: request.body.longURL,
      userID: userID,
      creationDate: creationDate,
      numberOfVisits: 0,
      numberOfUniqueVisits: 0
    }
    // Add new URL object to urlDatabase
    urlDatabases[randomString] = newUrl;
    // Redirect to view URL page
    response.redirect(`/urls/${randomString}`);
  } else {
    // Send error message
    return response.sendStatus(400);
  }
});

/**
 * POST - handle edit URL submitted form
 * If logged in user -> update url and redirect to homepage.
 * If not logged in user -> Send error messages
 */
app.post("/update/:shortURL", (request, response) => {
  // Get userID from cookie
  const userID = request.session.userID;;
  if (userID != null) {
    // Get shortURL from request form
    const shortURL = request.params.shortURL;
    // Get longURL from request form
    const longURL = request.body.longURL;
    // Update longURL to shorten URL 
    urlDatabases[shortURL]["longURL"] = longURL;
    // Redirect to homepage
    response.redirect("/");
  } else {
    // Send error message
    response.sendStatus(400);
  }

});

/**
 * GET -> hande redirection when user visit shorten URL
 */
app.get("/u/:shortURL", (request, response) => {
  // Get longURL from urlDatabses
  console.log(urlDatabases);
  const longUrl = urlDatabases[request.params.shortURL]["longURL"];
  if (longUrl !== undefined) {
    // Update number of visit for this specific short url
    urlDatabases[request.params.shortURL]["numberOfVisits"]++;

    // Increase number of unique visits if doesn't have cookie visited.
    const visited = request.session.visited;
    if (visited !== 1) {
      urlDatabases[request.params.shortURL]["numberOfUniqueVisits"]++;

      // Set cookie for unique visit
      request.session.visited = 1;
    }

    // Redirect to longURL
    response.redirect(longUrl);
  } else {
    // Return to view shortURL page -> will display error message if shortURL doesn't existed.
    response.redirect(`/urls/${request.params.shortURL}`);
  }
});

/**
 * POST -> handle delete url submitted form
 * If logged in user -> delete his/her shorten URL
 * If not logged in user -> send error message
 */
app.post("/urls/:shortURL/delete", (request, response) => {
  // Get userID from cookie
  const userID = request.session.userID;
  // If existed userID in cookie
  if (userID != null) {
    // Get shortURL from request paramerters
    const shortURL = request.params.shortURL;

    // Check if the shorten URL belongs to logged in user
    if (urlDatabases[shortURL]["userID"] === userID) {
      // Delete shortURL from urlDatabases
      delete urlDatabases[shortURL];
      // Redirect to homepages
      response.redirect("/");
    } else {
      // Send back bad request status code
      return response.sendStatus(400);  
    }
  } else {
    // Send back bad request status code
    return response.sendStatus(400);
  }
});

// About pages
app.get('/about', (request, response) => {
  response.render("pages/about");
});

/**
 * GET -> handle login page
 */
app.get('/login', (request, response) => {

  // Init template variables contain username and error message from cookie
  const templateVars = {
    userEmail: request.session.userID,
    error: request.session.error
  };
  // Clear error message from cookie
  request.session.error = null;
  // Render login page with template variables
  response.render('pages/login', { templateVars });
});

/**
 * POST: handle submitted login form
 * If logging in successful -> redirect to homepage
 * If error -> display error messages
 */
app.post('/login', (request, response) => {
  // Define a variable for store error message
  let errorMessage = "";

  // Check email is empty
  if (request.body.email === "") {
    errorMessage = MESSAGE_EMAIL_EMPTY;
  }

  // Check password is empty
  if (request.body.password === "") {
    errorMessage = MESSAGE_PASSWORD_EMPTY;
  }

  // Check valid user information
  let userID = false;
  if (request.body.email !== "" && request.body.password !== "") {
    // Check user is valid
    userID = checkValidUser(request.body.email, request.body.password, userDatabases, bcrypt);
    if (userID === false) {
      errorMessage = MESSAGE_INCORRECT_LOGIN_DETAILS;
    }
  }
  // If has error, redirect back to login page and display message
  if (errorMessage !== "") {
    // Set error message to cookie
    request.session.error = errorMessage;
    // Redirect back to login page
    response.redirect('/login');
  } else {
    // Login successfull, set userID to cookie
    request.session.userID = userID;
    // Redirect to homepage
    response.redirect("/");
  }
});

/**
 * POST: handle logout
 */
app.post("/logout", (request, response) => {
  // Clear userID in cookie
  request.session.userID = null;
  // Redirect to homepage
  response.redirect("/");
});

/**
 * GET - render register form and display error message if has
 */
app.get("/register", (request, response) => {
  // Init template variables with username and error message in order to display if has some errors.
  const templateVars = {
    userEmail: request.session.userID,
    error: request.session.error
  };
  // Clear error message from cookie
  request.session.error = null;
  // Render register page
  response.render("pages/register", { templateVars })
});

/**
 * POST: handle register submitted form
 * If register successfull, redirect to login page
 * If not success: redirect back to register form with error messages
 */
app.post("/register", (request, response) => {
  // Declare varable errorMessage to store error messages
  let errorMessage = "";

  // Check email is empty
  if (request.body.email === "") {
    errorMessage = MESSAGE_EMAIL_EMPTY;
  }

  // Check password is empty
  if (request.body.password === "") {
    errorMessage = MESSAGE_PASSWORD_EMPTY;
  }

  // Check if email existed
  if (checkExistedEmail(request.body.email, userDatabases) === true) {
    errorMessage = MESSAGE_EMAIL_EXISTED;
  }

  // If has error messages
  if (errorMessage !== "") {
    // Set error message to cookie
    request.session.error = errorMessage;
    // Redirect back to register form
    response.redirect('/register');
  }
  // If not error
  // Generate userID by call function generateRandomString
  const newUserID = generateRandomString(6);

  // Hashing password
  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(request.body.password, salt);

  // Create new user object
  const newUserObj = {
    id: newUserID,
    email: request.body.email,
    password: hashPassword
  };
  // Add new user object to user database
  userDatabases[newUserID] = newUserObj;

  // Redirect to login page
  response.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});