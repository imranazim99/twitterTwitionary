var createError = require('http-errors'),
    express = require('express'),
    cookieParser = require('cookie-parser'),
    logger = require('morgan'),
    fileUpload = require('express-fileupload'),
    bodyParser = require('body-parser'),
    path = require('path'),
    session = require('express-session'),
    flash = require('express-flash'),
    env=require('dotenv').config(),
    fs = require('fs'),
    siteRouter = require('./routes/site/routing');
var app = express();
var http = require('http').Server(app);

// Express session
app.use(session({
  secret: "twitterTwitionary112233",
  resave: false,
  saveUninitialized: false,
  cookie  : { maxAge  : 30 * 24 * 60 * 60 * 1000 }
}));
app.use(flash());

app.use(function (req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Tell the bodyparser middleware to accept more data
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Static Files
app.use(express.static('public'));
app.use('/site', express.static(__dirname + 'public/site'))

app.use(express.static(__dirname + '/static'));

app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(fileUpload()); // configure fileupload

// site routes used
app.use(siteRouter)

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// set the app to listen on the port
const port = (process.env.PORT || "3500");
var server = http.listen(port, () => {
    console.log('server is running on port', server.address().port);
  });