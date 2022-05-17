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
  //console.log(url);
  response.render("pages/urls_show", url);
});

// Create new url
app.get('/new', (request, response) => {
  response.render("pages/new");
});

app.post("/new", (request, response) => {
  const randomString = generateRandomString();
  urlDatabases[randomString] = request.body.longURL;
  response.redirect(`/urls/${randomString}`);
  //console.log(request.body);  // Log the POST request body to the console
  //response.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortUrl", (request, response) => {
  const longUrl = urlDatabases[request.params.shortUrl];
  //console.log(longUrl);
  response.redirect(longUrl);
})

// About pages
app.get('/about', (request, response) => {
  response.render("pages/about");
});

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});