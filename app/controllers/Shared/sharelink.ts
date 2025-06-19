import { HttpContext } from '@adonisjs/core/http'
import Token from '#models/token'
import env from '#start/env'

export default class ContractSharingController {
  /**
   * Generate a temporary share link for a contract
   */
  public async generateShareLink({ request, auth, response }: HttpContext) {
    // Ensure user is authenticated
    // if (!auth.user) {
    //   return response.unauthorized({ message: 'Authentication required' })
    // }

    const { contractId } = request.only(['contractId'])

    // Validate contract existence and permissions
    try {
      //   const contract = await Contract.findOrFail(contractId)

      // Check if the user has permission to share this contract
      //   if (contract.userId !== auth.user.id) {
      //     return response.forbidden({ message: 'You do not have permission to share this contract' })
      //   }

      // Generate the share token
      const token = Token.generateShareToken(contractId)
      const expiresAt = Token.getTokenExpiration(token)

      // Create the share URL
      const baseUrl = env.get('FRONTEND_URL', 'http://localhost:3000')
      const shareUrl = `${baseUrl}/contracts/shared/${token}`

      return response.ok({
        success: true,
        shareToken: token,
        expiresAt,
        shareUrl,
      })
    } catch (error) {
      if (error.name === 'ModelNotFoundError') {
        return response.notFound({ message: 'Contract not found' })
      }

      return response.internalServerError({
        message: 'Failed to generate share link',
        error: error.message,
      })
    }
  }

  /**
   * Access a shared contract using a token (public access)
   */
  public async accessSharedContract({ params, response }: HttpContext) {
    const { token } = params

    // Verify token and get contract ID
    const contractId = Token.verifyShareToken(token)

    if (!contractId) {
      return response.forbidden({
        message: 'Invalid or expired share link',
      })
    }

    try {
      // Fetch the contract
      //   const contract = await Contract.findOrFail(contractId)

      // Return the contract data for display
      return response.ok({
        contract: {
          //   id: contract.id,
          //   title: contract.title,
          //   content: contract.content,
          // Add other non-sensitive fields here
        },
        sharedVia: 'temporary_link',
      })
    } catch (error) {
      if (error.name === 'ModelNotFoundError') {
        return response.notFound({ message: 'Contract not found' })
      }

      return response.internalServerError({
        message: 'Failed to retrieve contract',
        error: error.message,
      })
    }
  }
}
