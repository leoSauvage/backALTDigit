import { HttpContext } from '@adonisjs/core/http'
import Questionnaire from '#models/Actions/questionnaire'
import { FieldType } from '@prisma/client'

export default class QuestionnaireController {

    /**
     * Met à jour la configuration du questionnaire
     */
    async updateConfig({ params, request, response }: HttpContext) {
        try {
            const { id: actionId } = params
            const data = request.only(['config'])

            const updatedConfig = await Questionnaire.updateQuestionnaireConfig(actionId, data.config)
            return response.ok(updatedConfig)
        } catch (err) {
            const error = err as Error
            return response.badRequest({
                error: error.message || 'Erreur lors de la mise à jour du questionnaire'
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
                'question',
                'description',
                'type',
                'fieldKey',
                'isRequired',
                'placeholder',
                'options',
                'validation'
            ])

            // Validation manuelle
            if (!data.question || data.question < 3) {
                return response.status(422).json({
                    errors: [{ message: 'Le texte de la question est requis et doit comporter au moins 3 caractères' }]
                })
            }

            if (!data.fieldKey) {
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

            const result = await Questionnaire.addQuestion(actionId, data)
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
                'question',
                'description',
                'type',
                'fieldKey',
                'isRequired',
                'placeholder',
                'options',
                'validation'
            ])
            data.type = FieldType.Number
            // Validation du type si présent
            if (data.type && !Object.values(FieldType).includes(data.type as FieldType)) {
                return response.status(422).json({
                    errors: [{ message: 'Le type de question est invalide' }]
                })
            }

            const result = await Questionnaire.updateQuestion(actionId, questionId, data)
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
            const result = await Questionnaire.deleteQuestion(actionId, questionId)
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

            const result = await Questionnaire.reorderQuestions(actionId, order)
            return response.ok(result)
        } catch (err) {
            const error = err as Error
            return response.badRequest({
                error: error.message || 'Erreur lors de la réorganisation des questions'
            })
        }
    }
}