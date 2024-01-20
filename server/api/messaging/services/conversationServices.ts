// server/api/messaging/services/conversationServices.ts

import Conversation from '../models/conversationModel'
import User from 'server/api/messaging/models/userModel'

const getConversation = async (conversationId: string): Promise<Conversation | null> => {
  try {
    const conversation = await Conversation.findOne({
      where: {
        id: conversationId
      }
    })
    return conversation
  } catch (error) {
    console.error('Error finding conversation:', error)
    return null
  }
}

const getConversations = async (userId: string): Promise<Conversation | null> => {
  try {
    const conversations = await Conversation.findOne({
      where: {
        user: userId
      }
    })

    return conversations
  } catch (error) {
    console.error('Error finding conversations:', error)
    return null
  }
}

const createConversation = async (users: string[]): Promise<Conversation | null> => {
  try {
    const conversation = await Conversation.create(
      {
        type: 'private',
        name: '',
        users
      },
      {
        include: {
          model: User
        }
      }
    )
    console.log('\x1b[34m%s\x1b[0m', 'conversation created.', conversation)

    return conversation
  } catch (error) {
    console.error('Error creating conversation', error)
    return null
  }
}

const getOrCreateConversation = async (conversationId: string, users: string[]): Promise<Conversation | null> => {
  let conversation: Conversation | null

  if (conversationId === null) {
    conversation = await createConversation(users)
  } else {
    conversation = await getConversation(conversationId)
  }

  return conversation
}

export {
  getOrCreateConversation, getConversation, getConversations, createConversation
}
