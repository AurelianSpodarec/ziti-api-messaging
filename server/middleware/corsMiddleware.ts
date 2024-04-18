// server/middleware/corsMiddleware.ts

import { type Request, type Response, type NextFunction } from 'express'
import { getRequiredEnvVariable } from '../utils/getRequiredEnvVariable'

export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin
  const allowedDomains = getRequiredEnvVariable('ALLOWED_ORIGINS').split(',')

  // Set CORS headers for preflight and actual requests
  res.header('Access-Control-Allow-Origin', origin)
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

  if (req.method === 'OPTIONS') {
    // Preflight request; no further action needed
    res.sendStatus(204) // No Content
  } else if (process.env.NODE_ENV !== 'production' || (origin !== undefined && origin !== '' && allowedDomains.includes(origin))) {
    // Origin is allowed
    next()
  } else {
    // Origin is not allowed, log and return 403 Forbidden
    console.log(`\x1b[31m403 Forbidden. Blocked origin: ${origin}\x1b[0m`)
    res.status(403).send('403 Forbidden: Origin not permitted by CORS policy')
  }
}
