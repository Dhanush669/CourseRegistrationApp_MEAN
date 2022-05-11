const express=require("express")
const router=express.Router();
const userSchema=require("../models/user.js")
const bcrypt = require("bcrypt");
const passport = require('passport');
const jwt = require('jsonwebtoken');
const refreshSchema=require('../models/refreshToken.js')
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

router.get('/isValid',authenticateJwt,(req,res)=>{
  res.send("true")
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
            return res.send("UNF");
          }
          req.login(
            user,
            { session: false },
            async (error) => {
              if (error) return next(error);

              const body = { role:user.role, emailId: user.emailId };
              // let token = "Bearer "+jwt.sign({ user: body }, process.env.TOP_SECRET,{ expiresIn: '5m' })+" ";
              let token = "Bearer "+generateAccessToken(body)+" ";
              let refreshToken=jwt.sign({ user: body }, process.env.REFRESH_SECRET,{ expiresIn: '60d' });
              const ref_token=new refreshSchema({refreshToken:refreshToken})
              await ref_token.save()
              token+=refreshToken;
              return res.send({"token":token,"role":user.role});
            }
          );
        } catch (error) {
          return next(error);
        }
      }
    )(req, res, next);
  }
);

router.get("/getToken",async(req,res)=>{
  let ref_Token=req.query.refreshToken;
  if (ref_Token == null) return res.send("Empty Token")
  let db_ref_Token= await refreshSchema.findOne({refreshToken:ref_Token})
  
  if (db_ref_Token.refreshToken!==ref_Token) return res.send("Please Login")
  jwt.verify(ref_Token,process.env.REFRESH_SECRET,(err,user)=>{
    if(err){
      return res.send(err.message)
    }
    if(user==null){
      return res.send("JWT Expired")
    }
    
    let token="Bearer "+generateAccessToken(user.user)+" "+ref_Token
    return res.send({"token":token,"role":user.user.role})
  })
})

router.delete("/removeToken",async (req,res)=>{
  
  let ref_Token=req.query.refreshToken
  console.log("inside delete "+ref_Token+" 1111");
  await refreshSchema.deleteOne({refreshToken:ref_Token})
  res.send("Deleted")
})

  // router.get("/hey",(req,res)=>{
  //   console.log(req.query.name);
  //   res.send(req.query.lastName)
  // })

  function generateAccessToken(body){
    return jwt.sign({ user: body }, process.env.TOP_SECRET,{ expiresIn: '30m' })
  }

router.patch("/update/userdetails",authenticateJwt,async(req,res)=>{
  
})

router.get("/myEnrollments",authenticateJwt,async(req,res)=>{
  let user
  try{
    user=await userSchema.findOne({emailId:req.user.emailId})
    if(user==null){
      return res.send("please login")
    }
  }catch(err){
    return res.send(err.message)
  }
  return res.send(user)

})

router.patch("/update/enrollmentdetails",authenticateJwt,async(req,res)=>{
  let coursesEnrolled
  try{
    const currentUser=await userSchema.findOne({emailId:req.user.emailId})
    // let obj=req.body.courses_Enrolled.name+" "+req.body.courses_Enrolled.img_thumbnai
    let obj=req.body.courses_Enrolled
    //console.log(obj);
    currentUser.courses_Enrolled.push(obj)
    await userSchema.updateOne({emailId:req.user.emailId},{$set:{courses_Enrolled:currentUser.courses_Enrolled}});
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

router.get("/oneuser",getUser,async(req,res)=>{
  res.send("true")
})

async function getUser(req, res, next) {
  let user
  try {
    const email=req.query.emailId
    user = await userSchema.findOne({emailId:email})
    if (user == null) {
      return res.send("false")
    }
  } catch (err) {
    return res.send(err.message)
  }

  res.user = user
  next()
}

async function register(req,res,next){
    const newUser= new userSchema(
        {firstName:req.body.fname,lastName:req.body.lname,emailId:req.body.email,
        password:req.body.password,phno:req.body.phno,role:"user",courses_Enrolled:[]
    })
    const hashed=await bcrypt.hash(newUser.password,10);
    newUser.password=hashed;
    req.newUser=newUser;
    next()
}

function authenticateJwt(req,res,next){
  const header=req.header('authorization')
  const token=header && header.split(' ')[1];
  if(token==null){
    return res.send("please log in")
  }
  jwt.verify(token,process.env.TOP_SECRET,(err,payload)=>{
    if(err){
      return res.send("IV_JWT")
    }
    req.user=payload.user
    next()
  })
}


module.exports = router