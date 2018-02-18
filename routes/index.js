var express = require('express');
var router = express.Router();
var flash = require("connect-flash");
router.use(flash());

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
// module.exports = router;

module.exports = function(passport){

    // As with any middleware it is quintessential to call next()
    // if the user is authenticated
    var isAuthenticated = function (req, res, next) {
      if (req.isAuthenticated())
        return next();
      res.redirect('/');
    }
 
  /* GET login page. */
  router.get('/', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('index', { message: req.flash('message') });
  });
 
  /* Handle Login POST */
  router.post('/login', passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash : true 
  }));
 
  /* GET Registration Page */
  router.get('/signup', function(req, res){
    res.render('signup',{message: req.flash('message')});
  });
 
  /* Handle Registration POST */
  router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/home',
    failureRedirect: '/signup',
    failureFlash : true 
  }));

  router.get('/signout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

    /* GET Home Page */
  router.get('/home', isAuthenticated, function(req, res){
    res.render('home', { user: req.user });
  });
  
 
  return router;
}
