import { MailActionConfig } from '#types/email'
import { PrismaClient } from '@prisma/client'



export default class MailModel {
    constructor(private prisma: PrismaClient) { }

    /**
     * Met à jour la configuration de l'action d'envoi de mail
     */
    async updateMailActionConfig(actionId: string, newConfig: Partial<MailActionConfig>): Promise<MailActionConfig> {
        const action = await this.prisma.action.findUnique({
            where: { id: actionId }
        })

        if (!action) {
            throw new Error('Action non trouvée')
        }

        const currentConfig = action.config as unknown as MailActionConfig
        const updatedConfig = { ...currentConfig, ...newConfig }

        await this.prisma.action.update({
            where: { id: actionId },
            data: { config: updatedConfig as any }
        })

        return updatedConfig
    }

    
}