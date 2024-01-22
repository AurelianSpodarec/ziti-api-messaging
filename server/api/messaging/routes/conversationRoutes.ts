// server/api/messaging/routes/conversationRoutes.ts

import { Router } from 'express'
import { conversation, conversations, unread } from '../controllers/ConversationsController'
import verifyJWT from '../../../middleware/auth/verifyJWT'

const conversationsRoutes = Router()

conversationsRoutes.get('/', verifyJWT, (req, res, next) => {
  conversations(req, res).catch(next)
})

conversationsRoutes.get('/unread', verifyJWT, (req, res, next) => {
  unread(req, res).catch(next)
})

conversationsRoutes.get('/:conversationId', verifyJWT, (req, res, next) => {
  conversation(req, res).catch(next)
})

export default conversationsRoutes
