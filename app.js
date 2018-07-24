require('dotenv').config();
const express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    mongoose = require("mongoose"),
    app = express(),
    isproduction = process.env.NODE_ENV === "production";

//Authentication packages
const passport = require("passport"),
    session = require('express-session');

//Authentication routes and database connections
const passportRoutes = require('./routes/passport.js'),
    users = require('./routes/users'),
    MongoStore = require('connect-mongo')(session);
require("./models/Users.js");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configure Mongo Database
mongoose.promise = global.promise;
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/passport-tutorial", { useNewUrlParser: true });
if(!isproduction) mongoose.set('debug', true);

/**
 * Session cookies are created on the client side
 * Resave cookies will be saved on the server
 * Store session table from the server
 * saveUninitialized creates a cookie on the user on page load
 * TouchAfter will only update session one time in 24 hour period.
 */
//Middleware for passport 
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false, // don't create session until something stored
    resave: false, //don't save session if unmodified
    store: new MongoStore({ 
        mongooseConnection: mongoose.connection,
        ttl: 24 * 60 * 60, //24 hours cookie storage
        touchAfter: 24 * 3600 // time period in seconds
    })
}));
app.use(passport.initialize());
app.use(passport.session());

//isAuthenticated is passed through every view
//used for handlebars currently
app.use(function (req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

app.use('/', passportRoutes);
app.use('/', users);

require("./services/passport.js");

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/**
 * All next(err) arrive here to be handled by express
 * Stack errors and messages are rendered in the Errors.hbs
 */
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


// Handlebars default config
const hbs = require('hbs');
const fs = require('fs');

const partialsDir = __dirname + '/views/partials';

const filenames = fs.readdirSync(partialsDir);

filenames.forEach(function (filename) {
    const matches = /^([^.]+).hbs$/.exec(filename);
    if (!matches) {
        return;
    }
    const name = matches[1];
    const template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
    hbs.registerPartial(name, template);
});

hbs.registerHelper('json', function (context) {
    return JSON.stringify(context, null, 2);
});


module.exports = app;
