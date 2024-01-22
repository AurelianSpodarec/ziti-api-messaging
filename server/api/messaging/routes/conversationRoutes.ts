// server/api/messaging/routes/conversationRoutes.ts

import { Router } from 'express'
import { conversation, conversations, unread } from '../controllers/ConversationsController'

const conversationsRoutes = Router()

conversationsRoutes.get('/', (req, res, next) => {
  conversations(req, res).catch(next)
})

conversationsRoutes.get('/unread', (req, res, next) => {
  unread(req, res).catch(next)
})

conversationsRoutes.get('/:conversationId', (req, res, next) => {
  conversation(req, res).catch(next)
})

export default conversationsRoutes
