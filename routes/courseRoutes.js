const express=require("express")
const router=express.Router();
const courseSchema=require("../models/course.js")
const categorySchema=require('../models/category.js')
const sub_Category=require('../models/subcategory.js')
const syllabusSchema = require('../models/syllabus.js')
const commentsSchema = require('../models/comments.js')
const jwt = require('jsonwebtoken');

router.post("/create",async(req,res)=>{
  
    // const course = new courseSchema({
    //     name: req.body.name, overview: req.body.overview, duration: req.body.duration, category: req.body.category,
    //     instructor:req.body.instructor, img_thumbnai: req.body.img_thumbnai, no_of_enrollments: req.body.no_of_enrollments,
    //     sub_category:req.body.sub_category,comments:req.body.comments,syllabus:req.body.syllabus
    //   })

    const course = new courseSchema({
      name: req.body.name, overview: req.body.overview, duration: req.body.duration, category: req.body.category,
      instructor:req.body.instructor, img_thumbnai: req.body.img_thumbnai, no_of_enrollments: req.body.no_of_enrollments,
      sub_category:req.body.sub_category
    })

      // const category=new categorySchema({category:course.category})
      // const sub_category=new sub_Category({sub_Category:subcourse.sub_category})
      try {
        const newCourse = await course.save();
        const newSyllabus=new syllabusSchema({
          cid:newCourse._id,
          syllabus:req.body.syllabus
        })
        const syl=await newSyllabus.save()
        // await category.save();
        // await sub_category.save();
        res.send(newCourse+" "+syl)
      } catch (err) {
        res.send(err.message)
      }
})

router.get("/getSyllabus",authenticateJwt,async(req,res)=>{
  //console.log(req.query.name);
  let courseName=req.query.name
  let syllabus
  try{
      let course= await courseSchema.findOne({name:courseName})
      //console.log(course);
      let syllabus_obj= await syllabusSchema.findOne({cid:course._id})
      //console.log(syllabus_obj);
      syllabus=syllabus_obj.syllabus
  }catch(err){
    return res.send(err.message)
  }
  return res.send(syllabus)
})

router.patch("/addComment",authenticateJwt,async(req,res)=>{
  let course
  //console.log(req.body.name+" "+req.body.comment);
  try {
      course = await courseSchema.findOne({name:req.body.name})
    if (course == null) {
      return res.send('Cannot find course')
    }
  } catch (err) {
    console.log("inside error");
    return res.send(err.message)
  }
      //console.log(course);
      course.comments+=req.body.comment ;
      try {
        await course.save();
        res.send("updated enrollment")
      } catch (err) {
        res.send(err.message)
      }
})

router.patch("/update/enrollment",authenticateJwt,async (req,res)=>{
  let course
  try {
      course = await courseSchema.findOne({name:req.body.name})
    if (course == null) {
      return res.send('Cannot find course')
    }
  } catch (err) {
    console.log("inside error");
    return res.send(err.message)
  }
      course.no_of_enrollments= (course.no_of_enrollments+=1);
      try {
        await course.save();
        res.send(course.enrollments)
      } catch (err) {
        res.send(err.message)
      }
})

router.delete("/delete/course",getCourse,async(req,res)=>{
    try {
        await res.course.remove()
        res.send('Deleted course')
      } catch (err) {
        res.send(err.message)
      }
})

router.get("/getAllCourses",authenticateJwt,async(req,res)=>{
    try {
        const allCourses = await courseSchema.find()
        res.send(allCourses)
      } catch (err) {
        res.send(err.message)
      }
})

router.get("/getByName",authenticateJwt,async(req,res)=>{
    try{
        const filter=await courseSchema.find({name:req.query.name})
        res.send(filter)
    }catch(err){
        res.send(err.message)
    }
})

router.get("/filterByCategory",authenticateJwt,async(req,res)=>{
  try{
      const filter=await courseSchema.find({category:req.query.category})
      res.send(filter)
  }catch(err){
      res.send(err.message)
  }
})

router.get("/filterBySubCategory",authenticateJwt,async(req,res)=>{
  try{
      const filter=await courseSchema.find({sub_category:req.query.sub_category})
      res.send(filter)
  }catch(err){
      res.send(err.message)
  }
})

router.get("/getSelectedCourse",authenticateJwt,async(req,res)=>{
  let course
    try {
        course = await courseSchema.findOne({name:req.query.name})
      if (course == null) {
        return res.send('Cannot find course')
      }
    } catch (err) {
      console.log("inside error");
      return res.send(err.message)
    }
  
    res.send(course)
})



async function getCourse(req, res, next) {
    let course
    try {
        course = await courseSchema.findOne({name:req.body.name})
      if (course == null) {
        return res.send('Cannot find course')
      }
    } catch (err) {
      return res.send(err.message)
    }
  
    res.course = course
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
        console.log("jwt error");
        
        return res.status(401).send("IV_JWT")
      }
      
      req.user=payload.user
      next()
    })
  }

module.exports=router;