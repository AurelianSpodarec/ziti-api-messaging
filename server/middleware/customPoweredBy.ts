// server/middleware/customPoweredBy.ts

import { type Request, type Response, type NextFunction } from 'express'

type CustomPoweredByMiddleware = (value: string) => (
  req: Request,
  res: Response,
  next: NextFunction
) => void

const customPoweredBy: CustomPoweredByMiddleware = (value) => {
  return (req, res, next) => {
    res.set('X-Powered-By', value)
    next()
  }
}

export default customPoweredBy
