import prisma from '#lib/prisma'
import { TypeActions, Workflow as WorkflowModel } from '@prisma/client'
import QuestionnaireModel from './Actions/questionnaire.js'
import DynamicField from './champsdynamique.js'

export default class Workflow {
  /**
   * Crée un nouveau workflow
   * @param name Nom du workflow
   * @param fileName Nom du fichier/dossier associé
   * @param createdById ID de l'utilisateur qui crée le workflow (optionnel)
   */
  public static async create(
    name: string,
    description: string,
    createdById?: string
  ): Promise<WorkflowModel> {
    return await prisma.workflow.create({
      data: {
        name,
        description,
        created_by_id: createdById,
      },
    })
  }

  /**
   * Récupère tous les workflows avec pagination
   * @param page Numéro de page
   * @param limit Nombre d'éléments par page
   */
  public static async getAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        skip,
        take: limit,
        include: {
          created_by: {
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              steps: true,
              //contracts: true
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.workflow.count(),
    ])

    return {
      data: workflows,
      pagination: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    }
  }

  public static async findById(id: string) {
    // Get the workflow with all its steps and actions in a single query
    const workflow = await prisma.workflow.findUnique({
      where: {
        id: id,
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc',
          },
          include: {
            action: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        workflowfield: {
          include: {
            dynamic_field: true,
          },
        },
      },
    })

    if (!workflow) {
      throw new Error(`Workflow with ID ${id} not found`)
    }
    return workflow
  }
  /**
   * Retourne l'ID du workflow auquel appartient l'action donnée.
   * @param actionId ID de l'action (UUID)
   * @returns L'UUID du workflow, ou null si non trouvé.
   */
  public static async getWorkflowIdByActionId(actionId: string): Promise<string | null> {
    // On récupère l'enregistrement StepAction, en incluant ses relations
    const stepAction = await prisma.action.findFirst({
      where: { id: actionId },
      include: {
        step: {
          // on inclut la relation `step`
          include: {
            workflow: true, // et à l’intérieur, on inclut `workflow`
          },
        },
      },
    })

    // Si pas trouvé, on retourne null
    if (!stepAction || !stepAction.step) {
      return null
    }

    // stepAction.step.workflow est à présent défini
    return stepAction.step.workflow.id
  }

  public static async typeActionSwitch(type: string) {
    switch (type) {
      case 'QUESTIONNAIRE':
        return TypeActions.QUESTIONNAIRE
      case 'Notification':
        return TypeActions.NOTIFIER
      case 'ENVOYER_MAIL':
        return TypeActions.ENVOYER_MAIL
      case 'GENERER':
        return TypeActions.GENERER
      case 'SIGNER':
        return TypeActions.SIGNER
      case 'VALIDER':
        return TypeActions.VALIDER
      default:
        return TypeActions.AUTRE
    }
  }

  /**
   * Updates an existing workflow with new data, including steps and actions.
   * - Checks if the workflow exists and then performs inserts, updates, or deletions as needed.
   * - Uses a transaction to ensure all changes succeed together or are rolled back if any fail.
   */
  public static async updateWorkflow(id: string, data: any) {
    // Fetch the current workflow from the database (including related workflow fields).
    const existingWorkflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        workflowfield: true,
      },
    })

    // If the workflow doesn't exist, throw an error.
    if (!existingWorkflow) {
      throw new Error('Workflow not found')
    }

    // Destructure the data into steps, workflowfield, and the rest of the workflow data.
    const { steps, workflowfield, ...workflowData } = data

    // Begin a database transaction for the update.
    return await prisma.$transaction(
      async (tx) => {
        // 1. Update the main Workflow record:
        await tx.workflow.update({
          where: { id },
          data: {
            ...workflowData,
            updated_at: new Date(),
          },
        })

        // 2. Handle the steps if provided.
        if (steps && Array.isArray(steps)) {
          // 2.1 Retrieve existing step IDs for this workflow.
          const existingSteps = await tx.step.findMany({
            where: { workflow_id: id },
            select: { id: true },
          })
          const existingStepIds = existingSteps.map((step) => step.id)

          // 2.2 Determine which steps to keep, update, or create.
          const stepIdsToKeep = steps.filter((step) => step.id).map((step) => step.id)

          // 2.3 Delete steps (and their actions) that are no longer present.
          const stepIdsToDelete = existingStepIds.filter(
            (stepId) => !stepIdsToKeep.includes(stepId)
          )
          if (stepIdsToDelete.length > 0) {
            await tx.action.deleteMany({
              where: { step_id: { in: stepIdsToDelete } },
            })
            await tx.step.deleteMany({
              where: { id: { in: stepIdsToDelete } },
            })
          }

          // 2.4 Insert or update each provided step.
          for (const stepItem of steps) {
            // Extract step data and actions
            const { id: stepId, action = [], ...stepData } = stepItem
            if (existingStepIds.includes(stepId) && !stepIdsToDelete.includes(stepId)) {
              // Fetch existing actions for this step (by stepId)
              const existingActions = await tx.action.findMany({
                where: { step_id: stepId },
                select: { id: true },
              })
              const existingActionIds = existingActions.map((a) => a.id)

              // Figure out which actions remain in the updated data
              const actionIdsToKeep = action.filter((a) => a.id).map((a) => a.id)

              // Remove old actions no longer present
              const actionIdsToDelete = existingActionIds.filter(
                (actionId) => !actionIdsToKeep.includes(actionId)
              )
              if (actionIdsToDelete.length > 0) {
                await tx.action.deleteMany({
                  where: { id: { in: actionIdsToDelete } },
                })
              }

              // Create or update actions
              for (const { id: actionId, ...actionData } of action) {
                if (actionId && existingActionIds.includes(actionId)) {
                  // Action exists, so update
                  await tx.action.update({
                    where: { id: actionId },
                    data: actionData,
                  })
                } else {
                  // Create new action
                  await tx.action.create({
                    data: {
                      ...actionData,
                      step_id: stepId,
                    },
                  })
                }
              }

              // If the step has an ID, update it; otherwise, create it

              await tx.step.update({
                where: { id: stepId },
                data: { ...stepData },
              })
            } else {
              const newAction = await tx.step.create({
                data: {
                  ...stepData,
                  workflow: { connect: { id } },
                  action: Array.isArray(action)
                    ? {
                        create: await Promise.all(
                          action.map(async (a) => {
                            const { id: droppedId, ...restData } = a
                            const typeAction = await Workflow.typeActionSwitch(restData.type)
                            console.log('typeAction:', typeAction)
                            return {
                              ...restData,
                              type: typeAction,
                            }
                          })
                        ),
                      }
                    : undefined,
                },
              })
              console.log('New step created:', newAction)
            }
          }
        }

        // 3. Example: Additional custom logic can be placed here (e.g., dynamic field updates).
        const questionData = await QuestionnaireModel.getQuestionnaireConfig(id)
        await DynamicField.updateField(questionData, id)

        // 4. Return the updated workflow with all its relations.
        const updatedWorkflow = await prisma.workflow.findUnique({
          where: { id },
        })

        return updatedWorkflow
      },
      {
        maxWait: 2000, // How long to wait to acquire the transaction (ms)
        timeout: 10000, // Total transaction timeout (ms)
      }
    )
  }

  /**
   * Supprime un workflow et toutes ses étapes associées
   * @param id ID du workflow à supprimer
   */
  //   public static async delete(id: string) {
  //     // Vérifier si le workflow existe
  //     const workflow = await prisma.workflow.findUnique({
  //       where: { id },
  //       include: {
  //         steps: {
  //           include: {
  //             stepActions: true,
  //           },
  //         },
  //         //contracts: true
  //       },
  //     })

  //     if (!workflow) {
  //       throw new Error('Workflow not found')
  //     }

  //     // Vérifier si des contrats utilisent ce workflow
  //     // if (workflow.contracts.length > 0) {
  //     //     throw new Error('Cannot delete workflow that is being used by contracts')
  //     // }

  //     // Transaction pour assurer l'intégrité des données lors de la suppression
  //     await prisma.$transaction(async (tx) => {
  //       // 1. Supprimer toutes les stepActions associées aux étapes du workflow
  //       for (const step of workflow.steps) {
  //         await tx.stepAction.deleteMany({
  //           where: { step_id: step.id },
  //         })
  //       }

  //       // 2. Supprimer toutes les étapes
  //       await tx.step.deleteMany({
  //         where: { workflow_id: id },
  //       })

  //       // 3. Supprimer le workflow
  //       await tx.workflow.delete({
  //         where: { id },
  //       })
  //     })

  //     return { success: true, message: 'Workflow deleted successfully' }
  //   }
  // }
}
