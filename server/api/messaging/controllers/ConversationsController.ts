// server/api/blog/controllers/conversationsController.ts

import { type Response, type NextFunction } from 'express'
import { getConversations, getConversation, createConversation, getUnread } from '../services/conversationServices'
import { type AuthenticatedRequest } from 'server/types/authenticatedRequest'
import { parseQueryParam } from 'server/utils/parseQueryParam'

export async function conversations (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.decodedToken.id
    const conversations = await getConversations(userId)
    if (conversations === null) {
      console.log('\x1b[31m404 Not Found. No conversations found.\x1b[0m')
      res.sendStatus(404)
      return
    }
    console.log('\x1b[32m200 OK. Sending conversations data.\x1b[0m')
    res.status(200).json(conversations)
  } catch (error) {
    next(error)
  }
}

export async function conversation (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.decodedToken.id
    const conversationId = req.params.conversationId

    let page = parseQueryParam(req.query.page as string, 1)
    page = Math.max(page, 1) // Ensure page is at least 1

    let limit = parseQueryParam(req.query.limit as string, 20)
    limit = Math.min(Math.max(limit, 1), 20) // Ensure limit is between 1 and 20

    const conversation = await getConversation(userId, conversationId, page, limit)
    if (conversation === null) {
      console.log('\x1b[31m404 Not Found. Conversation not found.\x1b[0m')
      res.sendStatus(404)
      return
    }
    console.log('\x1b[32m200 OK. Sending conversation data.\x1b[0m')
    res.status(200).json(conversation)
  } catch (error) {
    next(error)
  }
}

export async function createConversations (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.decodedToken.id
    const recipientId = req.body
    const newConversation = await createConversation([userId, recipientId] as string[])
    res.status(201).json(newConversation)
  } catch (error) {
    next(error)
  }
}

export async function unread (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.decodedToken.id
    const unread = await getUnread(userId)
    if (unread === null) {
      console.log('\x1b[31m404 Not Found. Unread not found.\x1b[0m')
      res.sendStatus(404)
      return
    }
    console.log('\x1b[32m200 OK. Sending unread data.\x1b[0m')
    res.status(200).json(unread)
  } catch (error) {
    next(error)
  }
}
