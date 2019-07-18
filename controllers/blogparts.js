const jwt = require('jsonwebtoken')
const blogRouter = require('express').Router()
const Blog = require('../models/blogpart')
const User = require('../models/user')

// GET
blogRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1, id: 1 })
  response.json(blogs.map(blog => blog.toJSON()))
})

// POST
blogRouter.post('/', async (request, response, next) => {
  const body = request.body

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes === undefined ? 0 : body.likes,
      user: user._id
    })

    const newBlog = await blog.save()
    user.blogs = user.blogs.concat(newBlog._id)
    await user.save()
    response.json(newBlog.toJSON())

  } catch (exception) {
    next(exception)
  }
})

// DELETE
blogRouter.delete('/:id', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)
    const blog = await Blog.findById(request.params.id)

    if (blog.user.toString() === user.id.toString()){
      await Blog.findByIdAndRemove(request.params.id)
      response.status(204).end()
    }else {
      response.status(401).json({ error: 'Can only delete own blogs' })
    }
  } catch (exception) {
    next(exception)
  }
})

// PUT
blogRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog.toJSON())
  } catch (exception) {
    next(exception)
  }
})

module.exports = blogRouter