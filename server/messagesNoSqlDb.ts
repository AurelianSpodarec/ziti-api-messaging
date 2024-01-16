// server/messagesNoSqlDb.ts

import mongoose from 'mongoose'
import { mongoUri } from './config/mongo'

const connectMongoDb = async (): Promise<typeof mongoose> => {
  try {
    // Connect to MongoDB
    const connection = await mongoose.connect(mongoUri)
    console.log('\x1b[32m%s\x1b[0m', 'MongoDB connected successfully.')
    return connection
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error connecting to MongoDB:', error)
    throw error
  }
}

export default connectMongoDb
