// server/middleware/consoleLogging.ts

import { type Request, type Response, type NextFunction } from 'express'

export function consoleLogging (req: Request, res: Response, next: NextFunction): void {
  // Add a conditional check to exclude certain routes
  if (req.path !== '/sw.js') {
    const currentDateTime = new Date().toISOString().replace('T', ' ').replace('Z', '')
    const forwardedIpsStr = req.header('x-forwarded-for')
    let ip

    if (forwardedIpsStr !== undefined) {
      const forwardedIps = forwardedIpsStr.split(',')
      if (forwardedIps.length > 1) {
        // Get the second IP from the left
        ip = forwardedIps[1].trim()
      } else {
        // If there's only one IP, use it
        ip = forwardedIps[0].trim()
      }
    } else {
      ip = req.socket.remoteAddress
    }
    const message = `\n${currentDateTime} GMT\nIncoming request: ${req.method} ${req.path} | IP: ${ip} | Referrer: ${req.get('Referrer') ?? 'N/A'}`
    const blueMessage = `\x1b[34m${message}\x1b[0m` // \x1b[34m sets the color to blue, \x1b[0m resets it
    console.log(blueMessage)
  }

  next()
}
