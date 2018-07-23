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
 * @param {object} user_id
 * TODO possibly the user id is enough and each route will handle it's 
 * own database call to save latency
 */
passport.deserializeUser(function (user_id, done) {
   done(null, user_id);
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

        const queryString = "SELECT id, password FROM users WHERE ?";
        db.query(queryString, { username }, function (err, result, fields) {

            if (err) {
                return done(err)
            };

            if (result.length === 0) {
                return done(null, false, "User not found");
            };

            const hash = result[0].password.toString();
            bcrypt.compare(password, hash, function (err, response) {
                if (err) throw err;

                if (response === true) {
                    return done(null, { user_id: result[0].id });
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
    
    const { email } = req.body;

    // // Encryption
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            return next(err);
        };

        const queryString = "INSERT INTO users SET ?;";
        const mode = { username, email, password: hash };
        db.query(queryString, mode, (err, data, fields) => {

            if (err) {
                // TODO handle duplicate username/email error
                console.log("Error Code", err.code);
                console.log("Sql Message", err.sqlMessage);
                return done("register", null, { title: err.sqlMessage });
            };

            db.query("SELECT LAST_INSERT_ID() as user_id", (error, user_id, fields) => {
                if (error) { 
                    return done(error);
                };

                return done(null, user_id);
            });
        });
    });
}));