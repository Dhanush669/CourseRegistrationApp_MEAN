const express=require("express");
const app=express()
const bodyParser=require("body-parser")
require("./service/authService/auth.js")
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
const mongo=require("./utils/database.js");
const courseRoutes=require("./routes/courseRoutes.js")
const userRoutes=require("./routes/usersRoutes.js")

const db=mongo.connection;
app.use("/course",courseRoutes)
app.use("/user",userRoutes)

app.listen(9000)