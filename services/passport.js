/**
 * Passport middleware for login and register
 * MySQL connection is made to sync user's session in session's table
 * Client is given a cookie to match up with server's client session
 * Serialize client's cookie when stored in the browser
 * Deserialize User when called are being made from the client the server
 */

const LocalStrategy = require("passport-local").Strategy
bcrypt = require("bcrypt"),
    passport = require("passport"),
    saltRounds = 10,
    mongoose = require("mongoose"),
    Users = mongoose.model("Users");

/**
 * Serialize user fires after a cookie/session has been created 
 * in the session's table.
 * The cookie get serialized and stored in the browser
 * @param {object} user_id
 */
passport.serializeUser(function (user_id, done) {
    done(null, user_id);
});

/**
 * Deserialize user fires when the browser makes calls to routes
 * Req.user is then created from this step
 * A database call is made to grab all the user's data
 * TODO possibly the user id is enough and each route will handle it's 
 * own database call to save latency
 * Currently Deserialize user must call back to the database because
 * The user is only given their ID to be serialize 
 * @param {object} user_id given to server by req.login() from user in their cookie
 */
passport.deserializeUser(function (user_id, done) {
    
    Users.findOne({ "_id": user_id }, function(err, user){
        if(err){
            return done(err);
        };
        done(null, user);
    });
});

/**
 * Local Strategy is created to pass bcrypt compare
 * Browser must submit form field name's as username and passport
 * Login parameters is checked against the database for matched
 * done(err, user, info) in routes/passport.js
 * @param { string } username
 * @param { string } password
 */
passport.use("login", new LocalStrategy(
    (username, password, done) => {

        // check in mongo if a user with username exists or not
        Users.findOne({ 'username': username },
            function (err, user) {
                // In case of any error, return using the done method
                if (err) {
                    return done(err)
                };

                // Username does not exist, log error & redirect back
                if (!user) {
                    return done(null, false, "User not found");
                };

                const hash = user.password.toString();
                bcrypt.compare(password, hash, function (err, response) {
                    if (err) throw err;

                    if (response === true) {
                        return done(null, user._id);
                    } else {
                        return done(null, false, "Password does not match");
                    }
                });
            });
    }
));

/**
 * Register new users to sight. 
 * Request body passed back to receive other information 
 * User is created with all the profile's 
 */
passport.use("register", new LocalStrategy({
    passReqToCallback: true,
}, (req, username, password, done) => {

    const { body: { email } } = req;

    findOrCreateUser = function () {
        // // Encryption
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                return next(err);
            };

            // check in mongo if a user with username exists or not
            Users.findOne({ 'username': username },
                function (err, user) {

                    if (err) {
                        return done(err);
                    };

                    if (user) {
                        return done(null, false, "'User Already Exists");
                    }

                    const newUser = new Users();
                    newUser.username = username;
                    newUser.password = hash;
                    newUser.email = email;

                    newUser.save(function (err) {
                        if (err) {
                            return done(err)
                        }
                        return done(null, newUser._id);
                    });
               });
        });
    };
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
}));