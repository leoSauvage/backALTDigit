import { HttpContext } from '@adonisjs/core/http'
import Workflow from '#models/workflow'

export default class WorkflowController {
  /**
   * Créer un nouveau workflow
   */
  public async create({ request, response, auth }: HttpContext) {
    try {
      const { name, description } = request.body()

      // Validation des données
      if (!name) {
        return response.status(400).json({
          error: 'Name is required',
        })
      }

      // Récupérer l'ID de l'utilisateur connecté si disponible
      let userId: string | undefined
      try {
        const user = await auth.authenticate()
        userId = user.$attributes.id
      } catch (authError) {
        // L'utilisateur n'est pas authentifié, on continue sans ID utilisateur
      }

      const workflow = await Workflow.create(name, description, userId)

      return response.status(201).json(workflow)
    } catch (error: any) {
      console.error('Error creating workflow:', error)
      return response.status(500).json({
        error: 'Failed to create workflow',
        details: error.message || 'Unknown error',
      })
    }
  }

  /**
   * Récupérer tous les workflows avec pagination
   */
  public async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)

      const workflows = await Workflow.getAll(Number(page), Number(limit))

      return response.json(workflows)
    } catch (error: any) {
      return response.status(500).json({
        error: 'Failed to retrieve workflows',
        details: error.message || 'Unknown error',
      })
    }
  }

  /**
   * Récupérer un workflow par son ID
   */
  public async show({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const includeSteps = request.input('includeSteps', false)

      const workflow = await Workflow.findById(id, includeSteps === 'true' || includeSteps === true)

      if (!workflow) {
        return response.status(404).json({ error: 'Workflow not found' })
      }

      return response.json(workflow)
    } catch (error: any) {
      return response.status(500).json({
        error: 'Failed to retrieve workflow',
        details: error.message || 'Unknown error',
      })
    }
  }

  /**
   * Mettre à jour un workflow
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const { name, file_name } = request.body()

      // Valider qu'au moins un champ est fourni
      if (!name && !file_name) {
        return response.status(400).json({
          error: 'At least one field (name or file_name) must be provided',
        })
      }

      const updatedWorkflow = await Workflow.update(id, {
        name,
        fileName: file_name,
      })

      return response.json(updatedWorkflow)
    } catch (error: any) {
      return response.status(error.message === 'Workflow not found' ? 404 : 500).json({
        error: error.message || 'Failed to update workflow',
      })
    }
  }

  public async updateAttributes({ request, params, response }: HttpContextContract) {
    try {
      // Récupère l'identifiant du workflow depuis l'URL
      const workflowId = params.id

      // Récupère les données à mettre à jour depuis le corps de la requête
      const updates = request.only([
        'name',
        'description',
        'file_name',
        'template_content',
        'steps',
        'workflowfield',
      ])

      // Trouve le workflow à mettre à jour
      const workflow = await Workflow.updateAttributes(workflowId, updates)

      // Retourne le workflow mis à jour
      return response.ok({
        message: 'Workflow mis à jour avec succès',
        data: workflow,
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour du workflow :', error)
      return response.status(500).json({
        message: 'Une erreur est survenue lors de la mise à jour du workflow',
        error: error.message,
      })
    }
  }

  /**
   * Supprimer un workflow
   */
  public async delete({ params, response }: HttpContext) {
    try {
      const { id } = params

      const result = await Workflow.delete(id)

      return response.json(result)
    } catch (error: any) {
      if (error.message === 'Workflow not found') {
        return response.status(404).json({ error: 'Workflow not found' })
      }

      if (error.message === 'Cannot delete workflow that is being used by contracts') {
        return response.status(400).json({
          error: 'Cannot delete workflow that is being used by contracts',
        })
      }

      return response.status(500).json({
        error: 'Failed to delete workflow',
        details: error.message || 'Unknown error',
      })
    }
  }
}
