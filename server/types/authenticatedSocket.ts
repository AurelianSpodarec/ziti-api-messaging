// server/types/authenticatedSocket.ts

import { type Socket } from 'socket.io'
import { type DecodedJWTPayload } from './decodedJWTPayload'

export type AuthenticatedSocket = Socket & {
  decodedToken?: DecodedJWTPayload
}
