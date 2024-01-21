// server/routes.ts

import express from 'express'
import conversationsRoutes from './api/messaging/routes/conversationRoutes'
import path from 'path'

const router = express.Router()

router.use('/conversation', conversationsRoutes)

// Static files route for '/public'
router.use('/public', express.static(path.join(__dirname, 'public')))

// Default route
router.get('/', (req, res) => {
  console.log('\x1b[32m204 No Content.\x1b[0m')
  res.status(204).end()
})

export default router
