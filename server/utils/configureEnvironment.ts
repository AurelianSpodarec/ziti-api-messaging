// server/utils/configureEnvironment.ts

import fs from 'fs'
import dotenv from 'dotenv'

if (process.env.NODE_ENV === 'development') {
  if (fs.existsSync('.env')) {
    dotenv.config()
  } else {
    throw new Error('.env file not found')
  }
}
