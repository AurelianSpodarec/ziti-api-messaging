// server/api/messaging/services/socketHandleActivity.ts

import { type Server as SocketIOServer, type Socket } from 'socket.io'

export const handleActivity = async (
  data: any,
  socket: Socket,
  onlineUsers: Map<string, string>,
  io: SocketIOServer
): Promise<void> => {
  try {
    const { userId, recipientId } = data // Assuming data contains recipientId
    const recipientSocketId = onlineUsers.get(recipientId as string)
    if (recipientSocketId !== undefined) {
      io.to(recipientSocketId).emit('activity', userId)
    } else {
      // console.log(`Recipient (${recipientId}) is not online.`)
    }
  } catch (error) {
    // Error handling
    if (error instanceof Error) {
      console.error('Error in handleActivity:', error.message)
      socket.emit('handle-activoty-error', { error: error.message })
    } else {
      console.error('An unknown error occurred in handleActivity:', error)
      socket.emit('handle-activity-error', { error: 'An unknown error occurred' })
    }
  }
}
