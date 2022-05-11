const express=require("express")
const router=express.Router();
const courseSchema=require("../models/course.js")
const categorySchema=require('../models/category.js')
const sub_Category=require('../models/subcategory.js')
const jwt = require('jsonwebtoken');

router.post("/create",async(req,res)=>{
  
    const course = new courseSchema({
        name: req.body.name, overview: req.body.overview, duration: req.body.duration, category: req.body.category,
        instructor:req.body.instructor, img_thumbnai: req.body.img_thumbnai, no_of_enrollments: req.body.no_of_enrollments,
        sub_category:req.body.sub_category,comments:req.body.comments,syllabus:req.body.syllabus
      })
      // const category=new categorySchema({category:course.category})
      // const sub_category=new sub_Category({sub_Category:subcourse.sub_category})
      try {
        const newCourse = await course.save();
        // await category.save();
        // await sub_category.save();
        res.send(newCourse)
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
        const updatedEnrollment = await course.save();
        res.send("updated enrollment")
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
        return res.send("IV_JWT")
      }
      
      req.user=payload.user
      next()
    })
  }

module.exports=router;