import { HttpContext } from '@adonisjs/core/http'
import Action from '#models/Actions/action'
import prisma from '#lib/prisma'
import { Prisma, TypeActions } from '@prisma/client'

export default class ActionController {
    private actionModel: Action
    constructor() {
        this.actionModel = new Action(prisma)
    }

    /**
     * Crée une nouvelle action 
     */
    async create({ request, response }: HttpContext) {
        try {
            const data = request.body() as { typeAction: TypeActions; config: Prisma.InputJsonValue; stepId: string }

            if (!data.stepId) {
                return response.status(422).json({
                    errors: [{ message: 'L\'ID de l\'étape est requis' }]
                })
            }

            const action = await this.actionModel.createAction(data)
            return response.created(action)
        } catch (err) {
            const error = err as Error
            return response.badRequest({
                error: error.message || 'Erreur lors de la création de l\'action'
            })
        }
    }
    
    /**
     * Récupère une action
     */
    async show({ params, response }: HttpContext) {
        try {
            const { id: actionId } = params
            const questionnaire = await this.actionModel.getAction(actionId)
            return response.ok(questionnaire)
        } catch (err) {
            const error = err as Error
            return response.notFound({
                error: error.message || 'Action non trouvé'
            })
        }
    }
    
    /**
     * Supprime une action 
     */
    public async delete({ params, response }: HttpContext) {
        try {
            const { id: actionId } = params

            await this.actionModel.deleteAction(actionId)
            return response.noContent()
        } catch (error) {
            if (error instanceof Error) {
                return response.status(400).json({
                    error: error.message || "Erreur lors de la suppression de l'action"
                })
            }
            return response.status(500).json({
                error: "Une erreur inconnue est survenue lors de la suppression"
            })
        }
    }
}