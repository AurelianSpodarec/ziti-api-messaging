// server/api/messaging/services/socketSendDirectMessage.ts

import { type Socket } from 'socket.io'
import { type MessageData } from 'server/types/messageData'
import { Message } from '../models/messageModel'
import { getOrCreateConversation } from './conversationServices'

export const sendDirectMessage = async (data: MessageData, socket: Socket, onlineUsers: Map<string, string>): Promise<void> => {
  console.log('\x1b[34m%s\x1b[0m', 'Message received')

  const { senderId, recipientId, conversationId, message } = data

  try {
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

    const savedMessage = await newMessage.save()
    const messageId: string = savedMessage.id
    console.log('\x1b[34m%s\x1b[0m', 'Message saved to MongoDB:', messageId)

    // Emit sent-message-id to the sender
    socket.emit('sent-message-id', { messageId })

    // Send message to recipient if online
    const recipientSocketId = onlineUsers.get(recipientId)
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
