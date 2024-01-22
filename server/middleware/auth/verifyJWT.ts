// server/middleware/auth/verifyJWT.ts

import { type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { getRequiredEnvVariable } from '../../utils/getRequiredEnvVariable'
import { type AuthenticatedRequest } from '../../types/authenticatedRequest'
import { type DecodedJWTPayload } from '../../types/decodedJWTPayload'

// The `verifyJWT` function serves as a middleware for Express.js to verify incoming JWT tokens
const verifyJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // The `authorization` header might be in either lower-case or capital-case, hence checking both
  let authHeader: string | undefined

  if (req.headers.authorization !== undefined) {
    authHeader = req.headers.authorization.trim()
  } else if (req.headers.Authorization !== undefined) {
    // Check if it's an array and take the first element
    authHeader = req.headers.Authorization[0].trim()
  } else {
    // Handle the case where neither authorization header is present
    authHeader = undefined
  }

  // In case the `authorization` header is an array, we are considering the first element only
  if (Array.isArray(authHeader)) {
    authHeader = authHeader[0]
  }

  // If there's no `authorization` header, send a 401 status
  if (authHeader === undefined) {
    console.log('\x1b[31m401 Unauthorized. Authorization header is missing.\x1b[0m')
    res.sendStatus(401)
    return
  }

  // If the `authorization` header is not a string or doesn't start with 'Bearer ', send a 401 status
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    console.log('\x1b[31m401 Unauthorized. Authorization header is not in the expected format (Bearer token).\x1b[0m')
    res.sendStatus(401)
    return
  }

  // Extract the JWT token from the `authorization` header
  const token = authHeader.split(' ')[1]

  if (token === undefined) {
    console.log('\x1b[31m403 Forbidden. JWT token is absent from the "Bearer" scheme in the Authorization header.\x1b[0m')
    res.sendStatus(403)
    return
  }

  // Verify the JWT token with the secret key
  jwt.verify(
    token,
    getRequiredEnvVariable('ACCESS_TOKEN_SECRET'),
    {}, // an empty object, which stands for VerifyOptions
    (
      err: jwt.VerifyErrors | null,
      decoded: string | jwt.JwtPayload | undefined
    ) => {
      if (err !== null) {
        // Explicitly check if `err.message` is not null and not an empty string
        const errMsg = err.message !== undefined && err.message !== '' ? `${err.name}: ${err.message}` : 'Unknown error'
        console.log(`\x1b[31m403 Forbidden. ${errMsg}.\x1b[0m`)
        return res.sendStatus(403)
      }
      if (decoded !== undefined && typeof decoded !== 'string') {
        req.decodedToken = decoded as DecodedJWTPayload
      }
      next()
    }
  )
}

export default verifyJWT
