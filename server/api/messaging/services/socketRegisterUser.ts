// server/api/messaging/services/socketRegister.ts

import { type Socket } from 'socket.io'
import { type RegisterData } from 'server/types/registerData'

export const registerUser = async (data: RegisterData, socket: Socket, onlineUsers: Map<string, string>, userSockets: Map<string, string>): Promise<void> => {
  const userId = data.userId
  const existingSocketId = onlineUsers.get(userId)
  try {
    if (existingSocketId !== undefined && existingSocketId !== socket.id) {
      userSockets.delete(existingSocketId) // Remove old socket ID mapping
    }

    onlineUsers.set(userId, socket.id) // Update or add new user with current socket ID
    userSockets.set(socket.id, userId) // Store or update the reverse mapping

    console.log('\n\x1b[32m%s\x1b[0m', `Registered user: \x1b[34m${data.userId}\x1b[0m with socket id: \x1b[34m${socket.id}\x1b[0m...`)

  // check the users database for this userId, add if doesn't exist.
  } catch (error) {
  // Error handling
    if (error instanceof Error) {
      console.error('Error in registerUser:', error.message)
      socket.emit('send-message-error', { error: error.message })
    } else {
      console.error('An unknown error occurred in registerUser:', error)
      socket.emit('send-message-error', { error: 'An unknown error occurred' })
    }
  }
  console.log('\n')
}
