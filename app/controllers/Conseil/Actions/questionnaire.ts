import { HttpContext } from '@adonisjs/core/http'
import Questionnaire from '#models/Actions/questionnaire'
import prisma from '#lib/prisma'
import { FieldType } from '@prisma/client'

export default class QuestionnaireController {
    private questionnaireModel: Questionnaire
    constructor() {
        this.questionnaireModel = new Questionnaire(prisma)
    }

    /**
     * Crée une nouvelle action de questionnaire
     */
    async create({ request, response }: HttpContext) {
        try {
            const data = request.only(['title','workflowId', 'stepId'])
            if (!data.title || data.title.length < 3) {
                return response.status(422).json({
                    errors: [{ message: 'Le titre est requis et doit comporter au moins 3 caractères' }]
                })
            }

            if (!data.workflowId) {
                return response.status(422).json({
                    errors: [{ message: 'L\'ID du workflow est requis' }]
                })
            }

            if (!data.stepId) {
                return response.status(422).json({
                    errors: [{ message: 'L\'ID de l\'étape est requis' }]
                })
            }

            const action = await this.questionnaireModel.createQuestionnaireAction(data)
            return response.created(action)
        } catch (err) {
            const error = err as Error
            return response.badRequest({
                error: error.message || 'Erreur lors de la création du questionnaire'
            })
        }
    }

    /**
     * Met à jour la configuration du questionnaire
     */
    async updateConfig({ params, request, response }: HttpContext) {
        try {
            const { id: actionId } = params
            const data = request.only(['title', 'nextActionId', 'storeResultPath'])

            const updatedConfig = await this.questionnaireModel.updateQuestionnaireConfig(actionId, data)
            return response.ok(updatedConfig)
        } catch (err) {
            const error = err as Error
            return response.badRequest({
                error: error.message || 'Erreur lors de la mise à jour du questionnaire'
            })
        }
    }

    /**
     * Récupère un questionnaire
     */
    async show({ params, response }: HttpContext) {
        try {
            const { id: actionId } = params
            const questionnaire = await this.questionnaireModel.getQuestionnaire(actionId)
            return response.ok(questionnaire)
        } catch (err) {
            const error = err as Error
            return response.notFound({
                error: error.message || 'Questionnaire non trouvé'
            })
        }
    }

    /**
     * Ajoute une question
     */
    async addQuestion({ params, request, response }: HttpContext) {
        try {
            const { id: actionId } = params
            const data = request.only([
                'text',
                'type',
                'fieldKey',
                'isRequired',
                'placeholder',
                'options',
                'validation'
            ])

            // Validation manuelle
            if (!data.text || data.text.length < 3) {
                return response.status(422).json({
                    errors: [{ message: 'Le texte de la question est requis et doit comporter au moins 3 caractères' }]
                })
            }

            if (!data.fieldKey || data.fieldKey.length < 3) {
                return response.status(422).json({
                    errors: [{ message: 'La clé du champ est requise et doit comporter au moins 3 caractères' }]
                })
            }

            // Valider que le type est valide
            if (!data.type || !Object.values(FieldType).includes(data.type as FieldType)) {
                return response.status(422).json({
                    errors: [{ message: 'Le type de question est invalide' }]
                })
            }

            const result = await this.questionnaireModel.addQuestion(actionId, data)
            return response.created(result)
        } catch (err) {
            const error = err as Error
            return response.badRequest({
                error: error.message || 'Erreur lors de l\'ajout de la question'
            })
        }
    }

    /**
     * Met à jour une question
     */
    async updateQuestion({ params, request, response }: HttpContext) {
        try {
            const { id: actionId, questionId } = params
            const data = request.only([
                'text',
                'type',
                'fieldKey',
                'isRequired',
                'placeholder',
                'options',
                'validation'
            ])

            // Validation du type si présent
            if (data.type && !Object.values(FieldType).includes(data.type as FieldType)) {
                return response.status(422).json({
                    errors: [{ message: 'Le type de question est invalide' }]
                })
            }

            const result = await this.questionnaireModel.updateQuestion(actionId, questionId, data)
            return response.ok(result)
        } catch (err) {
            const error = err as Error
            return response.badRequest({
                error: error.message || 'Erreur lors de la mise à jour de la question'
            })
        }
    }

    /**
     * Supprime une question
     */
    async deleteQuestion({ params, response }: HttpContext) {
        try {
            const { id: actionId, questionId } = params
            const result = await this.questionnaireModel.deleteQuestion(actionId, questionId)
            return response.ok(result)
        } catch (err) {
            const error = err as Error
            return response.badRequest({
                error: error.message || 'Erreur lors de la suppression de la question'
            })
        }
    }

    /**
     * Réorganise les questions
     */
    async reorderQuestions({ params, request, response }: HttpContext) {
        try {
            const { id: actionId } = params
            const { order } = request.only(['order'])

            if (!Array.isArray(order)) {
                return response.status(422).json({
                    errors: [{ message: 'Le format de l\'ordre des questions est invalide' }]
                })
            }

            const result = await this.questionnaireModel.reorderQuestions(actionId, order)
            return response.ok(result)
        } catch (err) {
            const error = err as Error
            return response.badRequest({
                error: error.message || 'Erreur lors de la réorganisation des questions'
            })
        }
    }
}