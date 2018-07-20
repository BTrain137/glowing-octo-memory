const LocalStrategy = require("passport-local").Strategy,
    bcrypt = require("bcrypt"),
    passport = require("passport"),
    saltRounds = 10,
    db = require("../database/connection.js");

passport.serializeUser(function (user_id, done) {
    console.log("========serializeUser==================");
    console.log("serializeUser user_id", user_id);
    done(null, user_id);
});

passport.deserializeUser(function (user_id, done) {
    console.log("========deserializeUser==================");
    console.log("serializeUser user_id", user_id);
    done(null, user_id);
});

passport.use("login", new LocalStrategy(
    (username, password, done) => {

        const queryString = "SELECT id, password FROM users WHERE ?";
        const mode = { username: username };
        db.query(queryString, mode, function (err, result, fields) {

            if (err) {
                return done("hello world err stuff")
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