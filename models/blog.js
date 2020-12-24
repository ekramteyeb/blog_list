const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: String,
  author: {
    type:String,
    required:true,
  },
  url: {
    type:String,
    required:true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  likes: {
    type:Number,
    required:true,
  },
})


//const Blog = mongoose.model('Blog', blogSchema)


// modifiy the mongose_id ,  delete the  __v save the unique identifier id in 'id' form
blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Blog', blogSchema)