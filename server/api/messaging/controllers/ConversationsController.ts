// server/api/blog/controllers/conversationsController.ts

import { type Request, type Response } from 'express'
import { getConversations, getConversation, createConversation, getUnread } from '../services/conversationServices'
import { type UniqueConstraintError } from 'sequelize'
import { type AuthenticatedRequest } from 'server/types/authenticatedRequest'
import { parseQueryParam } from 'server/utils/parseQueryParam'

export async function conversations (req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (req.decodedToken === undefined) {
      res.status(401).json({ message: 'Invalid token.' })
    } else {
      // Extract the user ID from the decoded token
      const userId = req.decodedToken.id

      // Get a list of conversations
      const conversations = await getConversations(userId)
      if (conversations === null) {
        console.log('\x1b[31m404 Not Found. No conversations found.\x1b[0m')
        res.sendStatus(404)
        return
      }
      console.log('\x1b[32m200 OK. Sending conversations data.\x1b[0m')
      res.json(conversations)
    }
  } catch (e) {
    const error = e as Error
    console.error(error.message)
    res.status(500).send({ error: 'Problem fetching conversations.' })
  }
}

export async function conversation (req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (req.decodedToken === undefined) {
      res.status(401).json({ message: 'Invalid token.' })
    } else {
      // Extract the user ID from the decoded token
      const userId = req.decodedToken.id
      const conversationId = req.params.conversationId
      const page = parseQueryParam(req.query.page as string, 1)
      const limit = parseQueryParam(req.query.limit as string, 20)

      const conversation = await getConversation(userId, conversationId, page, limit)
      if (conversation === null) {
        console.log('\x1b[31m404 Not Found. Conversation not found.\x1b[0m')
        res.sendStatus(404)
        return
      }
      console.log('\x1b[32m200 OK. Sending conversation data.\x1b[0m')
      res.json(conversation)
    }
  } catch (e) {
    const error = e as Error
    console.error(error.message)
    res.status(500).send({ error: 'Problem fetching conversations.' })
  }
}

export async function createConversations (req: AuthenticatedRequest, res: Response): Promise<void> {
  const otherUserId = req.body

  try {
    if (req.decodedToken === undefined) {
      res.status(401).json({ message: 'Invalid token.' })
    } else {
      // Extract the user ID from the decoded token
      const userId = req.decodedToken.id

      const newConversation = await createConversation([userId, otherUserId] as string[])
      res.status(201).json(newConversation)
    }
  } catch (e) {
    const error = e as UniqueConstraintError
    console.error(error.message)

    if (error.name === 'SequelizeUniqueConstraintError') {
      const specificError = error.errors?.[0]?.message !== undefined && error.errors?.[0]?.message !== '' ? error.errors?.[0]?.message : 'Unique constraint error'
      res.status(409).send({ error: specificError })
    } else {
      res.status(500).send({ error: 'Problem creating conversation.' })
    }
  }
}

export async function unread (req: Request, res: Response): Promise<void> {
  const userId = req.query.u as string

  try {
    const unread = await getUnread(userId)
    if (unread === null) {
      console.log('\x1b[31m404 Not Found. Unread not found.\x1b[0m')
      res.sendStatus(404)
      return
    }
    console.log('\x1b[32m200 OK. Sending unread data.\x1b[0m')
    res.json(unread)
  } catch (e) {
    const error = e as Error
    console.error(error.message)
    res.status(500).send({ error: 'Problem fetching conversations.' })
  }
}
