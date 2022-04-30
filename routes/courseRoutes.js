const express=require("express")
const router=express.Router();
const courseSchema=require("../models/course.js")

router.post("/create",async(req,res)=>{
  
    const course = new courseSchema({
        name: req.body.name, overview: req.body.overview, duration: req.body.duration, category: req.body.category,
        instructor:req.body.instructor, img_thumbnai: req.body.img_thumbnai, no_of_enrollments: req.body.no_of_enrollments,
        sub_category:req.body.sub_category
      })
      try {
        const newCourse = await course.save();
        res.send(newCourse)
      } catch (err) {
        res.send(err.message)
      }
})

router.patch("/update/enrollment",getCourse,async (req,res)=>{
      res.course.no_of_enrollments= (res.course.no_of_enrollments+=1);
      try {
        const updatedEnrollment = await res.course.save();
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

router.get("/getAllCourses",async(req,res)=>{
    try {
        const allCourses = await courseSchema.find()
        res.send(allCourses)
      } catch (err) {
        res.send(err.message)
      }
})
router.get("/getByCategory",async(req,res)=>{
    try{
        const filter=await courseSchema.find({name:req.body.category})
        res.send(filter)
    }catch(err){
        res.send(err.message)
    }
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

module.exports=router;