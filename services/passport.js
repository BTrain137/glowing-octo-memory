const LocalStrategy = require("passport-local").Strategy,
    bcrypt = require("bcrypt"),
    passport = require("passport"),
    db = require("../database/connection.js");

passport.serializeUser(function (user_id, done) {
    console.log("========serializeUser==================");
    console.log("serializeUser user_id", user_id);
  done(null, user_id);
});

passport.deserializeUser(function (user_id, done) {
  console.log("========deserializeUser==================");
  done(null, user_id);
});

passport.use("login", new LocalStrategy(
    (username, password, done) => {

        const queryString = "SELECT id, password FROM users WHERE ?";
        const mode = { username: username };
        db.query(queryString, mode, function (err, result, fields) {

            if (err) { 
                return done(err);
            };

            if (result.length === 0) {
                return done(null, false, "User not found"); 
            };

            const hash = result[0].password.toString();
            bcrypt.compare(password, hash, function (err, response) {
                if(err) throw err;

                if (response === true) {
                    return done(null, { user_id: result[0].id });
                } else {
                    return done(null, false, "Password does not match");
                }
            });
        });
    }
));

// passport.use("signup", new LocalStrategy({
//     passReqToCallback: true,
// }, (req, usernamePass, passwordPass, done) => {
//     const { body: { username, email, password } } = req;
  
//     // express validator
//     req.checkBody('username', 'Username field cannot be empty.').notEmpty();
//     req.checkBody('username', 'Username must be between 4-15 characters long.').len(4, 15);
//     req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
//     req.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);
//     req.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);
//     req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
//     req.checkBody('passwordMatch', 'Password must be between 8-100 characters long.').len(8, 100);
//     req.checkBody('passwordMatch', 'Passwords do not match, please try again.').equals(password);
  
//     // Additional validation to ensure username is alphanumeric with underscores and dashes
//     req.checkBody('username', 'Username can only contain letters, numbers, or underscores.').matches(/^[A-Za-z0-9_-]+$/, 'i');
  
//     const validateErrors = req.validationErrors();
  
//     if (validateErrors) {
//       res.render("register", {
//         title: "Registration Error",
//         errors: validateErrors
//       });
//       return;
//     }
  
//     // Encryption
//     bcrypt.hash(password, saltRounds, (err, hash) => {
//       if (err) throw err;
  
//       const queryString = "INSERT INTO users SET ?;";
//       const mode = { username, email, password: hash };
//       db.query(queryString, mode, (err, data, fields) => {
  
//         if (err) {
//           console.log("Error Code", err.code);
//           console.log("Sql Message", err.sqlMessage);
//           res.render("register", { title: "Registration Error: Email or Password does not match" });
//           return;
//         }
  
//         console.log(data);
//         db.query("SELECT LAST_INSERT_ID() as user_id", (error, results, fields) => {
//           if (error) throw error;
  
//           const user_id = results[0];
//           req.login(user_id, function (err) {
//             res.redirect("/");
//             return;
//           });
//         });
//       });
//     });
//   }));