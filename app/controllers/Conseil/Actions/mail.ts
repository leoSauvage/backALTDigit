import { MailActionConfig } from '#types/email'
import { HttpContext } from '@adonisjs/core/http'
import Mail from '#models/Actions/mail'

export default class MailController {
  /**
   * Met à jour la configuration d'une action d'envoi de mail
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      const { id: actionId } = params
      const newConfig = request.body() as Partial<MailActionConfig>

      const updatedConfig = await Mail.updateMailActionConfig(actionId, newConfig)
      return response.ok(updatedConfig)
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({
          error: error.message || "Erreur lors de la mise à jour de l'action",
        })
      }
      return response.status(500).json({
        error: 'Une erreur inconnue est survenue lors de la mise à jour',
      })
    }
  }
}
