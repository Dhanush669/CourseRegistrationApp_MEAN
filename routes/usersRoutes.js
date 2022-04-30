const express=require("express")
const router=express.Router();
const userSchema=require("../models/user.js")
const bcrypt = require("bcrypt");
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('dotenv').config()

router.post("/register",register,async(req,res)=>{
    const newUser=req.newUser;
    try{
        await newUser.save();
        res.send("Registered Successfully")
    }catch(err){
        res.send(err.message)
    }
})

router.post(
    '/login',
    async (req, res, next) => {
      passport.authenticate(
        'login',
        async (err, user, info) => {
          try {
            if (err || !user) {
              const error = new Error('An error occurred.');
  
              return next(err.message);
            }
  
            req.login(
              user,
              { session: false },
              async (error) => {
                if (error) return next(error);
  
                const body = { role:user.role, emailId: user.emailId };
                const token = jwt.sign({ user: body }, process.env.TOP_SECRET);
  
                return res.json({ token });
              }
            );
          } catch (error) {
            return next(error);
          }
        }
      )(req, res, next);
    }
  );

router.patch("/update/userdetails",authenticateJwt,async(req,res)=>{
  
})

router.patch("/update/enrollmentdetails",authenticateJwt,async(req,res)=>{
 
  try{
    const currentUser=await userSchema.findOne({emailId:req.user.emailId})
    const coursesEnrolled=""
    if(currentUser.coursesEnrolled===""){
        coursesEnrolled=req.body.courses_Enrolled
    }
    else{
      coursesEnrolled=currentUser.courses_Enrolled+" "+req.body.courses_Enrolled;
    }
    
    await userSchema.updateOne({emailId:req.user.emailId},{$set:{courses_Enrolled:coursesEnrolled}});
    res.send("Course Enrolled")
  }catch(err){
    res.send(err.message)
  }
  
})

router.get("/allusers",async(req,res)=>{
  try{
    const alluser=await userSchema.find()
    res.send(alluser)
  }catch(err){
    res.send(err.message)
  }
})

async function register(req,res,next){
    const newUser= new userSchema(
        {firstName:req.body.fname,lastName:req.body.lname,emailId:req.body.email,
        password:req.body.password,phno:req.body.phno,role:"user",courses_Enrolled:""
    })
    const hashed=await bcrypt.hash(newUser.password,10);
    newUser.password=hashed;
    req.newUser=newUser;
    next()
}

function authenticateJwt(req,res,next){
  const header=req.header('authorization')
  const token=header;
  if(token==null){
    return res.send("please log in")
  }
  jwt.verify(token,process.env.TOP_SECRET,(err,payload)=>{
    if(err){
      return res.send(err.message)
    }
    req.user=payload.user
    next()
  })
}


module.exports = router