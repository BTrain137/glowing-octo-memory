const ShopifyStrategy = require("passport-shopify").Strategy
    , passport = require("passport")
    , mongoose = require("mongoose")
    , Users = mongoose.model("Users");


const logMe = function (accessToken, refreshToken, profile) {
    console.log("===================================");
    console.log("accessToken", accessToken);
    console.log("===================================");
    console.log("refreshToken", refreshToken);
    console.log("===================================");
    console.log("profile", profile);
}

passport.use("shopify", new ShopifyStrategy({
    clientID: process.env.SHOPIFY_CLIENT_ID,
    clientSecret: process.env.SHOPIFY_CLIENT_SECRET,
    callbackURL: "https://2000daa5.ngrok.io/auth/shopify/callback",
    shop: process.env.SHOPIFY_SHOP_SLUG
},
    function (accessToken, refreshToken, profile, done) {

        logMe(accessToken, refreshToken, profile);
        Users.findOne({ shopifyId: profile.id }, function (err, user) {

            if (err)
                return done(err);

            if (user) {

                // if a user is found, log them in
                return done(null, user);
            } else {

                // Create a new user
                var newUser = new Users({
                    shopifyId: profile.id,
                    token: accessToken,
                    username: profile.displayName,
                    email: profile.emails[0].value
                });

                // save the user
                newUser.save((err) => {
                    if (err) {
                        return done(err);
                    }
                    return done(null, newUser.id);
                });
            }
        });
    })
)