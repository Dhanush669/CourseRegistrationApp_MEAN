const mongo=require("mongoose")
require('dotenv').config()
mongo.connect("mongodb://localhost:27017/CourseRegistratonApp")

module.exports=mongo