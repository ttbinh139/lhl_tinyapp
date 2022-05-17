const { response } = require("express");
const { generateRandomString } = require('./helper');

const express = require("express");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

let urlDatabases = {
  '1a2b3c' : "https://www.lighthouselabs.ca",
  '2b3c4d' : "https:///www.google.ca"
}

// Set template engine
app.set('view engine', 'ejs');

// Routing index page
app.get('/', (request, response) => {
  const urls = {urls: urlDatabases};
  response.render("pages/index.ejs", urls);
});

app.get('/urls', (request, response) => {
  const urls = {urls: urlDatabases};
  response.render("pages/index.ejs", urls);
});

app.get("/urls/:shortURL", (request, response) => {
  const url = { shortURL: request.params.shortURL, longURL: urlDatabases[request.params.shortURL] };
  response.render("pages/urls_show", url);
});

// Create new url
app.get('/new', (request, response) => {
  response.render("pages/new");
});

app.post("/new", (request, response) => {
  const randomString = generateRandomString(6);
  urlDatabases[randomString] = request.body.longURL;
  response.redirect(`/urls/${randomString}`);
});

app.get("/u/:shortURL", (request, response) => {
  console.log(urlDatabases);
  const longUrl = urlDatabases[request.params.shortURL];
  response.redirect(longUrl);
})

// About pages
app.get('/about', (request, response) => {
  response.render("pages/about");
});

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});