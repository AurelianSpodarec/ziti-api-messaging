// server/messagesNoSqlDb.ts

import mongoose from 'mongoose'
import { mongoUri } from './config/mongo'

const initMongo = async (): Promise<typeof mongoose> => {
  const hiddenCredentialsUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//xxxx:xxxx@')
  console.log('\x1b[34m%s\x1b[0m', `Connecting to MongoDB at ${hiddenCredentialsUri}...`)

  try {
    // Connect to MongoDB
    const connection = await mongoose.connect(mongoUri)
    console.log('\x1b[32m%s\x1b[0m', 'Connected successfully to MongoDB.')
    return connection
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error connecting to MongoDB:', error)
    throw error
  }
}

export default initMongo
