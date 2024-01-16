// server/api/messaging/models/conversationModel.ts

import { Model, DataTypes, type Sequelize } from 'sequelize'
import type User from './userModel'
import type UnreadMessage from './unreadMessageModel'

// Extend Model class for TypeScript typing
class Conversation extends Model {
  declare id?: string
  declare name?: string
  declare status?: string
  declare type?: string

  // timestamps!
  declare readonly createdAt?: Date
  declare readonly updatedAt?: Date

  public static associate (models: { User: typeof User, UnreadMessage: typeof UnreadMessage }): void {
    Conversation.belongsToMany(models.User, { through: 'Users_Conversations' })
    Conversation.hasMany(models.UnreadMessage, { foreignKey: 'conversationId' })
  }
}

export const initConversation = (sequelize: Sequelize): typeof Conversation => {
  // Initialize the model
  Conversation.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM,
        values: ['active', 'archived', 'deleted'],
        defaultValue: 'active',
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM,
        values: ['private', 'group'],
        defaultValue: 'private',
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Conversation'
    }
  )

  return Conversation
}

export default Conversation
