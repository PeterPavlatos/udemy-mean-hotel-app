var express = require('express');
var app = express();
var path = require('path');

// Define the port to run on
app.set('port', 3000);

// Define some middleware to log requests. Order of app.use() calls matters.
app.use(function(req, res, next) {
  console.log(req.method, req.url);
  next();
});

// Define where the static files are located. An example of middleware.
app.use(express.static(path.join(__dirname, 'public')));

// Define a route for some JSON data
app.get('/json', function(req, res) {
  console.log('GET the json');
  res
    .status(200)
    .json({ "jsonData": true });
});

// Define a route for sending a file
app.get('/file', function(req, res) {
  console.log('GET the file');
  res
    .status(200)
    .sendFile(path.join(__dirname, 'app.js'));
});

// Listen for requests
var server = app.listen(app.get('port'), function() {
  var port = server.address().port;
  console.log('Magic happens on port ' + port);
});

