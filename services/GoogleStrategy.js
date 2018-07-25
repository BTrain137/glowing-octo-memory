const GoogleStrategy = require('passport-google-oauth20').Strategy
    , passport = require("passport")
    , mongoose = require("mongoose")
    , Users = mongoose.model("Users");

passport.use("google", new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
    function (accessToken, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(() => {

            Users.findOne({ googleId: profile.id }, (err, user) => {

                if (err)
                    return done(err);

                if (user) {

                    // if a user is found, log them in
                    return done(null, user);
                } else {

                    // Create a new user
                    var newUser = new Users({
                        googleId : profile.id,
                        token: accessToken,
                        username: profile.displayName,
                        email: profile.emails[0].value
                    });

                    // save the user
                    newUser.save((err) => {
                        if (err){
                            return done(err);
                        }
                        return done(null, newUser.id);
                    });
                }
            });
        })
    }
));