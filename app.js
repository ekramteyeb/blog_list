
const express = require('express')

const app = express()
require('express-async-errors')
const cors = require('cors')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const config = require('./utils/config')

logger.info('connecting to ' , config.MONGODB_URI)


mongoose
  .connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then( () => {
    logger.info('connected to MongoDB')
  })
  .catch(error => {
    logger.error('error connecting to MongoDB: ', error.message)
  })

// middlewares
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)


app.use(middleware.tokenExtractor)
// routers
app.use('/api/login',loginRouter)
app.use('/api/blogs',blogsRouter)
app.use('/api/users',usersRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/tests')
  app.use('/api/testing', testingRouter)
}

app.get('/' ,(request, response) => {
  response.send('Hello blogger <br><br> Visit:  <a href="http://localhost:3001/api/blogs"> http://localhost/api/blogs</a> for blog service')
})

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
