// server/api/messaging/routes/conversationRoutes.ts

import { Router } from 'express'
import { conversation, conversations, unread } from '../controllers/ConversationsController'
import verifyJWT from '../../../middleware/auth/verifyJWT'
import { type AuthenticatedRequest } from 'server/types/authenticatedRequest'

const conversationsRoutes = Router()

conversationsRoutes.get('/', verifyJWT, (req, res, next) => {
  conversations(req as AuthenticatedRequest, res).catch(next)
})

conversationsRoutes.get('/unread', verifyJWT, (req, res, next) => {
  unread(req as AuthenticatedRequest, res).catch(next)
})

conversationsRoutes.get('/:conversationId', verifyJWT, (req, res, next) => {
  conversation(req as AuthenticatedRequest, res).catch(next)
})

export default conversationsRoutes
