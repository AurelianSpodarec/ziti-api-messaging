// server/middleware/auth/verifySocketJWT.ts

import jwt from 'jsonwebtoken'
import { getRequiredEnvVariable } from '../../utils/getRequiredEnvVariable'
import { type DecodedJWTPayload } from '../../types/decodedJWTPayload'
import { type AuthenticatedSocket } from 'server/types/authenticatedSocket'

// const verifySocketJWT = (socket: AuthenticatedSocket, next: next): void => {
const verifySocketJWT = (socket: AuthenticatedSocket, next: (err?: Error | undefined) => void): void => {
  const authHeader = socket.handshake.auth.token
  // console.log('authHeader: ', authHeader)

  if (authHeader === undefined) {
    next(new Error('Authentication error: JWT token is missing.'))
    console.log('Authentication error: JWT token is missing.')
    return
  }

  if (authHeader.startsWith('Bearer ') === undefined) {
    next(new Error('Authentication error: JWT token is not in the expected format (Bearer token).'))
    console.log('Authentication error: JWT token is not in the expected format (Bearer token).')
    return
  }

  const token: string = authHeader.split(' ')[1]

  jwt.verify(
    token,
    getRequiredEnvVariable('ACCESS_TOKEN_SECRET'),
    (err, decoded) => {
      if (err !== null) {
        next(new Error(`Authentication error: ${err.name}: ${err.message !== undefined || 'Unknown error'}`))
        return
      }

      socket.decodedToken = decoded as DecodedJWTPayload
      next()
    }
  )
}

export default verifySocketJWT
