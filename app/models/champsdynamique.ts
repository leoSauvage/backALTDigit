import prisma from '#lib/prisma'
import { WorkflowField } from '@prisma/client'

export default class DynamicField {
  /**
   * Récupère tous les champs dynamiques associés à un workflow donné
   * @param workflowId - L'ID du workflow
   * @returns Une liste de DynamicField
   */
  public static async getFieldsByWorkflowId(workflowId: string): Promise<DynamicField[]> {
    return prisma.dynamicField.findMany({
      where: {
        workflow_field: {
          some: {
            workflow_id: workflowId,
          },
        },
      },
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
   * Ajoute un champ dynamique à un workflow donné
   * @param workflowId - L'ID du workflow
   * @param fieldData - Les données du champ à ajouter
   * @returns Le WorkflowField créé
   */
  static async addDynamicFieldToWorkflow(
    workflowId: string,
    fieldData: { fieldId: string }
  ): Promise<WorkflowField> {
    return prisma.workflowField.create({
      data: {
        field_id: fieldData.fieldId,
        workflow_id: workflowId,
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

  /**
   * Récupère tous les champs dynamiques associés à un contrat donné
   * @param contractId - L'ID du contrat
   * @returns Une liste de DynamicField
   */
  public static async getFieldsByContractId(contractId: string): Promise<DynamicField[]> {
    return prisma.dynamicField.findMany({
      where: { contract_id: contractId },
    })
  }
}
