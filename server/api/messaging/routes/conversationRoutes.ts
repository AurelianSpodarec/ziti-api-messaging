// server/api/messaging/routes/conversationRoutes.ts

import { Router, type Request, type RequestHandler, type Response, type NextFunction } from 'express'
import { type AuthenticatedRequest } from '../../../types/authenticatedRequest'
import { conversation, conversations, unread } from '../controllers/ConversationsController'
import verifyJWT from '../../../middleware/auth/verifyJWT'
import { errorHandler } from '../../../middleware/errorHandler'

const conversationsRoutes = Router()

const ROUTE_CONVERSATIONS = '/'
const ROUTE_UNREAD = '/unread'
const ROUTE_CONVERSATION_ID = '/:conversationId'

async function handleConversations (req: Request, res: Response, next: NextFunction): Promise<void> {
  const authReq = req as AuthenticatedRequest
  try {
    await conversations(authReq, res, next)
  } catch (error) {
    next(error)
  }
}

async function handleUnread (req: Request, res: Response, next: NextFunction): Promise<void> {
  const authReq = req as AuthenticatedRequest
  try {
    await unread(authReq, res, next)
  } catch (error) {
    next(error)
  }
}

async function handleConversation (req: Request, res: Response, next: NextFunction): Promise<void> {
  const authReq = req as AuthenticatedRequest
  try {
    await conversation(authReq, res, next)
  } catch (error) {
    next(error)
  }
}

function asyncHandler (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}

conversationsRoutes.get(ROUTE_CONVERSATIONS, verifyJWT, asyncHandler(handleConversations))
conversationsRoutes.get(ROUTE_UNREAD, verifyJWT, asyncHandler(handleUnread))
conversationsRoutes.get(ROUTE_CONVERSATION_ID, verifyJWT, asyncHandler(handleConversation))

conversationsRoutes.use(errorHandler)

export default conversationsRoutes
