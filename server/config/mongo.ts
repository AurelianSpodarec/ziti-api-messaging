// server/config/mongo.ts

import { getRequiredEnvVariable } from '@utils/getRequiredEnvVariable'

const mongoDbUser = getRequiredEnvVariable('MSGMONGODB_MESSAGES_USERNAME')
const mongoDbPassword = getRequiredEnvVariable('MSGMONGODB_MESSAGES_PASSWORD')
const mongoDbHost = getRequiredEnvVariable('MSGMONGODB_HOST')
const mongoDbPort = getRequiredEnvVariable('MSGMONGODB_PORT')
const mongoDbDatabase = getRequiredEnvVariable('MSGMONGODB_DATABASE')

export const mongoUri = `mongodb://${mongoDbUser}:${mongoDbPassword}@${mongoDbHost}:${mongoDbPort}/${mongoDbDatabase}`
