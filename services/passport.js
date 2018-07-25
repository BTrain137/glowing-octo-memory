/**
 * Passport middleware for login and register
 * Mongo connection is made to sync user's session in session's colletion
 * Client is given a cookie to match up with server's client session
 * Serialize client's cookie when stored in the browser
 * Deserialize User when called are being made from the client the server
 */

const passport = require("passport")
    , mongoose = require("mongoose")
    , Users = mongoose.model("Users");

//require in all Strategies 
require("./LocalStrategy.js");
require("./GoogleStrategy.js");

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

    Users.findOne({ "_id": user_id }, function (err, user) {
        if (err) {
            return done(err);
        };
        done(null, user);
    });
});
