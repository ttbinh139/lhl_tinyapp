/**
 * Helper functions
 */

/**
 * Generate a random string with length as input
 * @param {*} length : The length of random string that you want to generate.
 * @returns 
 */
const generateRandomString = function(length = 6) {
  let result = '';
  // characters: list of all normal number and characters that use for generate random string function
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

  // lengh of characters
  const charactersLength = characters.length;

  // Loop from zero to length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

/**
 * Check email existed in user database
 * @param {*} email string represent email input
 * @param {*} userDatabases
 * @returns true if email existed in database, false otherswise
 */
const checkExistedEmail = function(email, userDatabases) {
  // Loop through user database
  for (const idx in userDatabases) {

    // Compare user's email vs input email
    if (userDatabases[idx]["email"] === email) {
      return true;
    }
  }
  return false;
};

/**
 * Check valid user
 * @param {*} email string represent user's email
 * @param {*} password string represent user's password
 * @param {*} userDatabases object user database
 * @param {*} bcrypt instance of bcryptjs
 * @returns false if user is invalid, user id if valid
 */
const checkValidUser = function(email, password, userDatabases, bcrypt) {
  // Loop through user database
  for (const idx in userDatabases) {

    // Get hahsed password in user database
    let hashPassword = userDatabases[idx]["password"];

    // Compare user's email vs input email and call compare hashed password vs input password of bcrypt
    if (userDatabases[idx]["email"] === email && bcrypt.compareSync(password, hashPassword) === true) {
      return idx;
    }
  }
  return false;
};

/**
 * Find a list of URLs of specific user
 * @param {*} userID id of user
 * @param {*} urlDatabases url database
 * @returns an object contain all urls belongs to user
 */
const findUrlsByUserID = function (userID, urlDatabases) {
  let urlResults = {};
  
  //Loop through object urlDatases
  for (const idx in urlDatabases) {
    let url = urlDatabases[idx];

    // Check if user own url equal userID
    if (url["userID"] === userID) {
      // Add url to the result list
      urlResults[idx] = url;
    }
  }
  return urlResults;
};

const findUserEmailFromID = function(userID, userDatabases) {
  if (userDatabases[userID]) {
    return userDatabases[userID]["email"];
  }
  return undefined;
}

// Export all helper functions
module.exports = { generateRandomString, checkExistedEmail, checkValidUser, findUrlsByUserID, findUserEmailFromID };
