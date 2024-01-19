// server/utils/socketHandlers.ts

import { type Server as SocketIOServer, type Socket } from 'socket.io'
import { type MessageData } from 'server/types/messageData'
import { type RegisterData } from 'server/types/registerData'
import { registerUser } from 'server/api/messaging/services/socketRegisterUser'
import { sendDirectMessage } from 'server/api/messaging/services/socketSendDirectMessage'
import { socketDisconnect } from 'server/api/messaging/services/socketDisconnect'

const onlineUsers = new Map<string, string>() // Maps userId to socketId
const userSockets = new Map<string, string>() // Maps socketId to userId

export const socketHandlers = (io: SocketIOServer): void => {
  io.on('connection', (socket: Socket) => {
    console.log('\n\x1b[34m%s\x1b[0m', 'User connected with socket ID: ', socket.id, '\n')

    socket.on('register', async (data: RegisterData) => {
      await registerUser(data, socket, onlineUsers, userSockets)
    })

    socket.on('private_message', async (messageData: MessageData): Promise<void> => {
      await sendDirectMessage(messageData, socket, onlineUsers)
    })

    interface MessageReadData {
      string: string
    }

    socket.on('messageDelivered', async (messageReadData: MessageReadData): Promise<void> => {
      console.log('Message delivered: ', messageReadData)
      // update message status in mongo
    })

    socket.on('disconnect', async () => {
      await socketDisconnect(socket, onlineUsers, userSockets)
    })
  })
}
