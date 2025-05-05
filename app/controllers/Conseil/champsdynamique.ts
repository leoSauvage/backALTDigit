import { HttpContext } from '@adonisjs/core/http'
import DynamicField from '#models/champsdynamique'

export default class DynamicFieldController {
    /**
     * Récupère les champs dynamiques pour un workflow donné
     */
    public async getFields({ params, response }: HttpContext) {
        try {
            const { workflowId } = params
            const fields = await DynamicField.getFieldsByWorkflowId(workflowId)
            return response.ok(fields)
        } catch (error) {
            return response.status(500).json({
                error: 'Une erreur est survenue lors de la récupération des champs dynamiques',
            })
        }
    }

    /**
     * Met à jour un champ dynamique
     */
    public async updateField({ params, request, response }: HttpContext) {
        try {
            const { id } = params
            const data = request.body()

            const updatedField = await DynamicField.updateField(id, data)
            return response.ok(updatedField)
        } catch (error) {
            return response.status(400).json({
                error: 'Une erreur est survenue lors de la mise à jour du champ dynamique',
            })
        }
    }

    /**
     * Supprime un champ dynamique
     */
    public async deleteField({ params, response }: HttpContext) {
        try {
            const { id } = params
            const deletedField = await DynamicField.deleteField(id)
            return response.ok(deletedField)
        } catch (error) {
            return response.status(400).json({
                error: 'Une erreur est survenue lors de la suppression du champ dynamique',
            })
        }
    }
}