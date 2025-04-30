import { HttpContext } from '@adonisjs/core/http'
import Step from '#models/etape'

export default class StepController {
    /**
     * Créer une nouvelle étape dans un workflow
     */
    public async create({ request, response }: HttpContext) {
        try {
            const { workflow_id, name, step } = request.body()

            const newStep = await Step.create(workflow_id, name, step)

            return response.status(201).json(newStep)
        } catch (error: any) {
            console.error('Error creating step:', error)
            return response.status(error.message === 'Workflow not found' ? 404 : 500).json({
                error: error.message || 'Failed to create step'
            })
        }
    }

    /**
     * Récupérer toutes les étapes d'un workflow
     */
    public async getByWorkflow({ params, response }: HttpContext) {
        try {
            const { workflow_id } = params

            const steps = await Step.getAllByWorkflow(workflow_id)

            return response.json(steps)
        } catch (error: any) {
            return response.status(500).json({
                error: 'Failed to retrieve steps',
                details: error.message
            })
        }
    }

    /**
     * Récupérer une étape par son ID
     */
    public async show({ params, response }: HttpContext) {
        try {
            const { id } = params

            const step = await Step.findById(id)

            if (!step) {
                return response.status(404).json({ error: 'Step not found' })
            }

            return response.json(step)
        } catch (error: any) {
            return response.status(500).json({
                error: 'Failed to retrieve step',
                details: error.message
            })
        }
    }

    /**
     * Mettre à jour une étape
     */
    public async update({ params, request, response }: HttpContext) {
        try {
            const { id } = params
            const { name } = request.body()

            const updatedStep = await Step.update(id, name)

            return response.json(updatedStep)
        } catch (error: any) {
            return response.status(error.message === 'Step not found' ? 404 : 500).json({
                error: error.message || 'Failed to update step'
            })
        }
    }

    /**
     * Réorganiser les étapes d'un workflow
     */
    public async reorder({ request, response }: HttpContext) {
        try {
            const { steps } = request.body()

            // steps doit être un tableau d'objets { id: string, step: number }
            if (!Array.isArray(steps)) {
                return response.status(400).json({ error: 'Steps must be an array' })
            }

            const updatedSteps = await Step.reorder(steps)

            return response.json(updatedSteps)
        } catch (error: any) {
            console.error('Error reordering steps:', error)
            return response.status(500).json({
                error: 'Failed to reorder steps',
                details: error.message
            })
        }
    }

    /**
     * Supprimer une étape
     */
    public async delete({ params, response }: HttpContext) {
        try {
            const { id } = params

            const result = await Step.delete(id)

            return response.json(result)
        } catch (error: any) {
            return response.status(error.message === 'Step not found' ? 404 : 500).json({
                error: error.message || 'Failed to delete step'
            })
        }
    }
}