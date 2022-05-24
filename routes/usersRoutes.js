const express=require("express")

const router=express.Router();
const userSchema=require("../models/user.js")
const enrollmentSchema=require("../models/enrollments.js")
const courseSchema=require("../models/course.js")
const bcrypt = require("bcryptjs");
const passport = require('passport');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const refreshSchema=require('../models/refreshToken.js')
const chatSchema=require('../models/chat.js')
require('dotenv').config()
require('./auth.js')

twilio_SID=process.env.accountSid
console.log(twilio_SID);
twilio_Token=process.env.authToken 
console.log(twilio_Token);
const otpService = require('twilio')(twilio_SID,twilio_Token );
const Razorpay=require('razorpay')
const crypto = require('crypto');
const twilio = require("twilio");

router.post("/register",register,async(req,res)=>{
    const newUser=req.newUser;
    try{
        await newUser.save();
        res.send("Registered Successfully")
    }catch(err){
        res.send(err.message)
    }
})

router.get("/auth/google", passport.authenticate('google', { scope: [ 'email', 'profile' ],prompt: 'select_account',response_type:"token&"}
)

)

router.get('/isValid',authenticateJwt,(req,res)=>{
  res.send("true")
})

router.get("/sendOTP",(req,res)=>{
  console.log("send otp");
  const phno="+91"+req.query.phno
  otpService
  .verify
  .services(process.env.serviceId)
  .verifications
  .create({
      to: phno,
      channel: 'sms' 
  })
  .then(data => {
      return res.send(
           "OTP is sent!!"
      )
  }).catch((err)=>{
    return res.send(err.message)
  }) 
})

router.get("/verifyOtp",(req,res)=>{
  console.log(req.query.otp);
  otpService
            .verify
            .services(process.env.serviceId)
            .verificationChecks
            .create({
                to: `+${req.query.phno}`,
                code: req.query.otp
            })
            .then(data => {
                if (data.status === "approved") {
                  console.log("done");
                    return res.send(
                        "UIV"
                    )
                }
            }).catch((err)=>{
              console.log("err");
              console.log(err.message);
              return res.status(401).send(err.message)
            })
})

router.patch("/resetPassword",async(req,res)=>{
  let email=req.body.emailId
  let pwd=req.body.password
  console.log(pwd);
  let curuser
  try{
    curuser=await userSchema.findOne({emailId:email})
    //await userSchema.updateOne({emailId:user.email},{$set:{password:await bcrypt.hash(pwd,10)}})
    console.log(curuser);
    curuser.password=await bcrypt.hash(pwd,10)
    console.log(await bcrypt.compare(pwd,curuser.password));
    console.log(curuser.password);
    curuser.save()
  }catch(err){
    return res.send(err.message)
  }
  return res.send("updated Successfully")
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

              const body = { role:user.role, emailId: user.emailId, _id:user._id };
              // let token = "Bearer "+jwt.sign({ user: body }, process.env.TOP_SECRET,{ expiresIn: '5m' })+" ";
              let token = "Bearer "+generateAccessToken(body)+" ";
              let refreshToken=jwt.sign({ user: body }, "NOSECRET",{ expiresIn: '60d' });
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

router.post("/orders",async(req,res)=>{
  const amount=req.body.price
  var instance=new Razorpay({key_id:process.env.rzp_ID,key_secret:process.env.rzp_Secret})
  let order= await instance.orders.create({
    amount:amount*100,
    currency:"INR",
    receipt:"receipt#1",
  })
  console.log(order);

  res.send(order)

})

router.post("/verigyPayment",async(req,res)=>{
  
  const order_id=req.body.order_id
  const payment_id=req.body.payment_id
  const razorpay_signature =  req.body.signature;
  console.log("im inside verifie "+order_id+" "+payment_id+" "+razorpay_signature);
  
    const key_secret = process.env.rzp_Secret;     

    let hmac = crypto.createHmac('sha256', key_secret); 
  
    hmac.update(order_id + "|" + payment_id);
      
    const generated_signature = hmac.digest('hex');
      
      
    if(razorpay_signature===generated_signature){
      console.log("verified");
        return res.send("PV")
    }
    else
    return res.send("PVF")
})

router.get("/getToken",async(req,res)=>{
  let ref_Token=req.query.refreshToken;
  if (ref_Token == null) return res.send("Empty Token")
  let db_ref_Token= await refreshSchema.findOne({refreshToken:ref_Token})
  if (db_ref_Token==null) return res.send("Please Login")
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
  //console.log("inside delete "+ref_Token+" 1111");
  await refreshSchema.deleteOne({refreshToken:ref_Token})
  res.send("Deleted")
})

  // router.get("/hey",(req,res)=>{
  //   console.log(req.query.name);
  //   res.send(req.query.lastName)
  // })

  function generateAccessToken(body){
    return jwt.sign({ user: body },process.env.TOP_SECRET,{ expiresIn: '30m' })
  }

router.patch("/update/userdetails",authenticateJwt,async(req,res)=>{
    try{
      let curUser=await userSchema.findById(req.user._id)
      curUser.firstName=req.body.firstName
      curUser.emailId=req.body.emailId
      curUser.phno=req.body.phno
      curUser.save()

    }catch(err){
      res.send(err.message)
    }
    res.send("successfully updated details")
})




router.get("/myEnrollments",authenticateJwt,async(req,res)=>{
  let user=[]
  try{
    const currentUserId=await enrollmentSchema.findOne({uid:req.user._id})
    if(currentUserId===null){
      return res.send("no enrollments found")
    }
    // console.log(req.user._id);
    // console.log(currentUserId);
    for(let i=0;i<currentUserId.en_courses.length;i++){
      let oneCourse=await courseSchema.findById(currentUserId.en_courses[i])
      if(oneCourse!==null){
      user.push(oneCourse)
      }
    }
    // console.log(user.length);
  }catch(err){
    return res.send(err.message)
  }
  return res.send(user)

})

router.patch("/update/enrollmentdetails",authenticateJwt,async(req,res)=>{
  let coursesEnrolled
  try{
    // console.log(req.user._id);
    const currentUserId=await enrollmentSchema.findOne({uid:req.user._id})
    const cur_course=await courseSchema.findOne({name:req.body.name})
    let obj=req.body.name
    console.log(currentUserId);
    if(currentUserId===null){
      let enrollment=new enrollmentSchema({
        uid: req.user._id,
        en_courses:[cur_course._id]
      })
      enrollment.save()
      return res.send(enrollment)
    }
    currentUserId.en_courses.push(cur_course._id)
    await currentUserId.save()
    res.send("Course Enrolled Successfully")
  }catch(err){
    res.send(err.message)
  }
})

router.get("/allUsers",authenticateJwt,async(req,res)=>{
  if(req.user.role!=="admin"){
    return res.send("unauthorised user")
  }
  try{
    const alluser=await userSchema.find()
    res.send(alluser)
  }catch(err){
    res.send(err.message)
  }
})

router.patch("/makeAdmin",authenticateJwt,async (req,res)=>{
  if(req.user.role!=="admin"){
    return res.status(401).send("UAU")
  }
  try{
    // const curuser=await userSchema.findOne({emailId:req.body.emailId})
    const curuser=await userSchema.findById(req.user._id)
    const newrole=req.body.role
    console.log(curuser);
    curuser.role=newrole
    curuser.save()
  }
  catch(err){
    return res.send(err.message)
  }
  return res.send("Made as Admin")
})

router.get("/oneuser",getUser,async(req,res)=>{
  res.send("true")
})

router.get("/findUser",authenticateJwt,async(req,res)=>{
  let user
  try{
    user=await userSchema.findById(req.user._id)
  }
  catch(err){
    res.send(err.message)
  }
  return res.send(user)
})

router.get("/findHim",authenticateJwt,async(req,res)=>{
  let obj
  try{
    let id=req.query.uid;
    let user=await userSchema.findById(id)
    let enroll=await enrollmentSchema.findOne({uid:user._id})
    console.log(enroll);
    let user_enroll=[]
    if(enroll!==null){
      for(let i=0;i<enroll.en_courses.length;i++){
        let oneCourse=await courseSchema.findById(enroll.en_courses[i])
        if(oneCourse!==null){
        user_enroll.push(oneCourse)
        }
      }
    }
    
    
    obj={
      "user":user,
      "enrollments":user_enroll
    }

  }catch(err){
    return res.send(err.message)
  }
  return res.send(obj)
})

router.get("/getDetails",async(req,res)=>{
  let user
  try{
    let emailid=req.query.email;
    user=await userSchema.findOne({emailId:emailid})
  }catch(err){
    return res.send(err.message)
 
  }
  if(user===null){
    return res.status(404).send("UNF")
  }
  return res.send(user)
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
      password:req.body.password,phno:req.body.phno,role:"user"
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
  jwt.verify(token,"NOSECRET",(err,payload)=>{
    if(err){
      console.log("jwt error");
      
      return res.status(401).send("IV_JWT")
    }
    
    req.user=payload.user
    next()
  })
}


module.exports = router