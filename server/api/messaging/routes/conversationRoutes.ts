// server/api/messaging/routes/conversationRoutes.ts

import { Router } from 'express'
import { conversation } from '../controllers/ConversationsController'

const conversationsRoutes = Router()

conversationsRoutes.get('/', (req, res, next) => {
  conversation(req, res).catch(next)
})

export default conversationsRoutes
