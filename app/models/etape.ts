import prisma from '#lib/prisma'
import type { Step as StepType } from '@prisma/client'

export default class Step {
  /**
   * Crée une nouvelle étape dans un workflow
   */
  public static async create(workflowId: string, name: string, stepOrder?: number): Promise<StepType> {
    // Vérifier si le workflow existe
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    })

    if (!workflow) {
      throw new Error('Workflow not found')
    }

    // Déterminer l'ordre de l'étape si non fourni
    if (!stepOrder) {
      const lastStep = await prisma.step.findFirst({
        where: { workflow_id: workflowId },
        orderBy: { step: 'desc' }
      })
      stepOrder = lastStep ? lastStep.step + 1 : 1
    } else {
      // Si un ordre spécifique est fourni, décaler les étapes existantes
      await prisma.step.updateMany({
        where: { 
          workflow_id: workflowId,
          step: { gte: stepOrder }
        },
        data: { step: { increment: 1 } }
      })
    }

    // Créer la nouvelle étape
    return await prisma.step.create({
      data: {
        workflow_id: workflowId,
        name,
        step: stepOrder
      }
    })
  }

  /**
   * Récupère toutes les étapes d'un workflow avec leurs actions
   */
  public static async getAllByWorkflow(workflowId: string) {
    return await prisma.step.findMany({
      where: { workflow_id: workflowId },
      orderBy: { step: 'asc' },
      include: {
        stepActions: {
          include: {
            action: true
          },
          orderBy: {
            action_order: 'asc'
          }
        }
      }
    })
  }

  /**
   * Récupère une étape par son ID
   */
  public static async findById(id: string) {
    return await prisma.step.findUnique({
      where: { id },
      include: {
        stepActions: {
          include: {
            action: true
          },
          orderBy: {
            action_order: 'asc'
          }
        }
      }
    })
  }

  /**
   * Met à jour une étape
   */
  public static async update(id: string, name: string) {
    // Vérifier si l'étape existe
    const existingStep = await prisma.step.findUnique({
      where: { id }
    })

    if (!existingStep) {
      throw new Error('Step not found')
    }

    return await prisma.step.update({
      where: { id },
      data: { name }
    })
  }

  /**
   * Réorganise les étapes d'un workflow
   */
  public static async reorder(steps: { id: string, step: number }[]) {
    await prisma.$transaction(async (tx) => {
      for (const item of steps) {
        await tx.step.update({
          where: { id: item.id },
          data: { step: item.step }
        })
      }
    })
    
    // Récupérer les étapes mises à jour
    if (steps.length > 0) {
      const firstStep = await prisma.step.findUnique({
        where: { id: steps[0].id },
        select: { workflow_id: true }
      })
      
      if (firstStep) {
        return await prisma.step.findMany({
          where: { workflow_id: firstStep.workflow_id },
          orderBy: { step: 'asc' }
        })
      }
    }
    
    return []
  }

  /**
   * Supprime une étape et réorganise les étapes suivantes
   */
  public static async delete(id: string) {
    // Vérifier si l'étape existe
    const step = await prisma.step.findUnique({
      where: { id }
    })

    if (!step) {
      throw new Error('Step not found')
    }

    // Supprimer d'abord toutes les actions liées à cette étape
    await prisma.stepAction.deleteMany({
      where: { step_id: id }
    })

    // Supprimer l'étape
    await prisma.step.delete({
      where: { id }
    })

    // Réorganiser les étapes restantes
    await prisma.step.updateMany({
      where: {
        workflow_id: step.workflow_id,
        step: { gt: step.step }
      },
      data: { step: { decrement: 1 } }
    })
    
    return { success: true, message: 'Step deleted successfully' }
  }
}