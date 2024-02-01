// server/utils/socketHandlers.ts

import { type Server as SocketIOServer } from 'socket.io'
import { type MessageData } from 'server/types/messageData'
import { type RegisterData } from 'server/types/registerData'
import { type MessageStatusData } from 'server/types/messageStatusData'
import { registerUser } from 'server/api/messaging/services/socketRegisterUser'
import { sendDirectMessage } from 'server/api/messaging/services/socketSendDirectMessage'
import { socketDisconnect } from 'server/api/messaging/services/socketDisconnect'
import { setMessageStatus } from 'server/api/messaging/services/socketSetMessageStatus'
import { handleActivity } from 'server/api/messaging/services/socketHandleActivity'
import verifySocketJWT from 'server/middleware/auth/verifySocketJWT'
import { type AuthenticatedSocket } from 'server/types/authenticatedSocket'

const onlineUsers = new Map<string, string>() // Maps userId to socketId
const userSockets = new Map<string, string>() // Maps socketId to userId

export const socketHandlers = (io: SocketIOServer): void => {
  io.use(verifySocketJWT) // JWT verification middleware

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log('\x1b[34m%s\x1b[0m', 'User connected with socket ID: ', socket.id)

    if (socket.decodedToken === undefined) {
      console.error('Authentication error: Invalid token.')
      socket.disconnect()
      return
    }

    const userId: string = socket.decodedToken.id

    socket.on('register', async (data: RegisterData) => {
      await registerUser(data, socket, onlineUsers, userSockets)
    })

    socket.on('private_message', async (messageData: MessageData): Promise<void> => {
      await sendDirectMessage(userId, messageData, socket, onlineUsers)
    })

    socket.on('messageStatus', async (messageStatusData: MessageStatusData): Promise<void> => {
      await setMessageStatus(messageStatusData, socket, onlineUsers, io)
    })

    socket.on('activity', async (data) => {
      await handleActivity(data, socket, onlineUsers, io)
    })

    socket.on('disconnect', async () => {
      await socketDisconnect(socket, onlineUsers, userSockets)
    })
  })
}
