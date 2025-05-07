import { HttpContext } from '@adonisjs/core/http'
import ContractTemplateModel from '#models/Actions/contractemplate'
import { error } from 'node:console'
import DynamicField from '#models/champsdynamique'

export default class ContractTemplate {
  /**
   * Crée un nouveau modèle de contrat
   */
  public async create({ request, response }: HttpContext) {
    try {
      const { name, templateContent } = request.body()

      if (!name || !templateContent) {
        if (error instanceof Error) {
          return response.status(422).json({
            error: 'Le nom et le contenu du modèle sont requis',
          })
        }
      }

      const template = await ContractTemplateModel.createTemplate({ name, templateContent })
      return response.created(template)
    } catch (creationError) {
      if (creationError instanceof Error) {
        return response.status(500).json({
          error: creationError.message || 'Erreur lors de la création du modèle de contrat',
        })
      }
    }
  }

  /**
   * Récupère un modèle de contrat par ID
   */
  public async show({ params, response }: HttpContext) {
    try {
      const { id: templateId } = params
      const template = await ContractTemplateModel.getTemplateById(templateId)
      return response.ok(template)
    } catch (notfounderror) {
      if (error instanceof Error) {
        return response.status(404).json({
          error: error.message || 'Modèle de contrat non trouvé',
        })
      }
    }
  }

  /**
   * Met à jour un modèle de contrat
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      const { id: templateId } = params
      const { name, templateContent } = request.body()

      if (!name && !templateContent) {
        return response.status(422).json({
          error: 'Vous devez fournir au moins un champ à mettre à jour',
        })
      }

      const updatedTemplate = await ContractTemplateModel.updateTemplate(templateId, {
        name,
        templateContent,
      })
      return response.ok(updatedTemplate)
    } catch (updateError) {
      if (error instanceof Error) {
        return response.status(500).json({
          error: error.message || 'Erreur lors de la mise à jour du modèle de contrat',
        })
      }
    }
  }

  /**
   * Ajoute un champ dynamique à un modèle de contrat
   */
  public async addField({ params, request, response }: HttpContext) {
    try {
      const { id: templateId } = params
      const { fieldId, x, y, page } = request.body()

      if (!fieldId || x === null || y === null || page === null) {
        return response.status(422).json({
          error: 'Les données du champ dynamique sont incomplètes',
        })
      }

      const field = await DynamicField.addDynamicFieldToWorkflow(templateId, { fieldId })
      return response.ok(field)
    } catch (addingerror) {
      if (error instanceof Error) {
        return response.status(500).json({
          error: error.message || "Erreur lors de l'ajout du champ dynamique",
        })
      }
    }
  }

  /**
   * Supprime un champ dynamique d'un modèle de contrat
   */
  public async removeField({ params, request, response }: HttpContext) {
    try {
      const { id: templateId } = params
      const { fieldId } = request.body()

      if (!fieldId) {
        return response.status(422).json({
          error: "L'ID du champ est requis",
        })
      }

      await ContractTemplateModel.removeDynamicField(templateId, fieldId)
      return response.noContent()
    } catch (deleterror) {
      if (error instanceof Error) {
        return response.status(500).json({
          error: error.message || 'Erreur lors de la suppression du champ dynamique',
        })
      }
    }
  }
}
