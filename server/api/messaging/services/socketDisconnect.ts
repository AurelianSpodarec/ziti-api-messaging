// server/api/messaging/services/socketDisconnect.ts

import { type Socket } from 'socket.io'

export const socketDisconnect = async (socket: Socket, onlineUsers: Map<string, string>, userSockets: Map<string, string>): Promise<void> => {
  console.log('\x1b[34m%s\x1b[0m', 'User disconnected', socket.id)
  const userId = userSockets.get(socket.id) // Get the userId associated with the disconnected socket
  if (userId !== undefined) {
    onlineUsers.delete(userId) // Delete the user from onlineUsers using the userId
    userSockets.delete(socket.id) // Delete the socketId from userSockets
    console.log('\x1b[34m%s\x1b[0m', 'online users: ', onlineUsers)
  } else {
    console.log('\x1b[34m%s\x1b[0m', 'User not found in userSockets', socket.id)
  }
}
