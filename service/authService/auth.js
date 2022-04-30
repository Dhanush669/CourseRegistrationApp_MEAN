const passport = require('passport');

const localStrategy = require('passport-local').Strategy;
const userSchema = require("../../models/user.js")

passport.use(
    "login",new localStrategy(
        {
            usernameField: "emailId",
            passwordField: "password"
        },async (email,password,done)=>{
            try{
                const user = await userSchema.findOne({ emailId:email });
        
                if (!user) {
                  return done(null, false, { message: 'User not found' });
                }
        
                const validate = await user.isValidPassword(password);
        
                if (!validate) {
                  return done(null, false, { message: 'Wrong Password' });
                }
        
                return done(null, user, { message: 'Logged in Successfully' });
              } catch (error) {
                    return done(error);
              }
        }
    )
)

