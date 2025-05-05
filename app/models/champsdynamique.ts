
import prisma from '#lib/prisma'

export default class DynamicField {

    /**
     * Récupère tous les champs dynamiques associés à un workflow donné
     * @param workflowId - L'ID du workflow
     * @returns Une liste de DynamicField
     */
    public static async getFieldsByWorkflowId(workflowId: string): Promise<DynamicField[]> {
        return prisma.dynamicField.findMany({
            where: { workflow_id: workflowId },
        })
    }

    /**
     * Recherche un champ dynamique par son ID
     * @param id - L'ID du champ dynamique
     * @returns Le champ dynamique correspondant, ou null s'il n'existe pas
     */
    public static async getFieldById(id: string): Promise<DynamicField | null> {
        return prisma.dynamicField.findUnique({
            where: { id },
        })
    }

    /**
     * Ajoute un champ dynamique à un modèle de contrat
     */
    static async addDynamicField(templateId: string, fieldData: { fieldId: string; x: number; y: number; page: number }): Promise<TemplateField> {
        return prisma.templateField.create({
            data: {
                field_id: fieldData.fieldId,
                template_id: templateId,
                x_position: fieldData.x,
                y_position: fieldData.y,
                page_number: fieldData.page,
            },
        })
    }

    /**
     * Met à jour un champ dynamique
     * @param id - L'ID du champ dynamique à mettre à jour
     * @param data - Les données à mettre à jour
     * @returns Le champ dynamique mis à jour
     */
    public static async updateField(id: string, data: Partial<DynamicField>): Promise<DynamicField> {
        return prisma.dynamicField.update({
            where: { id },
            data,
        })
    }

    /**
     * Supprime un champ dynamique
     * @param id - L'ID du champ dynamique à supprimer
     * @returns Le champ dynamique supprimé
     */
    public static async deleteField(id: string): Promise<DynamicField> {
        return prisma.dynamicField.delete({
            where: { id },
        })
    }
}