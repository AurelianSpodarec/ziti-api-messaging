// server/middleware/consoleLogging.ts

import { type Request, type Response, type NextFunction } from 'express'

export function consoleLogging (req: Request, res: Response, next: NextFunction): void {
  if (req.path !== '/sw.js') {
    const currentDateTime = new Date().toISOString().replace('T', ' ').replace('Z', '')
    let ip: string | undefined

    const xForwardedFor = req.headers['x-forwarded-for']
    if (typeof xForwardedFor === 'string') {
      ip = xForwardedFor.split(',')[0].trim()
    } else if (Array.isArray(xForwardedFor)) {
      ip = xForwardedFor[0].trim()
    } else {
      ip = req.socket.remoteAddress
    }

    const message = `\n${currentDateTime} GMT\nIncoming request: ${req.method} ${req.path} | IP: ${ip} | Referrer: ${req.get('Referer') ?? 'N/A'}`
    const blueMessage = `\x1b[34m${message}\x1b[0m` // Blue color
    console.log(blueMessage)
  }

  next()
}
