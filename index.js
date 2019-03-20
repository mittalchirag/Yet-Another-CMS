var express = require("express");
var morgan = require("morgan");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var router = express.Router();
var app = express();
var appRoutes = require("./app/routes/api")(router);
var path = require("path");

app.use(morgan("dev"));
app.use(bodyParser.json()); // for parsing application/json
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(
  bodyParser.urlencoded({
    extended: true
  })
); // for parsing application/x-www-form-urlencoded

app.use(express.static(__dirname + "/public")); // GET /style.css etc
app.use("/api", appRoutes);
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "chirag@123",
  database: "CMS",
  insecureAuth: true
});

connection.connect(function(err) {
  if (!err) {
    console.log("Database is connected ... \n\n");
  } else {
    console.log("Error connecting database ... \n\n" + err);
  }
});
connection.query("select * from Court Natural JOIN CourtGames", (err, rows) => {
  if (err) throw err;
  console.log(rows);
});
app.listen(3000, function () {
    console.log('Listening on port 3000');
});

module.exports = app;
