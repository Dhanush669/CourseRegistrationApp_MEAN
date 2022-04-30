const mongoose = require('mongoose')
const bcrypt = require("bcrypt");

const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
        required:true,
    },
    emailId:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    phno:{
        type:String,
        required:true,
    },
    role:{
        type:String
       },
    courses_Enrolled:{
        type:String,
    }
    

})

userSchema.methods.isValidPassword=async function(password) {
    const user = this;
    const compare = await bcrypt.compare(password, user.password);
  
    return compare;
  }

module.exports = mongoose.model('Users', userSchema)