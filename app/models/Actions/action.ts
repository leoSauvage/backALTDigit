import { inject } from '@adonisjs/core'
import { PrismaClient, TypeActions, Prisma } from '@prisma/client'

@inject()
export default class ActionModel {
    constructor(private prisma: PrismaClient) { }

    /**
     * Crée une nouvelle action de questionnaire
     */
    async createAction(data: {
        config: Prisma.InputJsonValue,
        stepId: string,
        typeAction : TypeActions
    }) {

        // Créer l'action
        const action = await this.prisma.action.create({
            data: {
                type: data.typeAction,
                config: data.config,
                stepActions: {
                    create: {
                        step_id: data.stepId,
                        action_order: 1, // Par défaut, à ajuster si nécessaire
                        is_required: true
                    }
                }
            }
        })

        return action
    }

    /**
     * Récupère un questionnaire par son ID
     */
    async getAction(actionId: string) {
        const action = await this.prisma.action.findUnique({
            where: { id: actionId }
        })

        if (!action) {
            throw new Error('Action non trouvée')
        }

        const config = action.config as unknown 


        return {
            action,
            config
        }
    }

    /**
     * Supprime une action 
     */
    async deleteAction(actionId: string): Promise<void> {
        const action = await this.prisma.action.findUnique({
            where: { id: actionId }
        })

        if (!action) {
            throw new Error('Action non trouvée')
        }

        await this.prisma.action.delete({
            where: { id: actionId }
        })
    }
}