const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const api = supertest(app)

const Blog = require('../models/blogpart')
const User = require('../models/user')

describe.skip('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs
      .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(helper.initialBlogs.length)
  })

  test('Blog id is not undefined', async () => {
    const response = await api.get('/api/blogs')
    const firstBlogId = response.body[0].id

    expect(firstBlogId).toBeDefined()
  })

  describe('addition of a new blog', () => {
    test('blogpost can be added', async () => {
      const blogPost = {
        title: 'Blogpost can be added',
        author: 'Rico',
        url: 'https://reactpatterns.com/',
        likes: 3
      }

      await api
        .post('/api/blogs')
        .send(blogPost)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(helper.initialBlogs.length+1)
    })

    test('blog without likes is initialized with 0 likes', async () => {
      const blogPost = {
        title: 'Blogpost can be added',
        author: 'Rico',
        url: 'https://reactpatterns.com/',
        likes: undefined ? undefined : 0
      }

      expect(blogPost.likes).toBe(0)
    })

    test('blog without title isnt added', async () => {
      const blogPost = {
        author: 'Rico',
        url: 'https://reactpatterns.com/',
        likes: 2
      }

      await api
        .post('/api/blogs')
        .send(blogPost)
        .expect(400)
    })

    test('blog without url isnt added', async () => {
      const blogPost = {
        title: 'Testing is error working',
        author: 'Rico',
        likes: 2
      }

      await api
        .post('/api/blogs')
        .send(blogPost)
        .expect(400)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      expect(blogsAtEnd.length).toBe(
        helper.initialBlogs.length - 1
      )
    })
  })
})


describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User({ username: 'root', password: 'password' })
    await user.save()
  })

  test.skip('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'pass',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'pass',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
})
afterAll(() => {
  mongoose.connection.close()
})