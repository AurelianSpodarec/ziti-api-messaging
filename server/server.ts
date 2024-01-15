import fs from 'fs'
import dotenv from 'dotenv'
import express, { type Request, type Response } from 'express'
import { getRequiredEnvVariable } from './utils/getRequiredEnvVariable'

if (process.env.NODE_ENV === 'development') {
  if (fs.existsSync('.env')) {
    dotenv.config()
  } else {
    throw new Error('.env file not found')
  }
}

const server = express()

server.get('/', (req: Request, res: Response) => {
  res.send('Hello World with TypeScript!')
})

const host = getRequiredEnvVariable('HOST')
const port = getRequiredEnvVariable('PORT')

server.listen(port, () => {
  const message = `[server]: Server is running at http://${host}:${port}`
  const greenMessage = `\x1b[32m${message}\x1b[0m`
  console.log(greenMessage)
})
