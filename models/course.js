const mongoose = require('mongoose')
const {Schema} = mongoose

// const courseSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   overview:{
//       type: String,
//       required: true
//   },
//   duration:{
//     type: String,
//     required: true
//     },
//   category:{
//     type: String,
//     required: true
//   },
//   instructor:{
//     type: String,
//     required: true
//   },
//   img_thumbnai:{
//     type: String,
//     required: true
//   },
//   no_of_enrollments:{
//     type: Number,
//     required: true
//   },
//   sub_category:{
//     type:String,
//     required: true
//   },
//   comments:{
//     type:String,
//     required: false,
//     default: ""
//   },
//   syllabus:[{
//     type:String,
//     required: true
//   }]
//   // isBestSeller:{
//   //   type:Boolean,
//   //   required:ture
//   // }
// })


// const courseSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   overview:{
//       type: String,
//       required: true
//   },
//   duration:{
//     type: String,
//     required: true
//     },
//   category:{
//     type: String,
//     required: true
//   },
//   instructor:{
//     type: String,
//     required: true
//   },
//   img_thumbnai:{
//     type: String,
//     required: true
//   },
//   no_of_enrollments:{
//     type: Number,
//     required: true
//   },
//   sub_category:{
//     type:String,
//     required: true
//   },
//   comments:{
//     type:String,
//     required: false,
//     default: ""
//   },
//   syllabus:[{
//     type:String,
//     required: true
//   }],
//   // isBestSeller:{
//   //   type:Boolean,
//   //   required:ture
//   // }
// })

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  overview:{
      type: String,
      required: true
  },
  duration:{
    type: String,
    required: true
    },
  category:{
    type: String,
    required: true
  },
  instructor:{
    type: String,
    required: true
  },
  img_thumbnai:{
    type: String,
    required: true
  },
  no_of_enrollments:{
    type: Number,
    required: true
  },
  sub_category:{
    type:String,
    required: true
  },
  price:{
    type:Number,
    required:true
  }
  // isBestSeller:{
  //   type:Boolean,
  //   required:ture
  // }
})

module.exports = mongoose.model('Courses', courseSchema)