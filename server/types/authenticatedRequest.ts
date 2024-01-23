// server/types/authenticatedRequests.ts

import { type Request } from 'express'
import { type DecodedJWTPayload } from './decodedJWTPayload'

export type AuthenticatedRequest = Request & {
  decodedToken: DecodedJWTPayload
}
