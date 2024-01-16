// server/config/mongo.ts

import { getRequiredEnvVariable } from 'server/utils/getRequiredEnvVariable'

export const mongoUri = getRequiredEnvVariable('MONGO_URI')
