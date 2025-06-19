import jwt from 'jsonwebtoken'
import env from '#start/env'

// Get secret key from environment variables
const SECRET_KEY = env.get('JWT_SECRET', 'my-secret-key-for-contracts')

export default class TokenService {
  /**
   * Generate a signed token for sharing a contract
   * @param contractId The ID of the contract to share
   * @param expiresInDays Number of days until the token expires
   * @returns The signed JWT token
   */
  public generateShareToken(contractId: number): string {
    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    // Create payload
    const payload = {
      type: 'contract-share',
      contractId,
      exp: Math.floor(expiresAt.getTime() / 1000), // JWT requires seconds
      iat: Math.floor(Date.now() / 1000),
    }
    // Sign and return token
    return jwt.sign(payload, SECRET_KEY)
  }
  /**
   * Verify a share token and extract the contract ID
   * @param token The JWT token to verify
   * @returns The contract ID if valid, or null if invalid
   */
  public verifyShareToken(token: string): number | null {
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as { contractId: number }
      return decoded.contractId
    } catch (error) {
      return null
    }
  }
  /**
   * Get expiration date from token
   * @param token The JWT token
   * @returns Expiration date or null if invalid
   */
  public getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.verify(token, SECRET_KEY) as { exp: number }
      return new Date(decoded.exp * 1000) // Convert seconds to milliseconds
    } catch (error) {
      return null
    }
  }
}
