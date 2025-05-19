import prisma from '#lib/prisma'
import { TypeActions } from '@prisma/client'

export default class Workflow {
  /**
   * Crée un nouveau workflow
   * @param name Nom du workflow
   * @param fileName Nom du fichier/dossier associé
   * @param createdById ID de l'utilisateur qui crée le workflow (optionnel)
   */
  // public static async create(
  //   name: string,
  //   description: string,
  //   createdById?: string
  // ): Promise<WorkflowType> {
  //   return await prisma.workflow.create({
  //     data: {
  //       name,
  //       description,
  //       created_by_id: createdById,
  //     },
  //   })
  // }

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

  /**
   * Récupère un workflow par son ID
   * @param id ID du workflow
   * @param includeSteps Si true, inclut les étapes associées
   */
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
      case 'Formulaire':
        return TypeActions.QUESTIONNAIRE
      case 'Notification':
        return TypeActions.NOTIFIER
      case 'Email':
        return TypeActions.ENVOYER_MAIL
      case 'Génération':
        return TypeActions.GENERER
      case 'Signature':
        return TypeActions.SIGNER
      case 'Validation':
        return TypeActions.VALIDER
      default:
        return TypeActions.AUTRE
    }
  }
  /**
   * Mettre à jour un workflow existant avec ses étapes, actions et champs de workflow
   */
  public static async updateWorkflow(id: string, data: any) {
    // Vérifier si le workflow existe
    const existingWorkflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        workflowfield: true,
      },
    })

    if (!existingWorkflow) {
      throw new Error('Workflow not found')
    }

    const { steps, workflowfield, ...workflowData } = data

    // Utiliser une transaction pour la mise à jour
    return await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour le workflow principal
      await tx.workflow.update({
        where: { id },
        data: {
          ...workflowData,
          updated_at: new Date(),
        },
      })

      // 2. Traitement des étapes si elles sont fournies
      if (steps && Array.isArray(steps)) {
        // 2.1 Obtenir les IDs des étapes existantes pour ce workflow
        const existingSteps = await tx.step.findMany({
          where: { workflow_id: id },
          select: { id: true },
        })
        const existingStepIds = existingSteps.map((step) => step.id)

        // 2.2 Déterminer quelles étapes garder, mettre à jour ou créer
        const stepIdsToKeep = steps.filter((step) => step.id).map((step) => step.id)

        // 2.3 Supprimer les étapes qui ne sont plus présentes
        const stepIdsToDelete = existingStepIds.filter((stepId) => !stepIdsToKeep.includes(stepId))

        if (stepIdsToDelete.length > 0) {
          await tx.action.deleteMany({
            where: {
              step_id: { in: stepIdsToDelete },
            },
          })

          await tx.step.deleteMany({
            where: {
              id: { in: stepIdsToDelete },
            },
          })
        }

        // 2.4 Traiter chaque étape fournie
        for (const step of steps) {
          const { actions = [], id: stepId, ...stepData } = step

          if (stepId && existingStepIds.includes(stepId)) {
            // Définir un type explicite pour action
            const action: {
              update?: any[]
              create?: any[]
              deleteMany?: any
            } = {}

            // Préparer les mises à jour
            if (actions.some((a) => a.id && typeof a.id === 'number')) {
              action.update = actions
                .filter((a) => a.id && typeof a.id === 'number')
                .map((a) => ({ where: { id: a.id }, data: { ...a, id: undefined } }))
            }

            // Préparer les créations
            if (actions.some((a) => !a.id || typeof a.id !== 'number')) {
              action.create = actions
                .filter((a) => !a.id || typeof a.id !== 'number')
                .map((a) => ({ ...a, id: undefined }))
            }

            // Préparer les suppressions
            const keepIds = actions.filter((a) => a.id).map((a) => a.id)
            if (keepIds.length > 0) {
              action.deleteMany = { step_id: stepId, id: { notIn: keepIds } }
            }

            // Mise à jour en une seule opération
            await tx.step.update({
              where: { id: stepId },
              data: { ...stepData, action },
            })
          } else {
            await tx.step.create({
              data: {
                ...stepData,
                workflow: {
                  connect: { id },
                },
                // Création des actions imbriquées en une seule requête
                action:
                  actions && Array.isArray(actions)
                    ? {
                        create: await Promise.all(
                          actions.map(async (action) => {
                            const { id: _, ...actionData } = action
                            const typeAction = await Workflow.typeActionSwitch(actionData.type)
                            return {
                              ...actionData,
                              type: typeAction,
                            }
                          })
                        ),
                      }
                    : undefined,
              },
            })
          }
        }
      }

      // 3. Traitement des champs de workflow (workflowfield) s'ils sont fournis
      if (workflowfield && Array.isArray(workflowfield)) {
        // 3.1 Obtenir les associations existantes de champs pour ce workflow
        const existingWorkflowFields = await tx.workflowField.findMany({
          where: { workflow_id: id },
          select: { field_id: true },
        })
        const existingFieldIds = existingWorkflowFields.map((wf) => wf.field_id)

        // 3.2 Déterminer quels champs conserver et lesquels supprimer
        const fieldIdsToKeep = workflowfield
          .filter((field) => field.field_id) // Assurez-vous qu'il y a field_id
          .map((field) => field.field_id)

        // 3.3 Supprimer les associations qui ne sont plus présentes
        const fieldIdsToDelete = existingFieldIds.filter(
          (fieldId) => !fieldIdsToKeep.includes(fieldId)
        )

        if (fieldIdsToDelete.length > 0) {
          await tx.workflowField.deleteMany({
            where: {
              AND: [{ workflow_id: id }, { field_id: { in: fieldIdsToDelete } }],
            },
          })
        }

        // 3.4 Ajouter les nouvelles associations de champs
        for (const field of workflowfield) {
          const { field_id } = field

          // Vérifier si ce champ existe déjà dans l'association
          if (!field_id || existingFieldIds.includes(field_id)) {
            continue // Ignorer les champs déjà associés ou sans ID
          }

          // Vérifier d'abord si le DynamicField existe
          const dynamicField = await tx.dynamicField.findUnique({
            where: { id: field_id },
          })

          if (!dynamicField) {
            console.warn(`DynamicField avec l'ID ${field_id} n'existe pas. Ignoré.`)
            continue
          }

          // Créer la nouvelle association
          await tx.workflowField.create({
            data: {
              workflow_id: id,
              field_id: field_id,
            },
          })
        }

        // 3.5 Alternative - Supprimer toutes les associations existantes et recréer
        // Cette approche est plus simple mais moins efficace pour de grandes quantités de données
        /* 
        // Supprimer toutes les associations existantes
        await tx.workflowField.deleteMany({
          where: { workflow_id: id }
        })
        
        // Recréer toutes les associations
        for (const field of workflowfield) {
          if (field.field_id) {
            // Vérifier si le DynamicField existe
            const dynamicField = await tx.dynamicField.findUnique({
              where: { id: field.field_id }
            })
            
            if (dynamicField) {
              await tx.workflowField.create({
                data: {
                  workflow_id: id,
                  field_id: field.field_id
                }
              })
            }
          }
        }
        */
      }

      // 4. Récupérer le workflow mis à jour avec toutes ses relations
      return await tx.workflow.findUnique({
        where: { id },
        include: {
          steps: {
            include: {
              action: true,
            },
            orderBy: {
              name: 'asc',
            },
          },
          workflowfield: {
            include: {
              dynamic_field: true,
            },
          },
        },
      })
    })
  }

  // public static async updateAttributes(id: string, updates: WorkflowUpdates) {
  //   const workflow = await prisma.workflow.findUnique({
  //     where: { id },
  //   })
  //   if (!workflow) {
  //     throw new Error('Workflow not found')
  //   }
  //   const updatedWorkflow = await prisma.workflow.update({
  //     where: { id },
  //     data: updates, // `updates` contient les champs à modifier
  //   })

  //   return updatedWorkflow
  // }
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
