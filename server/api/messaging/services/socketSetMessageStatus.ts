// server/api/messaging/services/socketSetMessageStatus.ts

import { type Server as SocketIOServer, type Socket } from 'socket.io'
import { type MessageStatusData } from 'server/types/messageStatusData'
import { Message } from '../models/messageModel' // Ensure this path is correct

export const setMessageStatus = async (
  messageStatusData: MessageStatusData,
  socket: Socket,
  onlineUsers: Map<string, string>,
  io: SocketIOServer): Promise<void> => {
  try {
    const { messageId, status } = messageStatusData // Destructure the required fields

    // Validate the incoming data (optional, but recommended)
    if (messageId === undefined || status === undefined) {
      throw new Error('Invalid message status data')
    }

    console.log('Updating status for:', messageId, 'to:', status)

    // Find the message by ID and update its status
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { status },
      { new: true } // Return the updated document
    )

    if (updatedMessage === null) {
      throw new Error('Message not found')
    }

    if (updatedMessage !== null) {
      // Find the sender's socket ID
      const senderSocketId = onlineUsers.get(updatedMessage.senderId)
      if (senderSocketId !== undefined) {
        // Emit the update to the sender
        io.to(senderSocketId).emit('message-status-updated', { messageId, status })
      }
    }

    console.log('Message status updated successfully.')
  } catch (error) {
    // Error handling
    if (error instanceof Error) {
      console.error('Error in setMessageStatus:', error.message)
      socket.emit('set-message-status-error', { error: error.message })
    } else {
      console.error('An unknown error occurred in setMessageStatus:', error)
      socket.emit('set-message-status-error', { error: 'An unknown error occurred' })
    }
  }
  console.log('\n')
}
