import { QuestionnaireActionConfig, QuestionConfig } from '../../types/questionnaire.js'
import { v4 as uuidv4 } from 'uuid'

import prisma from '#lib/prisma'
import Workflow from '#models/workflow'

export default class QuestionnaireModel {
  /**
   * Met à jour la configuration d'un questionnaire
   */
  public static async updateQuestionnaireConfig(
    actionId: string,
    config: Partial<QuestionnaireActionConfig>
  ) {
    const action = await prisma.action.findUnique({
      where: { id: actionId },
    })

    if (!action) {
      throw new Error('Action non trouvée')
    }

    // Fusionner la configuration existante avec la nouvelle
    const currentConfig = action.config as unknown as QuestionnaireActionConfig
    const updatedConfig = {
      ...currentConfig,
      ...config,
    }

    // Mettre à jour l'action
    await prisma.action.update({
      where: { id: actionId },
      data: {
        config: updatedConfig as any,
      },
    })

    return updatedConfig
  }

  /**
   * Ajoute une question au questionnaire
   */
  public static async addQuestion(
    actionId: string,
    questionData: Omit<QuestionConfig, 'id' | 'order'>
  ) {
    const action = await prisma.action.findUnique({
      where: { id: actionId },
    })

    const workflowId = await Workflow.getWorkflowIdByActionId(actionId)
    if (!workflowId) {
      throw new Error('Workflow non trouvé pour cette action')
    }

    if (!action) {
      throw new Error('Action non trouvée')
    }

    const config = action.config as unknown as QuestionnaireActionConfig

    // Créer la nouvelle question
    const newQuestion: QuestionConfig = {
      id: uuidv4(),
      question: questionData.question,
      description: questionData.description,
      type: questionData.type,
      fieldKey: questionData.fieldKey,
      isRequired: questionData.isRequired,
      placeholder: questionData.placeholder,
      order: config.questions.length + 1, // Mettre à la fin
      options: questionData.options,
      validation: questionData.validation,
    }

    // Ajouter la question à la configuration
    const updatedQuestions = [...config.questions, newQuestion]

    // Mettre à jour la configuration
    await prisma.action.update({
      where: { id: actionId },
      data: {
        config: {
          ...config,
          questions: updatedQuestions,
        } as any,
      },
    })

    // Créer le DynamicField correspondant
    const dynamicField = await prisma.dynamicField.create({
      data: {
        workflow_id: workflowId,
        key: questionData.fieldKey,
        type: questionData.type,
        description: questionData.description,
      },
    })

    return {
      question: newQuestion,
      dynamicField,
    }
  }

  /**
   * Met à jour une question
   */
  public static async updateQuestion(
    actionId: string,
    questionId: string,
    questionData: Partial<QuestionConfig>
  ) {
    const action = await prisma.action.findUnique({
      where: { id: actionId },
    })

    if (!action) {
      throw new Error('Action non trouvée')
    }

    const config = action.config as unknown as QuestionnaireActionConfig

    // Trouver et mettre à jour la question
    const updatedQuestions = config.questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          ...questionData,
        }
      }
      return q
    })

    // Mettre à jour la configuration
    await prisma.action.update({
      where: { id: actionId },
      data: {
        config: {
          ...config,
          questions: updatedQuestions,
        } as any,
      },
    })

    // Mettre à jour le DynamicField si nécessaire
    const question = updatedQuestions.find((q) => q.id === questionId)

    if (question) {
      await prisma.dynamicField.updateMany({
        where: { key: question.fieldKey },
        data: {
          key: question.fieldKey,
          is_required: questionData.isRequired,
          placeholder: questionData.placeholder,
          type: questionData.type,
          updated_at: new Date(),
        },
      })
    }

    return {
      question: updatedQuestions.find((q) => q.id === questionId),
      updatedQuestions,
    }
  }

  /**
   * Supprime une question
   */
  public static async deleteQuestion(actionId: string, questionId: string) {
    const action = await prisma.action.findUnique({
      where: { id: actionId },
    })

    if (!action) {
      throw new Error('Action non trouvée')
    }

    const config = action.config as unknown as QuestionnaireActionConfig

    // Trouver la question à supprimer
    const questionToDelete = config.questions.find((q) => q.id === questionId)

    if (!questionToDelete) {
      throw new Error('Question non trouvée')
    }

    // Filtrer la question
    const updatedQuestions = config.questions.filter((q) => q.id !== questionId)

    // Réorganiser les ordres
    const reorderedQuestions = updatedQuestions.map((q, index) => ({
      ...q,
      order: index + 1,
    }))

    // Mettre à jour la configuration
    await prisma.action.update({
      where: { id: actionId },
      data: {
        config: {
          ...config,
          questions: reorderedQuestions,
        } as any,
      },
    })

    return {
      deletedQuestion: questionToDelete,
      updatedQuestions: reorderedQuestions,
    }
  }

  /**
   * Change l'ordre des questions
   */
  public static async reorderQuestions(
    actionId: string,
    questionOrder: { id: string; order: number }[]
  ) {
    const action = await prisma.action.findUnique({
      where: { id: actionId },
    })

    if (!action) {
      throw new Error('Action non trouvée')
    }

    const config = action.config as unknown as QuestionnaireActionConfig

    // Créer un map des nouveaux ordres
    const orderMap = new Map(questionOrder.map((item) => [item.id, item.order]))

    // Mettre à jour l'ordre des questions
    const updatedQuestions = config.questions
      .map((q) => ({
        ...q,
        order: orderMap.get(q.id) || q.order,
      }))
      .sort((a, b) => a.order - b.order)

    // Mettre à jour la configuration
    await prisma.action.update({
      where: { id: actionId },
      data: {
        config: {
          ...config,
          questions: updatedQuestions,
        } as any,
      },
    })

    return updatedQuestions
  }

  /**
   * Récupère la variable et le type de réponse d'un questionnaire
   */
  public static async getQuestionnaireConfig(workflowId: string) {
    const questionnaireActions = await prisma.action.findMany({
      where: {
        step: {
          workflow_id: workflowId,
        },
        type: 'QUESTIONNAIRE',
      },
    })
    const questionData = []
    for (const action of questionnaireActions) {
      const config: any = action.config
      if (!config || !Array.isArray(config.questions)) {
        continue
      }
      for (const question of config.questions) {
        // Vérifier si la question contient une variable et un type, puis les stocker
        if (question.variable && question.type) {
          questionData.push({
            variable: question.variable,
            type: question.type,
          })
        }
      }
    }
    return questionData
  }
}
