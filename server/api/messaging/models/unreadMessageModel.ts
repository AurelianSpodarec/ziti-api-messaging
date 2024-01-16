// server/api/messaging/models/unreadMessages.ts

import { Model, DataTypes, type Sequelize } from 'sequelize'
import type User from './userModel'
import type Conversation from './conversationModel'

// Extend Model class for TypeScript typing
class UnreadMessage extends Model {
  declare id: string
  declare userId: string
  declare conversationId: string
  declare messageId: string

  // timestamps!
  declare readonly createdAt?: Date
  declare readonly updatedAt?: Date

  // Define methods for association
  public static associate (models: { User: typeof User, Conversation: typeof Conversation }): void {
    UnreadMessage.belongsTo(models.User, { foreignKey: 'userId' })
    UnreadMessage.belongsTo(models.Conversation, { foreignKey: 'conversationId' })
  }
}

export const initUnreadMessage = (sequelize: Sequelize): typeof UnreadMessage => {
  // Initialize the model
  UnreadMessage.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID, // Assuming UUIDs for user IDs
        allowNull: false
      },
      conversationId: {
        type: DataTypes.UUID, // Adjust according to your conversation ID format
        allowNull: false
      },
      messageId: {
        type: DataTypes.UUID, // Adjust according to your message ID format
        allowNull: false
      },
      sentAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'UnreadMessage'
    }
  )

  return UnreadMessage
}

export default UnreadMessage
