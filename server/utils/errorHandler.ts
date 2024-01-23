// server/utils/errorHandler.ts
import { type Response } from 'express'

export function handleError (res: Response, error: Error, message: string, statusCode: number = 500): void {
  console.error(error.message)
  res.status(statusCode).json({ error: message })
}
