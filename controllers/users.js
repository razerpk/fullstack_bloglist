const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

// POST
usersRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body

    if(body.password === undefined)
      return response.status(400).json({ error: 'Password missing' })
    if(body.password.length < 3)
      return response.status(400).json({ error: 'password needs to be atleast 3 characters long' })

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)
    const user = User({
      username: body.username,
      name: body.name,
      passwordHash,
    })

    const savedUser = await user.save()

    response.json(savedUser)
  }catch (exception){
    next(exception)
  }
})

// GET
usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1, id: 1 })
  response.json(users.map(u => u.toJSON()))
})

module.exports = usersRouter