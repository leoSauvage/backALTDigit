import { MailActionConfig } from '#types/email'

import prisma from '#lib/prisma'

export default class MailModel {
  /**
   * Met à jour la configuration de l'action d'envoi de mail
   */
  public static async updateMailActionConfig(
    actionId: string,
    newConfig: Partial<MailActionConfig>
  ): Promise<MailActionConfig> {
    const action = await prisma.action.findUnique({
      where: { id: actionId },
    })

    if (!action) {
      throw new Error('Action non trouvée')
    }

    const currentConfig = action.config as unknown as MailActionConfig
    const updatedConfig = { ...currentConfig, ...newConfig }

    await prisma.action.update({
      where: { id: actionId },
      data: { config: updatedConfig as any },
    })

    return updatedConfig
  }
}
