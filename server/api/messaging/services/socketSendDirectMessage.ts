// server/api/messaging/services/socketSendDirectMessage.ts

import { type Socket } from 'socket.io'
import { type MessageData } from 'server/types/messageData'
import { Message } from '../models/messageModel'
import { getOrCreateConversation } from './conversationServices'

export const sendDirectMessage = async (data: MessageData, socket: Socket, onlineUsers: Map<string, string>): Promise<void> => {
  console.log('\x1b[34m%s\x1b[0m', '\nMessage received')

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
    const messageId = savedMessage.id
    console.log('\x1b[34m%s\x1b[0m', 'Message saved successfully:', messageId)

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
        messageId,
        senderId,
        message
      })
      console.log('\x1b[34m%s\x1b[0m', 'message sent:', message)
    } else {
      console.log('\x1b[34m%s\x1b[0m', 'recipient is offline')
      // store in unreadMessages table
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
  console.log('\n')
}
