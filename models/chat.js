const mongoose = require('mongoose')
const chatSchema = new mongoose.Schema({
  chatid:{type:String},
  chat:
      [{
        type:String
      }]
  

})

module.exports = mongoose.model('Chats', chatSchema)