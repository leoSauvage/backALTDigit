import {  DynamicField } from '@prisma/client'
import prisma from '#lib/prisma'

export default class DynamicFieldModel {

    /**
     * Récupère tous les champs dynamiques associés à un workflow donné
     * @param workflowId - L'ID du workflow
     * @returns Une liste de DynamicField
     */
    public async getFieldsByWorkflowId(workflowId: string): Promise<DynamicField[]> {
        return this.prisma.dynamicField.findMany({
            where: { workflow_id: workflowId },
        })
    }

    /**
     * Recherche un champ dynamique par son ID
     * @param id - L'ID du champ dynamique
     * @returns Le champ dynamique correspondant, ou null s'il n'existe pas
     */
    public async getFieldById(id: string): Promise<DynamicField | null> {
        return this.prisma.dynamicField.findUnique({
            where: { id },
        })
    }

    /**
     * Met à jour un champ dynamique
     * @param id - L'ID du champ dynamique à mettre à jour
     * @param data - Les données à mettre à jour
     * @returns Le champ dynamique mis à jour
     */
    public async updateField(id: string, data: Partial<DynamicField>): Promise<DynamicField> {
        return this.prisma.dynamicField.update({
            where: { id },
            data,
        })
    }

    /**
     * Supprime un champ dynamique
     * @param id - L'ID du champ dynamique à supprimer
     * @returns Le champ dynamique supprimé
     */
    public async deleteField(id: string): Promise<DynamicField> {
        return this.prisma.dynamicField.delete({
            where: { id },
        })
    }
}