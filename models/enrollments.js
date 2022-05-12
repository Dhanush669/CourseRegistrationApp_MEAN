const mongoose = require('mongoose')

const enrollmentSchema = new mongoose.Schema({
  uid:{type:mongoose.Schema.Types.ObjectId},
  en_courses:
      [{
        type:mongoose.Schema.Types.ObjectId
      }]
  

})

module.exports = mongoose.model('Enrollments', enrollmentSchema)