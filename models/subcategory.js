const mongoose = require('mongoose')

const sub_categorySchema= new mongoose.Schema({
    category:{
        type:String,
        required:true
    },
    sub_category:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('subCategorySchema', sub_categorySchema)