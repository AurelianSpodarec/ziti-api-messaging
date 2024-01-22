// server/api/messaging/services/conversationServices.ts

import Conversation from '../models/conversationModel'
import User from 'server/api/messaging/models/userModel'
import { Message, type IMessage } from '../models/messageModel'

const getConversation = async (
  conversationId: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  conversation: Conversation | null
  messages: IMessage[] | null
  totalPages: number
  totalMessages: number
}> => {
  try {
    const conversation = await Conversation.findOne({
      where: { id: conversationId }
    })
    if (conversation === null) return { conversation: null, messages: null, totalPages: 0, totalMessages: 0 }

    const totalMessages = await Message.countDocuments({ conversationId })
    const totalPages = Math.ceil(totalMessages / limit)

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 }) // For ascending order (oldest first), use { createdAt: 1 }. For descending order (newest first), use { createdAt: -1 }.
      .skip((page - 1) * limit)
      .limit(limit)

    return { conversation, messages, totalPages, totalMessages }
  } catch (error) {
    console.error('Error finding conversation:', error)
    return { conversation: null, messages: null, totalPages: 0, totalMessages: 0 }
  }
}

const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const user = await User.findOne({
      where: { id: userId },
      include: [Conversation]
    })

    const conversations = user?.dataValues.Conversations ?? []

    return conversations
  } catch (error) {
    console.error('Error finding conversations:', error)
    return []
  }
}

const createConversation = async (users: string[]): Promise<{ conversation: Conversation | null, messages: IMessage[] | null }> => {
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

    return { conversation, messages: null }
  } catch (error) {
    console.error('Error creating conversation', error)
    return { conversation: null, messages: null }
  }
}

const getOrCreateConversation = async (
  conversationId: string,
  users: string[]
): Promise<{
  conversation: Conversation | null
  messages: IMessage[] | null
}> => {
  let conversation: { conversation: Conversation | null, messages: IMessage[] | null }
  if (conversationId === null || conversationId === undefined || conversationId === '') {
    conversation = await createConversation(users)
  } else {
    conversation = await getConversation(conversationId)
  }

  return conversation
}

// Function to get unread message count for each conversation for a user
const getUnread = async (userId: string): Promise<Record<string, number>> => {
  try {
    // Use optional chaining to avoid null checks
    const userConversations = await getConversations(userId)

    // Return early if no conversations found
    if (userConversations === undefined) {
      return {}
    }

    const unreadCounts: Record<string, number> = {}

    for (const conversation of userConversations) {
      try {
        // Use optional chaining for conversation and id access
        const conversationId = conversation?.id

        if (conversationId === undefined) {
          continue // Skip iteration if conversation id is undefined
        }

        const unreadCount = await Message.countDocuments({
          conversationId,
          status: { $ne: 'Read' },
          senderId: { $ne: userId }
        }).exec()

        unreadCounts[conversationId] = unreadCount
      } catch (error) {
        console.error(
          `Error getting unread messages for conversation ${conversation.id}`,
          error
        )
      }
    }

    return unreadCounts
  } catch (error) {
    console.error('Error in getUnread:', error)
    return {}
  }
}

export {
  getOrCreateConversation, getConversation, getConversations, createConversation, getUnread
}
