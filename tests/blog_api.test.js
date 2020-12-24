const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')

const Blog = require('../models/blog')
const User = require('../models/user')

//authrization
let token = ''

// users
describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root',name:'ahmed', passwordHash })
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})
beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)

  // user logged in using credentials
  await api
    .post('/api/login')
    .send({ username:'root', password:'sekret' })
    .expect(function(res){
      //console.log('token', res.body.token)
      token = res.body.token
      //console.log('token inside user', token)
    })
  //console.log('token at eth end of user', token)

})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(titles).toContain(
      'Go To Statement Considered Harmful'
    )
  })
})

describe('viewing a specific blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultblog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('content-Type', /application\/json/)
    const processedblogToView = JSON.parse(JSON.stringify(blogToView))

    expect(resultblog.body).toEqual(processedblogToView)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    //console.log(validNonexistingId)

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

describe('addition of a new blog', () => {
  test('succeeds with valid data', async () => {
    const newblog = {
      title: 'async/await simplifies making async calls',
      author:'hussen',
      url:'http://daki.live',
      likes:3
    }

    await api
      .post('/api/blogs')
      .auth(token,{ type:'bearer' })
      //.auth('root','sekret',{ type:'basic' })
      .send(newblog)
      .expect(201)
      .expect('content-Type', /application\/json/)


    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(n => n.title)
    expect(titles).toContain(
      'async/await simplifies making async calls'
    )
  })

  test('fails with status code 400 if data invaild', async () => {
    const newblog = {
      title:'All in one approach',
      url:'http://daki.live',
      likes:8
    }

    await api
      .post('/api/blogs')
      .auth(token,{ type:'bearer' })
      .send(newblog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if only an authorised  user deletes own blogs', async () => {

    const newblog = {
      title: 'async/await simplifies making async calls',
      author:'hussen',
      url:'http://daki.live',
      likes:3
    }
    //a logged in user added a blog so as to delete it later
    await api
      .post('/api/blogs')
      .auth(token,{ type:'bearer' })
      .send(newblog)
      .expect(201)


    const blogs = await helper.blogsInDb()

    const blogToDelete = blogs[2]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .auth(token,{ type:'bearer' })
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})



afterAll(() => {
  mongoose.connection.close()
})