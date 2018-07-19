const LocalStrategy = require("passport-local").Strategy,
    bcrypt = require("bcrypt"),
    passport = require("passport"),
    db = require("../database/connection.js");

passport.serializeUser(function (user_id, done) {
  console.log("========serializeUser==================");
  done(null, user_id);
});

passport.deserializeUser(function (user_id, done) {
  console.log("========deserializeUser==================");
  done(null, user_id);
});

passport.use("local", new LocalStrategy(
    function (username, password, done) {

        const queryString = "SELECT id, password FROM users WHERE ?";
        const mode = { username: username };
        db.query(queryString, mode, function (err, result, fields) {

            if (err) { return done(err) };
            if (result.length === 0) { return done(null, false); };

            const hash = result[0].password.toString();
            bcrypt.compare(password, hash, function (err, response) {
                if (response === true) {
                    return done(null, { user_id: result[0].id });
                } else {
                    return done(null, false);
                }
            });
        });
    }
));