// server/api/messaging/models/userModel.ts

import { Model, DataTypes, type Sequelize } from 'sequelize'
import type Conversation from './conversationModel'
import type UnreadMessage from './unreadMessageModel'

// Extend Model class for TypeScript typing
class User extends Model {
  declare id?: string

  // timestamps!
  declare readonly createdAt?: Date
  declare readonly updatedAt?: Date

  public Conversations?: Conversation[]

  public static associate (models: {
    Conversation: typeof Conversation
    UnreadMessage: typeof UnreadMessage
  }): void {
    User.belongsToMany(models.Conversation, { through: 'Users_Conversations' })
    User.hasMany(models.UnreadMessage, { foreignKey: 'userId' })
  }
}

export const initUser = (sequelize: Sequelize): typeof User => {
  // Initialize the model
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true
      }
    },
    {
      sequelize,
      modelName: 'User'
    }
  )

  return User
}

export default User
