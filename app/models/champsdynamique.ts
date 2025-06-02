import prisma from '#lib/prisma'
import { FieldType, WorkflowField } from '@prisma/client'

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
  public static async updateField(
    questionData: Array<{ variable: string; type: string }> = [],
    workflowId: string
  ) {
    if (questionData.length > 0) {
      for (const data of questionData) {
        // Vérifier l'existence d'un dynamicField pour cette variable
        let existingField = await prisma.dynamicField.findFirst({
          where: {
            key: data.variable,
            workflow_field: {
              some: {
                workflow_id: workflowId,
              },
            },
          },
        })
        if (!existingField) {
          // Créer un nouveau champ
          const fieldType = await DynamicField.getFieldTypeFromString(data.type)
          existingField = await prisma.dynamicField.create({
            data: {
              key: data.variable,
              type: fieldType,
            },
          })
        }
        // Vérifier si on a déjà workflowField qui relie ce champ au workflow
        const existingRelation = await prisma.workflowField.findUnique({
          where: {
            field_id_workflow_id: {
              field_id: existingField.id,
              workflow_id: workflowId,
            },
          },
        })
        // Si non relié encore, on crée le lien
        if (!existingRelation) {
          await prisma.workflowField.create({
            data: {
              workflow_id: workflowId,
              field_id: existingField.id,
            },
          })
        }
      }
    }
  }

  /**
   * Retourne la valeur de FieldType correspondante
   * à la chaîne d'entrée. Si aucune correspondance
   * n'est trouvée, on renvoie FieldType.Text par défaut.
   */
  public static async getFieldTypeFromString(input: string): Promise<FieldType> {
    const fieldTypeMap: Record<string, FieldType> = {
      'Text': FieldType.Text,
      'Long Text': FieldType.LongText,
      'Number': FieldType.Number,
      'Date': FieldType.Date,
      'Temps': FieldType.Time,
      'Select': FieldType.Select,
      'Multi Select': FieldType.MultiSelect,
      'Radio': FieldType.Radio,
      'Currency': FieldType.Currency,
      'Email': FieldType.Email,
      'Phone': FieldType.Phone,
      'Adress': FieldType.Address,
      'File': FieldType.File,
      'Country': FieldType.Country,
      'Nationalité': FieldType.Nationality,
      'Company': FieldType.TypeOfCompany,
      'Contact': FieldType.Contact,
    }
    return fieldTypeMap[input] ?? FieldType.Text
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
