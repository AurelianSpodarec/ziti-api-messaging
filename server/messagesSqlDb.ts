// server/messagesSqlDb.ts

import { Sequelize } from 'sequelize'
import config from './config/postgres'

// Messaging
import { initUser } from './api/messaging/models/userModel'
import { initConversation } from './api/messaging/models/conversationModel'

// Initialize Sequelize instance
const sequelizeAuth = new Sequelize(
  config.messagesSqlDb.DB,
  config.messagesSqlDb.USER,
  config.messagesSqlDb.PASSWORD,
  {
    host: config.messagesSqlDb.HOST,
    port: config.messagesSqlDb.PORT,
    dialect: config.messagesSqlDb.dialect,
    pool: {
      max: config.messagesSqlDb.pool.max,
      min: config.messagesSqlDb.pool.min,
      acquire: config.messagesSqlDb.pool.acquire,
      idle: config.messagesSqlDb.pool.idle
    }
  }
)

// console.log("\nsequelizeAuth: ", sequelizeAuth.config);

// Initialize the models
// Auth
const User = initUser(sequelizeAuth)
const Conversation = initConversation(sequelizeAuth)

// Define associations (order is important)
User.associate({ Conversation })
Conversation.associate({ User })

// Initialize the db object
const messagesSqlDb: any = {
  Sequelize,
  sequelizeAuth,
  User,
  Conversation
}

export default messagesSqlDb
