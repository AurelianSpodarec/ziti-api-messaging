// server/middleware/handle404.ts

import { type Request, type Response, type NextFunction } from 'express'

export const handle404 = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`\x1b[31m404 Not Found. ${req.originalUrl}\x1b[0m`)
  res.status(404).send('404 Not Found')
}
