const http = require('http')
const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')

const server = http.createServer(app)

server.listen(config.PORT, error => {
  logger.info(`Server running on port ${config.PORT}`)
  if(error){
    console.log('no port found')
  }
})