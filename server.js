const { response } = require("express");
const express = require("express")
const app = express();
const PORT = 8080;
const urlDatabases = {
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

app.get("/urls/:shortURL", (request, response) => {
  const url = { shortURL: request.params.shortURL, longURL: urlDatabases[request.params.shortURL] };
  //console.log(url);
  response.render("pages/urls_show", url);
});

// About pages
app.get('/about', (request, response) => {
  response.render("pages/about");
});

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});