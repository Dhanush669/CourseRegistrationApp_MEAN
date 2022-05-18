var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const passport = require('passport');

passport.use(new GoogleStrategy({
    clientID:     "1032473478469-qtqeqhbvr0e6kbitkbjnhlb7j1odg23t.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:9000/user/auth/google/callback",
    passReqToCallback   : true,
    
  },


  function(request, accessToken, refreshToken, profile, done) {
      console.log("hey");
      return done(err, profile);
  }
));

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
