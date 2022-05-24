const express=require("express")
const router=express.Router();
const courseSchema=require("../models/course.js")
const categorySchema=require('../models/category.js')
const sub_Category=require('../models/subcategory.js')
const syllabusSchema = require('../models/syllabus.js')
const commentsSchema = require('../models/comments.js')
const enrollemnts = require('../models/enrollments.js')
const jwt = require('jsonwebtoken');

router.post("/create",authenticateJwt,async(req,res)=>{
  
  if(req.user.role==="user"){
    return res.send("unauthorised access")
  }

    const course = new courseSchema({
      name: req.body.name, overview: req.body.overview, duration: req.body.duration, category: req.body.category,
      instructor:req.body.instructor, img_thumbnai: req.body.img_thumbnai, no_of_enrollments: req.body.no_of_enrollments,
      sub_category:req.body.sub_category,price:req.body.price
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
      if(syllabus_obj===null){
        //console.log("nyll syl");
        return res.send([])
      }
      syllabus=syllabus_obj.syllabus
  }catch(err){
    return res.send(err.message)
  }
  
  console.log(syllabus);
  return res.send(syllabus)
})

router.patch("/addComment",authenticateJwt,async (req,res)=>{
  let courseComment
  try{
    const curCourse = await courseSchema.findOne({name:req.body.name})
    //console.log(curCourse);
    courseComment=await commentsSchema.findOne({cid:curCourse._id})
    //console.log(courseComment);
    if(courseComment===null){
      courseComment=new commentsSchema({
        cid:curCourse._id,
        comments:[{
          uid:req.user._id,
          comment:req.body.comment
        
        }]
      })
      //console.log(courseComment+" new");
      courseComment.save()
      return res.send(courseComment)
    }
    courseComment.comments.push({uid:req.user._id,comment:req.body.comment})
    courseComment.save()
  }catch(err){
    return res.send(err.message+" error")
  }
  return res.send("comment added")
})

router.patch("/updateCourse",authenticateJwt,async(req,res)=>{
  if(req.user.role==="user"){
    return res.send("unauthorised user")
  }
  try{
    let curCourse=await courseSchema.findOne({name:req.body.courseName})
    let cursuy= await syllabusSchema.findOne({cid:curCourse._id})
    curCourse.name=req.body.name
    curCourse.category=req.body.category
    curCourse.sub_Category=req.body.sub_category
    curCourse.overview=req.body.overview
    curCourse.duration=req.body.duration
    curCourse.price=req.body.price
    curCourse.instructor=req.body.instructor
    curCourse.img_thumbnai=req.body.img_thumbnai
    curCourse.no_of_enrollments=req.body.no_of_enrollments
    cursuy.syllabus=req.body.syllabus
    curCourse.save()
    cursuy.save()
  }catch(err){
    return res.send(err.message)
  }
  return res.send("course updated Successfully")
})

router.patch("/addCategory",authenticateJwt,async(req,res)=>{
  if(req.user.role==="user"){
    return res.send("unauthorised user")
  }
  try{
    let prevCate=await categorySchema.find({})
    let newCate=req.body.category
    if(prevCate.length==0){
    let cate=new categorySchema({
      category:[newCate]
    })
    await cate.save()
  }
  else{
    prevCate[0].category.push(newCate)
    await prevCate[0].save()
  }
  }catch(err){
    return res.send(err.message)
  }
  return res.send("category added")
})

router.patch("/addSubCategory",authenticateJwt,async(req,res)=>{
  if(req.user.role==="user"){
    return res.send("unauthorised user")
  }
  try{
    let prevCate=await sub_Category.find({})
    let newSubCate=req.body.subCategory
    if(prevCate.length==0){
    let cate=new sub_Category({
      sub_category:[newSubCate]
    })
    await cate.save()
  }
  else{
    prevCate[0].sub_category.push(newSubCate)
    await prevCate[0].save()
  }
  }catch(err){
    return res.send(err.message)
  }
  return res.send("Subcategory added")
})

router.get("/allCategory",authenticateJwt, async(req,res)=>{
  
  let allCate
  try{
    let allCateArr=await categorySchema.find({})
    if(allCateArr.length===0){
      return res.send(allCateArr)
    }
    allCate=allCateArr[0].category

  }catch(err){
    return res.send(err.message)
  }
  return res.send(allCate)
})

router.get("/allSubCategory",authenticateJwt, async(req,res)=>{
  
  let allSubCate
  try{
    let allSubCateArr=await sub_Category.find({})
    if(allSubCateArr.length===0){
      return res.send(allSubCateArr)
    }
    allSubCate=allSubCateArr[0].sub_category

  }catch(err){
    return res.send(err.message)
  }
  return res.send(allSubCate)
})

router.delete("/deleteCourse",authenticateJwt,async (req,res)=>{
  
  if(req.user.role==="user"){
    return res.send("UnAuthorised Access")
  }
  try{
    let courseName=req.query.name
    let currentCourse=await courseSchema.findOne({name:courseName})
    if(currentCourse===null)return res.send("course not available")
    await syllabusSchema.deleteOne({cid:currentCourse._id})
    await commentsSchema.deleteOne({cid:currentCourse._id})
    await courseSchema.deleteOne({name:courseName})
  }
  catch(err){
    return res.send(err.message)
  }
  return res.send("Course Successfully Deleted")
})

router.get("/getComments",authenticateJwt,async(req,res)=>{
  let comments
  try{
    let currentCourse=await courseSchema.findOne({name:req.query.name})
    comments=await commentsSchema.findOne({cid:currentCourse._id})
  }catch(err){
    return res.send(err.message)
  }
  if(comments===null){
    return res.send([])
  }
  return res.send(comments.comments)
})

// router.patch("/addComment",authenticateJwt,async(req,res)=>{
//   let course
//   //console.log(req.body.name+" "+req.body.comment);
//   try {
//       course = await courseSchema.findOne({name:req.body.name})
//     if (course == null) {
//       return res.send('Cannot find course')
//     }
//   } catch (err) {
//     console.log("inside error");
//     return res.send(err.message)
//   }
//       //console.log(course);
//       course.comments+=req.body.comment ;
//       try {
//         await course.save();
//         res.send("updated enrollment")
//       } catch (err) {
//         res.send(err.message)
//       }
// })

router.patch("/update/enrollment",authenticateJwt,async (req,res)=>{
  console.log("ima enrollemntssasdf");
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

// router.delete("/delete/course",getCourse,async(req,res)=>{
//     try {
//         await res.course.remove()
//         res.send('Deleted course')
//       } catch (err) {
//         res.send(err.message)
//       }
// })

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
    jwt.verify(token,"NOSECRET",(err,payload)=>{
      if(err){
        console.log("jwt error");
        
        return res.status(401).send("IV_JWT")
      }
      req.user=payload.user
      next()
    })
  }

module.exports=router;