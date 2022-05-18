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

// View a URL
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

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});