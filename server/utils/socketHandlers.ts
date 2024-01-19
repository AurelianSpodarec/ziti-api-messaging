// server/utils/socketHandlers.ts

import { type Server as SocketIOServer, type Socket } from 'socket.io'
import { sendDirectMessage } from 'server/api/messaging/services/conversationServices'
import { type MessageData } from 'server/types/messageData'

const onlineUsers = new Map<string, string>() // Maps userId to socketId
const userSockets = new Map<string, string>() // Maps socketId to userId

export const socketHandlers = (io: SocketIOServer): void => {
  io.on('connection', (socket: Socket) => {
    console.log('\x1b[34m%s\x1b[0m', 'A user connected', socket.id)

    socket.on('disconnect', () => {
      console.log('\x1b[34m%s\x1b[0m', 'User disconnected', socket.id)
      const userId = userSockets.get(socket.id) // Get the userId associated with the disconnected socket
      if (userId !== undefined) {
        onlineUsers.delete(userId) // Delete the user from onlineUsers using the userId
        userSockets.delete(socket.id) // Delete the socketId from userSockets
        console.log('\x1b[34m%s\x1b[0m', 'online users: ', onlineUsers)
      } else {
        console.log('\x1b[34m%s\x1b[0m', 'User not found in userSockets', socket.id)
      }
    })

    // Define an interface for the expected data structure
    interface RegisterData {
      userId: string
    }

    socket.on('register', (data: RegisterData) => {
      const userId = data.userId // No need to cast to string as it's already expected to be a string
      console.log('Registering user:', userId)
      const existingSocketId = onlineUsers.get(userId)

      if (existingSocketId !== undefined && existingSocketId !== socket.id) {
        userSockets.delete(existingSocketId) // Remove old socket ID mapping
      }

      console.log('\x1b[34m%s\x1b[0m', `User with ID ${userId} added or updated`)
      onlineUsers.set(userId, socket.id) // Update or add new user with current socket ID
      userSockets.set(socket.id, userId) // Store or update the reverse mapping

      console.log('\x1b[34m%s\x1b[0m', 'online users: ', onlineUsers)
    })

    socket.on('private_message', async (messageData: MessageData): Promise<void> => {
      console.log('\x1b[34m%s\x1b[0m', '\nMessage received')
      // Send the message to the recipient if they are online
      await sendDirectMessage(messageData, socket, onlineUsers)
    })
  })
}
