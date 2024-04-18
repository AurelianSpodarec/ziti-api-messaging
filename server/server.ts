// server/server.ts

// Ensure environment is configured before importing any other modules
import './utils/configureEnvironment'

import { createServer } from 'http'
import express from 'express'
import { Server as SocketIOServer } from 'socket.io'
import initMongo from './messagesMongo'
import initPostgres from './messagesPostgres'
import { getRequiredEnvVariable } from './utils/getRequiredEnvVariable'
import { socketHandlers } from './utils/socketHandlers'
import routes from './routes'
import customPoweredBy from './middleware/customPoweredBy'
import { consoleLogging } from './middleware/consoleLogging'
import { errorHandler } from './middleware/errorHandler'
import { handle404 } from './middleware/handle404'
import { initSentry, sentryErrorHandler } from '@utils/sentry'
import { corsMiddleware } from './middleware/corsMiddleware'

const app = express()
const httpServer = createServer(app)

// Initialize Sentry
initSentry(app)

// Console logging middleware
app.use(consoleLogging)

// server.disable('x-powered-by');
app.use(customPoweredBy(getRequiredEnvVariable('POWERED_BY')))

// Apply custom CORS middleware
app.use(corsMiddleware)

// Standard DB Processing
initPostgres.sequelizeMsg
  .sync({ force: false })
  .then(() => {
    console.log('\x1b[32mSynced messagingDB.\x1b[0m')
  })
  .catch((err: Error) => {
    console.log('\x1b[31mFailed to sync messagingDB: ' + err.message + '\x1b[0m')
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

// Routes
app.use('/api/v1', routes)

// 404 logging
app.use(handle404)

const host = getRequiredEnvVariable('HOST')
const port = getRequiredEnvVariable('PORT')

httpServer.listen(port, () => {
  const message = `[server]: Server is running at http://${host}:${port}`
  const greenMessage = `\x1b[32m${message}\x1b[0m`
  console.log(greenMessage)
}).on('error', (err) => {
  console.error('Failed to start server:', err)
})

// CORS options for Socket.IO
const allowedDomains = getRequiredEnvVariable('ALLOWED_ORIGINS').split(',');
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (process.env.NODE_ENV !== 'production') {
      // Allow any origin in non-production environments, including no origin
      console.log(`\x1b[32mAllowed origin (non-production): ${origin || 'No Origin'}\x1b[0m`);
      callback(null, true);
    } else {
      // In production, check if the origin is in the allowed list
      if (origin && allowedDomains.includes(origin)) {
        console.log(`\x1b[32mAllowed origin: ${origin}\x1b[0m`);
        callback(null, true);
      } else {
        // Block origins not in the allowed list, including no origin
        console.log(`\x1b[31mBlocked origin: ${origin || 'No Origin'}\x1b[0m`);
        callback(new Error('403: Origin not permitted by CORS policy'), false);
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
};

// Create a Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: corsOptions
})

// Setup Socket.IO event handlers
socketHandlers(io)

// Use Sentry's error handler
app.use(sentryErrorHandler())

// Error handler
app.use(errorHandler)
