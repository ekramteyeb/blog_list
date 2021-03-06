const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogsRouter.get('/', async (request, response) => {

  const blogs = await Blog.find({}).populate('user', { username:1,name:1 })
  response.json(blogs.map(blog => blog.toJSON()))
})
blogsRouter.get('/:id', async(request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog.toJSON())
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  //const token = getTokenFrom(request)
  //const tokenDecoded = request.get('authorization')
  //const token = tokenDecoded.substring(7)
  const token = request.token

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  //const user = await User.findById(body.user)

  const blog = new Blog({
    url:body.url,
    author:body.author,
    title:body.title,
    user:user._id,
    likes:body.likes,
    comments:body.comments,
  })
  const savedBlog = await blog.save()
  console.log(savedBlog)
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog.toJSON())
})

blogsRouter.delete('/:id', async (request, response) => {


  const token = request.token
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const blog = await Blog.findById(request.params.id)

  if(blog.user.toString() !== decodedToken.id){
    return response.status(401).json({ error: 'invalid id'  })
  }
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  //const token = request.token
  //const token = getTokenFrom(request)
  //const decodedToken = jwt.verify(token, process.env.SECRET)
  /* if (!token) {
    return response.status(401).json({ error: 'token missing or invalid' })
  } */
  //const user = await User.findById(decodedToken.id)

  const blog = {
    title: body.title,
    author: body.author,
    url:body.url,
    likes:body.likes,
    comments:body.comments,
  }
  /* console.log(blog)
  console.log(token)
  console.log(body.user) */
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog.toJSON())

})

module.exports = blogsRouter