const mongoose = require('mongoose')
const commentsSchema = new mongoose.Schema({
  cid:{type:mongoose.Schema.Types.ObjectId},
  comments:
      [{
        type:Object
      }]
  

})

module.exports = mongoose.model('Comments', commentsSchema)