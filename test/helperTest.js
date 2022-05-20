const assert = require('chai').assert;

const { checkExistedEmail, findUrlsByUserID, findUserEmailFromID } = require('../helper');

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


describe("#checkExistedEmail", () => {
  it("#checkExistedEmail return true if email existed", () => {
    const testedEmail = "user@example.com";
    assert.isTrue(checkExistedEmail(testedEmail, userDatabases));
  });

  it("#checkExistedEmail return false if email doesn't existed", () => {
    const testedEmail = "user45@example.com";
    assert.isFalse(checkExistedEmail(testedEmail, userDatabases));
  });
});

describe("#findUrlsByUserID", () => {
  it("#findUrlsByUserID return empty if user doesn't have any shorten url", () => {
    const userID = "anyUser";
    assert.isEmpty(findUrlsByUserID(userID, urlDatabases));
  });

  it("#findUrlsByUserID return lsit of shorten urls belongs to userID", () => {
    const userID = "userRandomID";
    const url = {
      '1a2b3c': {
      longURL: "https://www.lighthouselabs.ca",
      userID: "userRandomID"
    }};
    assert.deepEqual(findUrlsByUserID(userID, urlDatabases), url);
  });
});

describe("#findUserEmailFromID", () => {
  it("#findUserEmailFromID return undefined if userID doesn't existed", () => {
    const userID = "anyUser";
    assert.isUndefined(findUserEmailFromID(userID, urlDatabases));
  });

  it("#findUserEmailFromID return email belongs to userID", () => {
    const userID = "userRandomID";
    assert.deepEqual(findUserEmailFromID(userID, userDatabases), "user@example.com");
  });
});