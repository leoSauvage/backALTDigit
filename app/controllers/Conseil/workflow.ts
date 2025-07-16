import QuestionnaireModel from '#models/Actions/questionnaire'
import Category from '#models/category'
import DynamicField from '#models/champsdynamique'
import Workflow from '#models/workflow'
import { HttpContext } from '@adonisjs/core/http'

export default class WorkflowController {
  /**
   * Créer un nouveau workflow
   */
  public async create({ request, response, auth }: HttpContext) {
    try {
      const { name, description, category_id } = request.body()

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

      const workflow = await Workflow.create(name, description, category_id, userId)
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
   * Récupérer tous les workflows avec leur catégorie
   */
  public async index({ response }: HttpContext) {
    try {
      const workflowsWithCategory = await Category.getAll()
      const workflowsWithoutCategory = await Workflow.getNoCategory()
      const workflows = [[...workflowsWithCategory], workflowsWithoutCategory]
      return response.json(workflows)
    } catch (error: any) {
      return response.status(500).json({
        error: 'Failed to retrieve workflows',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async createCategory({ request, response }: HttpContext) {
    try {
      const { name } = request.body()

      // Validation des données
      if (!name) {
        return response.status(400).json({
          error: 'Name is required',
        })
      }

      const category = await Category.create(name)

      return response.status(201).json(category)
    } catch (error: any) {
      console.error('Error creating category:', error)
      return response.status(500).json({
        error: 'Failed to create category',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async updateWorkflowCategory({ request, params, response }: HttpContext) {
    try {
      const { id } = params
      const { categoryId } = request.body()

      // Validation des données
      if (!categoryId) {
        return response.status(400).json({
          error: 'Category ID is required',
        })
      }
      const updatedWorkflow = await Workflow.updateWorkflowCategory(id, categoryId)

      return response.json(updatedWorkflow)
    } catch (error: any) {
      console.error('Error updating workflow category:', error)
      return response.status(500).json({
        error: 'Failed to update workflow category',
        details: error.message || 'Unknown error',
      })
    }
  }

  /**
   * Récupérer un workflow par son ID
   */
  public async show({ params, response }: HttpContext) {
    try {
      const { id } = params

      const workflow = await Workflow.findById(id)
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
   * Mettre à jour un workflow existant avec ses étapes et actions
   */
  public async update({ request, params, response }: HttpContext) {
    try {
      const workflowId = params.id
      const workflowData = request.all()

      if (Array.isArray(workflowData.steps)) {
        workflowData.steps = workflowData.steps.map((step: any) => {
          if (Array.isArray(step.action)) {
            step.action = step.action.map((actionItem: any) => {
              const { step_id, ...rest } = actionItem
              return rest
            })
          }
          return step
        })
      }
      await Workflow.updateWorkflow(workflowId, workflowData)
      const questionData = await QuestionnaireModel.getQuestionnaireConfig(workflowId)
      await DynamicField.updateField(questionData, workflowId)
      const workflow = await Workflow.getWorkflowIncludeDynamic(workflowId)

      return response.json({
        message: 'Workflow mis à jour avec succès',
        data: workflow,
      })
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du workflow:', error)
      if (error.message === 'Workflow not found') {
        return response.status(404).json({
          message: 'Workflow non trouvé',
          error: error.message,
        })
      }
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
