// server/utils/getRequiredEnvVariable.ts

import fs from 'fs'
import dotenv from 'dotenv'

if (getRequiredEnvVariable('NODE_ENV') === 'development') {
  if (fs.existsSync('.env')) {
    dotenv.config()
  } else {
    throw new Error('.env file not found')
  }
}

export function getRequiredEnvVariable (name: string): string {
  const value = process.env[name]
  if (value === undefined) {
    throw new Error(`${name} is not set in the environment.`)
  }
  return value
}
