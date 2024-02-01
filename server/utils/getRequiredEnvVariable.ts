// server/utils/getRequiredEnvVariable.ts

export function getRequiredEnvVariable (name: string): string {
  const value = process.env[name]
  if (value === undefined) {
    throw new Error(`${name} is not set in the environment.`)
  }
  return value
}
