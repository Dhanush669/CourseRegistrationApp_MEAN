const mongo=require("mongoose")
require('dotenv').config()
//mongo.connect("mongodb://localhost:27017/CourseRegistratonApp")
const db="mongodb+srv://root:Litpassword@cluster0.xxju2.mongodb.net/CourseRegistrationApp?retryWrites=true&w=majority"
mongo.connect(db,{
    useNewUrlParser:true,
    
    useUnifiedTopology:true,
    
}).then(()=>{
    console.log("connection successfull");
}).catch((err)=>{
    console.log("err "+err);
})

module.exports=mongo