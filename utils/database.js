const mongo=require("mongoose")
require('dotenv').config()
mongo.connect(process.env.DATABASE_URL)

module.exports=mongo