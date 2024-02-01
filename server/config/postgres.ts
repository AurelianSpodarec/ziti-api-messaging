// server/config/postgres.ts

import { getRequiredEnvVariable } from '../utils/getRequiredEnvVariable'

function parseIntSafe (value: string, defaultValue: number): number {
  const parsedValue = parseInt(value.trim(), 10)
  return isNaN(parsedValue) ? defaultValue : parsedValue
}

const messagesSqlDb = {
  HOST: getRequiredEnvVariable('MSGSQLDB_HOST'),
  PORT: parseIntSafe(getRequiredEnvVariable('MSGSQLDB_PORT'), 5432),
  USER: getRequiredEnvVariable('MSGSQLDB_USER'),
  PASSWORD: getRequiredEnvVariable('MSGSQLDB_PASSWORD'),
  DB: getRequiredEnvVariable('MSGSQLDB_DATABASE'),
  dialect: 'postgres' as const,
  pool: {
    max: parseIntSafe(getRequiredEnvVariable('DB_POOL_MAX'), 10),
    min: parseIntSafe(getRequiredEnvVariable('DB_POOL_MIN'), 0),
    acquire: parseIntSafe(getRequiredEnvVariable('DB_POOL_ACQUIRE'), 10000),
    idle: parseIntSafe(getRequiredEnvVariable('DB_POOL_IDLE'), 10000)
  }
}

export default { messagesSqlDb }
