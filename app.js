var path = require('path');
var logger = require('morgan');
var express = require('express');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');

require('dotenv').config({path: "./.env"})

const options = require("./knexfile.js");
const knex = require("knex")(options);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger documentation 
app.use('/', swaggerUI.serve)
app.get('/', swaggerUI.setup(swaggerDocument))

app.use((req, res, next) => {
  req.db = knex;
  next();
});

app.use('/', indexRouter);
app.use('/user', usersRouter);

app.get("/knex", function (req, res, next) {
  req.db.raw("SELECT VERSION()")
    .then((version) => console.log(version[0][0]))
    .catch((err) => {
      console.log(err);
      throw err;
    });

  res.send("Version Logged successfully");
});

app.get('/me', (req, res, next) => {
  res.status(200).json({
    "name": "Ken Marithe Higuit Matahom",
    "student_number": "n11373695"
  })
});

// catch 404
app.use(function(req, res, next) {
  res.status(404).json({
    error: true,
    message: "Page not found!"
  })
});

module.exports = app;
