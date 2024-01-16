// server/messagesSqlDb.ts

import { Sequelize } from 'sequelize'
import config from './config/postgres'

// Messaging
import { initUser } from './api/messaging/models/userModel'
import { initConversation } from './api/messaging/models/conversationModel'
import { initUnreadMessage } from './api/messaging/models/unreadMessageModel'

// Initialize Sequelize instance
const sequelizeMsg = new Sequelize(
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

// console.log("\nsequelizeMsg: ", sequelizeMsg.config);

// Initialize the models
// Message
const User = initUser(sequelizeMsg)
const Conversation = initConversation(sequelizeMsg)
const UnreadMessage = initUnreadMessage(sequelizeMsg)

// Define associations (order is important)
User.associate({ Conversation, UnreadMessage })
Conversation.associate({ User, UnreadMessage })
UnreadMessage.associate({ User, Conversation })

// Initialize the db object
const initPostgres: any = {
  Sequelize,
  sequelizeMsg,
  User,
  Conversation
}

export default initPostgres
