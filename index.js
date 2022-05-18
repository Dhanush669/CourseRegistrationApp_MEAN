const express=require("express");
const app=express()
const session = require('express-session');
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
     next();
  });


const bodyParser=require("body-parser")
require("./service/authService/auth.js")
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

const mongo=require("./utils/database.js");
const courseRoutes=require("./routes/courseRoutes.js")
const userRoutes=require("./routes/usersRoutes.js")

mongo.connection;
app.use("/course",courseRoutes)
app.use("/user",userRoutes)



app.listen(9000)