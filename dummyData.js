/**
 * Dummmy data for URLs
 * key: unique ID represent shorten URL
 * value: an object including
 *    longURL: the longURL
 *    userID: the ID of user that create this shorten URL
 */
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

/**
 * Dummy Data of users
 * id: unique indentify of each user
 * email: user's email
 * password: password of user, for demo purpose. Password created when user register new account will be hashed.
 */
const userDatabases = {
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

// Export dummy datas
module.exports = {
  userDatabases,
  urlDatabases
}