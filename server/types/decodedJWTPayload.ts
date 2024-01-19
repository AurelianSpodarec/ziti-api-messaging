// server/types/decodedJWTPayload.ts

export interface DecodedJWTPayload {
  id: string
  email: string | null
  phone: string | null
  roles: string[]
}
