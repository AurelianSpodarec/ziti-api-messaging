// server/api/messaging/services/conversationServices.ts

import Conversation from '../models/conversationModel'
import User from 'server/api/messaging/models/userModel'
import { type Socket } from 'socket.io'
import { type MessageData } from 'server/types/messageData'
import { Message } from '../models/messageModel'

const getConversation = async (conversationId: string): Promise<Conversation | null> => {
  try {
    const conversation = await Conversation.findOne({
      where: {
        id: conversationId
      }
    })
    console.log('\x1b[34m%s\x1b[0m', 'conversation found.')

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
    console.log('\x1b[34m%s\x1b[0m', 'conversationId is null. Creating new one.')
    conversation = await createConversation(users)
  } else {
    console.log('\x1b[34m%s\x1b[0m', 'conversationId exists. Finding conversation.')
    conversation = await getConversation(conversationId)
  }

  return conversation
}

const sendDirectMessage = async (data: MessageData, socket: Socket, onlineUsers: Map<string, string>): Promise<void> => {
  const { senderId, recipientId, conversationId, message } = data

  try {
    console.log('\x1b[34m%s\x1b[0m', 'About to create conversation. or not.')
    const conversation = await getOrCreateConversation(conversationId, [senderId, recipientId])
    if (conversation === null) {
      throw new Error('Conversation not found or could not be created.')
    }

    // Save message using Mongoose
    const newMessage = new Message({
      conversationId: conversation.id,
      senderId,
      recipientId,
      textContent: message
      // ... add other fields as necessary ...
    })

    console.log('\x1b[34m%s\x1b[0m', 'About to save to mongo...')
    const savedMessage = await newMessage.save()
    console.log('\x1b[34m%s\x1b[0m', 'Message saved successfully:', savedMessage.id)

    // Send message to recipient if online
    console.log('\x1b[34m%s\x1b[0m', 'Online users:', onlineUsers)
    console.log('Keys in onlineUsers:', [...onlineUsers.keys()].map(key => ({ key, type: typeof key })))
    console.log('Looking for:', recipientId, ', Type:', typeof recipientId)

    console.log('\x1b[34m%s\x1b[0m', 'looking for: ', recipientId)
    const recipientSocketId = onlineUsers.get(recipientId)
    console.log('Attempting to find socket for recipientId:', recipientId, 'Found:', recipientSocketId)
    if (recipientSocketId !== undefined) {
      console.log('\x1b[34m%s\x1b[0m', 'sending private message to: ', recipientSocketId)
      socket.to(recipientSocketId).emit('private_message', {
        senderId,
        message
      })
      console.log('\x1b[34m%s\x1b[0m', 'message sent:', message)
    } else {
      console.log('\x1b[34m%s\x1b[0m', 'recipient is offline')
    }
  } catch (error) {
    // Error handling
    if (error instanceof Error) {
      console.error('Error in sendDirectMessage:', error.message)
      socket.emit('send-message-error', { error: error.message })
    } else {
      console.error('An unknown error occurred in sendDirectMessage:', error)
      socket.emit('send-message-error', { error: 'An unknown error occurred' })
    }
  }
}

export {
  getOrCreateConversation, getConversation, getConversations, createConversation, sendDirectMessage
}
