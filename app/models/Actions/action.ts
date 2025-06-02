import { TypeActions, Prisma } from '@prisma/client'
import prisma from '#lib/prisma'

export default class Action {
  /**
   * Crée une nouvelle action de questionnaire
   */
  public static async createAction(data: {
    typeAction: TypeActions
    config: Prisma.InputJsonValue
    stepId: string
  }) {
    // Créer l'action
    const action = await prisma.action.create({
      data: {
        type: data.typeAction,
        config: data.config,
        stepActions: {
          create: {
            step_id: data.stepId,
            action_order: 1, // Par défaut, à ajuster si nécessaire
            is_required: true,
          },
        },
      },
    })

    return action
  }

  /**
   * Récupère un questionnaire par son ID
   */
  public static async getAction(actionId: string) {
    const action = await prisma.action.findUnique({
      where: { id: actionId },
    })

    if (!action) {
      throw new Error('Action non trouvée')
    }

    const config = action.config as unknown

    return {
      action,
      config,
    }
  }

  /**
   * Supprime une action
   */
  public static async deleteAction(actionId: string): Promise<void> {
    const action = await prisma.action.findUnique({
      where: { id: actionId },
    })

    if (!action) {
      throw new Error('Action non trouvée')
    }

    await prisma.action.delete({
      where: { id: actionId },
    })
  }

  /**
   * Crée un nouveau fichier
   */
  public static async createDocument(fileName: string, actionId: string) {
    const action = await prisma.action.findUnique({
      where: { id: actionId },
    })
    const fileNames = action!.file_names
    if (!fileNames) {
      throw new Error('Action non trouvée ou pas de fichiers associés')
    }
    fileNames.push(fileName)
    const updatedAction = await prisma.action.update({
      where: { id: actionId },
      data: { file_names: fileNames },
    })

    return updatedAction
  }
}
