// server/server.ts

import express, { type Request, type Response } from 'express'
import { getRequiredEnvVariable } from './utils/getRequiredEnvVariable'
import cors from 'cors'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { consoleLogging } from './middleware/consoleLogging'
import customPoweredBy from './middleware/customPoweredBy'
import initPostgres from './messagesPostgres'
import initMongo from './messagesMongo'

// CORS options configuration
const corsOptions = {
  // Function to dynamically set allowed origins based on incoming request
  origin: (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void
  ) => {
    // Retrieve list of allowed domains from an environment variable
    const allowedDomains = getRequiredEnvVariable('ALLOWED_ORIGINS').split(',')

    if (process.env.NODE_ENV !== 'production') {
      // Allow all origins in non-production environments
      console.log(`\x1b[32mAllowed origin (non-production): ${origin}\x1b[0m`)
      callback(null, true)
    } else if (origin !== undefined && allowedDomains.includes(origin)) {
      // In production, check against the list of allowed origins
      console.log(`\x1b[32mAllowed origin: ${origin}\x1b[0m`)
      callback(null, true)
    } else {
      // Block origins not in the allowed list
      console.log(`\x1b[31mBlocked origin: ${origin}\x1b[0m`)
      callback(new Error('403: Origin not permitted by CORS policy'), false)
    }
  },
  // Enable credentials (cookies) for CORS requests
  credentials: true
}

const app = express()
const httpServer = createServer(app)

// Console logging middleware
app.use(consoleLogging)

// server.disable('x-powered-by');
app.use(customPoweredBy(getRequiredEnvVariable('POWERED_BY')))

// Apply CORS middleware with custom options
app.use(cors(corsOptions))

// Handle preflight requests (OPTIONS)
app.options('*', cors(corsOptions))

// Standard DB Processing
initPostgres.sequelizeMsg
  .sync({ force: false })
  .then(() => {
    console.log('\x1b[32mSynced db.\x1b[0m')
  })
  .catch((err: Error) => {
    console.log('\x1b[31mFailed to sync db: ' + err.message + '\x1b[0m')
  })

// Connect to MongoDB at the start of your application
initMongo()
  .then(() => {
    // MongoDB is connected. Start Express server or other operations here.
  })
  .catch((error) => {
    // Handle MongoDB connection error
    console.error('MongoDB connection failed:', error)
    // Depending on your application's needs, you might want to exit if the database connection is essential
    process.exit(1)
  })

app.get('/', (req: Request, res: Response) => {
  res.status(204).end()
})

const host = getRequiredEnvVariable('HOST')
const port = getRequiredEnvVariable('PORT')

httpServer.listen(port, () => {
  const message = `[server]: Server is running at http://${host}:${port}`
  const greenMessage = `\x1b[32m${message}\x1b[0m`
  console.log(greenMessage)
}).on('error', (err) => {
  console.error('Failed to start server:', err)
})

// Create a Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: corsOptions
})

io.on('connection', (socket) => {
  console.log('A user connected')

  socket.on('disconnect', () => {
    console.log('User disconnected')
  })

  // Example of handling a custom event
  socket.on('chat message', (msg) => {
    console.log('Message received: ' + msg)
    // Echo back the message to the same client
    socket.emit('chat message', `Echo: ${msg}`)
  })
})
