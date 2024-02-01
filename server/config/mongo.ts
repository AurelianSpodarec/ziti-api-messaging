// server/config/mongo.ts

import { getRequiredEnvVariable } from 'server/utils/getRequiredEnvVariable'

const mongoDbUser = getRequiredEnvVariable('MONGODB_MESSAGES_USERNAME')
const mongoDbPassword = getRequiredEnvVariable('MONGODB_MESSAGES_PASSWORD')
const mongoDbHost = getRequiredEnvVariable('MONGODB_HOST')
const mongoDbPort = getRequiredEnvVariable('MONGODB_PORT')
const mongoDbDatabase = getRequiredEnvVariable('MONGODB_DATABASE')

export const mongoUri = `mongodb://${mongoDbUser}:${mongoDbPassword}@${mongoDbHost}:${mongoDbPort}/${mongoDbDatabase}`
