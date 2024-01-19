// server/api/blog/controllers/conversationsController.ts

import { type Request, type Response } from 'express'
import { getConversations, getConversation, createConversation } from '../services/conversationServices'
import { type UniqueConstraintError } from 'sequelize'
import { type AuthenticatedRequest } from 'server/types/authenticatedRequest'

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

export async function conversation (req: Request, res: Response): Promise<void> {
  const slug = req.params.slug

  try {
    const conversation = await getConversation(slug)
    if (conversation === null) {
      console.log('\x1b[31m404 Not Found. Conversation not found.\x1b[0m')
      res.sendStatus(404)
      return
    }
    console.log('\x1b[32m200 OK. Sending conversation data.\x1b[0m')
    res.json(conversation)
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
