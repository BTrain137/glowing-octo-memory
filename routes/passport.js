/**
 * Passport Routes with custom call back to handle errors
 */
const express = require('express'),
    router = express.Router(),
    passport = require("passport");

/**
 * IsAuthenticated only exist after deserialize passes back a user object
 * @param {object} req Request by the user
 * @param {object} res Response sent to the user
 * @param {Function} next When function is completed the next middleware or parents can occur
 */
const authenticationMiddleWare = function (req, res, next) {
    // console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

router.get("/profile", authenticationMiddleWare, (req, res) => {
    res.render("profile", {
        title: "Profile",
        email: req.user.email,
        username: req.user.username
    });
});

router.get("/login", (req, res) => {
    res.render("login");
});

/**
 * Custom call back function to handle mysql errors
 * And handle not found user or password did not match
 * Request login saves the user into a login state
 */
router.post("/login", (req, res, next) => {

    req.checkBody('username', 'Username field cannot be empty.').notEmpty();
    req.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);

    let validateErrors = req.validationErrors();

    if (validateErrors) {
        return res.render("login", {
            title: "Login Error",
            errors: validateErrors
        });
    }

    //Custom callback
    passport.authenticate('login', (err, user_id, info) => {

        if (err) {
            return next(err);
        }

        if (!user_id) {
            return res.render("login", { 
                title: "Login Error",
                errors: info
            });
        }

        req.logIn(user_id, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect("/profile");
        });

    })(req, res, next);
});

/**
 * Logout event to logout express 
 * And removes session storage in session table
 */
router.get("/logout", (req, res) => {
    //logout on express
    req.logout();
    //removes the session in the database
    // req.session.destroy(err => console.log("cannot access session", err));

    res.redirect("/");
});

router.get('/register', (req, res, next) => {
    res.render('register', { title: 'Registration' });
});

/** 
 * Register creates a new user
 * Express-Validator checks for input field and sends the users errors
 * Custom passport call back renders different pages 
 * Errors are handled from passport or MySQL duplicate user or email created
 * TODO handle duplicate key from username or email
*/
router.post("/register", (req, res, next) => {
    const { body: { password } } = req;

    // express validator
    req.checkBody('username', 'Username field cannot be empty.').notEmpty();
    req.checkBody('username', 'Username must be between 4-15 characters long.').len(4, 15);
    req.checkBody('username', 'Username can only contain letters, numbers, or underscores.').matches(/^[A-Za-z0-9_-]+$/, 'i');
    req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
    req.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);
    req.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);
    req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
    req.checkBody('passwordMatch', 'Password must be between 8-100 characters long.').len(8, 100);
    req.checkBody('passwordMatch', 'Passwords do not match, please try again.').equals(password);

    let validateErrors = req.validationErrors();

    if (validateErrors) {
        return res.render("register", {
            title: "Registration Error",
            errors: validateErrors
        });
    }

    //Custom call back
    passport.authenticate("register", (err, user_id, info) => {

        if (err) {
            if (err === "register") {
                return res.render("register", info)
            } else {
                return next(err);
            }
        }

        req.login(user_id, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect("/profile");
        });

    })(req, res, next);
});

module.exports = router;
