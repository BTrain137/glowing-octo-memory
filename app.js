var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var LocalStrategy = require('passport-local')
var flash = require("connect-flash");

var app = express();

// Configuring Passport

app.use(flash());

var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}

// Generates hash using bCrypt
var createHash = function(password){
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
 }

var passport = require('passport');
var expressSession = require('express-session');
var index = require('./routes/index')(passport)
const User = require('./models/user')

app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// passport/login.js
passport.use('login', new LocalStrategy({
  passReqToCallback : true
},
function(req, username, password, done) { 
  // check in mongo if a user with username exists or not
  User.findOne({ 'username' :  username }, 
    function(err, user) {
      // In case of any error, return using the done method
      if (err)
        return done(err);
      // Username does not exist, log error & redirect back
      if (!user){
        console.log('User Not Found with username '+username);
        return done(null, false, 
              req.flash('message', 'User Not found.'));                 
      }
      // User exists but wrong password, log the error 
      if (!isValidPassword(user, password)){
        console.log('Invalid Password');
        return done(null, false, 
            req.flash('message', 'Invalid Password'));
      }
      // User and password both match, return user from 
      // done method which will be treated like success
      return done(null, user);
    }
  );
}));

passport.use('signup', new LocalStrategy({
  passReqToCallback : true
},
function(req, username, password, done) {
  findOrCreateUser = function(){
    // find a user in Mongo with provided username
    User.findOne({'username':username},function(err, user) {
      // In case of any error return
      if (err){
        console.log('Error in SignUp: '+err);
        return done(err);
      }
      // already exists
      if (user) {
        console.log('User already exists');
        return done(null, false, 
           req.flash('message','User Already Exists'));
      } else {
        // if there is no user with that email
        // create the user
        var newUser = new User();
        // set the user's local credentials
        newUser.username = username;
        newUser.password = createHash(password);
        newUser.email = req.param('email');
        newUser.firstName = req.param('firstName');
        newUser.lastName = req.param('lastName');

        // save the user
        newUser.save(function(err) {
          if (err){
            console.log('Error in Saving user: '+err);  
            throw err;  
          }
          console.log('User Registration succesful');    
          return done(null, newUser);
        });
      }
    });
  };
   
  // Delay the execution of findOrCreateUser and execute 
  // the method in the next tick of the event loop
  process.nextTick(findOrCreateUser);
}));

//Database set up
let MONGO_URL
const MONGO_LOCAL_URL = require('./db.js')

if (process.env.MONGODB_URI) {
  // heroku 
	mongoose.connect(process.env.MONGODB_URI)
	//MONGO_URL = process.env.MONGODB_URI
} 
else {
  // local mongo url
	mongoose.connect(MONGO_LOCAL_URL.url) 
	//MONGO_URL = MONGO_LOCAL_URL.url
}

const db = mongoose.connection;
db.on("error", error => console.log("Database Error:", error));
db.once("open", () => console.log("Mongoose connection successful."));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// un-comment after placing favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
