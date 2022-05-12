const mongoose = require('mongoose')

const syllabusSchema = new mongoose.Schema({
  cid:{type:mongoose.Schema.Types.ObjectId},
  syllabus:
      [{
        type:String
      }]
  

})

module.exports = mongoose.model('Syllabus', syllabusSchema)