const router = require("express").Router();
const flash = require("connect-flash");
const passport = require("passport");
const path = require("path");
router.use(flash());

// As with any middleware it is quintessential to call next()
// if the user is authenticated
const isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
};

/* GET login page. */
router.get("/", function(req, res) {
  // res.render("index", { message: req.flash("message") });
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

/* Handle Login POST */
router.post(
  "/login",
  passport.authenticate("login", {
    successRedirect: "/home",
    failureRedirect: "/",
    failureFlash: true
  })
);

/* GET Registration Page */
router.get("/signup", function(req, res) {
  res.render("signup", { message: req.flash("message") });
});

/* Handle Registration POST */
router.post(
  "/signup",
  passport.authenticate("signup", {
    successRedirect: "/home",
    failureRedirect: "/signup",
    failureFlash: true
  })
);

router.get("/signout", function(req, res) {
  req.logout();
  res.redirect("/");
});

/* GET Home Page */
router.get("/home", isAuthenticated, function(req, res) {
  console.log(req.user);
  res.render("home", { user: req.user });
});

router.get("/ice-cream", isAuthenticated, (req, res, next) => {
    const car = {
        make: "honda",
        model: "civic",
        year: "2015",
        miles: 130000,
        isDrivable: true,
    }
    res.json(car);
});

module.exports = router;
