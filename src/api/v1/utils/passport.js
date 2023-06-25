const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/user.model");
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      enableProof: true,
      profileFields: ["id", "displayName", "photos", "email"],
      state: true,
    },
    async function (accessToken, refreshToken, profile, cb) {
      const { email } = profile._json;

      const isExist = await User.findOne({ email: email });

      console.log(isExist);

      if (isExist) {
        return cb(null, isExist);
      }
    }
  )
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

module.exports = passport;
