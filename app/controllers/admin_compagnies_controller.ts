import prisma from '#lib/prisma'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminCompagniesController {
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    return response.status(201).json({ message: 'Wellcome' })
  }

  /**
   * contractsTypes
   */
  public async contractList({ response }: HttpContext) {
    const workflows = await prisma.workflow.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        contract_name: true,
        file_names: true,
        created_by_id: true,
        category_id: true,
        created_at: true,
        updated_at: true,
        is_active: true,
        _count: {
          select: {
            steps: true,
          },
        },
      },
    })

    const workflowUpdated = workflows.map((workflow) => ({
      ...workflow,
      _aggr_count_steps: workflow._count.steps,
    }))

    return response.ok(workflowUpdated)
  }

  public async contractSteps({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const steps = await prisma.step.findMany({
        where: {
          workflow_id: id,
        },
        orderBy: {
          order: 'asc',
        },
      })
      if (!steps || steps.length === 0) {
        return response.status(404).json({ message: 'Aucune étape trouvée pour ce workflow' })
      }

      return response.status(200).json(steps)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      return response.status(500).json({
        message: 'Erreur lors de la récupération des étapes',
        error: errorMessage,
      })
    }
  }

  public async initContract({ params, request, response }: HttpContext) {
    try {
      const { workflowId } = params
      const steps = await prisma.step.findMany({
        where: {
          workflow_id: workflowId,
        },
        orderBy: {
          order: 'asc',
        },
      })
      if (!steps || steps.length === 0) {
        return response.status(404).json({ message: 'Aucune étape trouvée pour ce workflow' })
      }
      const action = await prisma.action.findFirst({
        where: {
          step_id: steps[0].id,
          order: 1,
        },
      })

      if (!action) {
        return response
          .status(404)
          .json({ message: 'Aucune action initiale trouvée pour cette étape' })
      }

      return response.status(200).json({
        steps: steps,
        action: action,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      return response.status(500).json({
        message: "Erreur lors de la récupération de l'action initiale",
        error: errorMessage,
      })
    }
  }

  public async nextAction({ params, request, response }: HttpContext) {
    try {
      const { stepId } = params
      const action = await prisma.action.findFirst({
        where: {
          step_id: stepId,
          order: 1,
        },
      })

      if (!action) {
        return response.status(404).json({ message: 'Aucune action trouvée pour cette étape' })
      }

      return response.status(200).json(action)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      return response.status(500).json({
        message: 'Erreur lors de la récupération de l’action',
        error: errorMessage,
      })
    }
  }

  // public async submitStep({ request, response }: HttpContext) {
  //   try {
  //     const {
  //       stepId,
  //       workflowId,
  //       formData,
  //       contractId = null,
  //       actionId,
  //       language = 'Français',
  //     } = request.body()

  //     // Si c'est la première étape, créer le contrat
  //     let contract
  //     if (!contractId) {
  //       contract = await prisma.contract.create({
  //         data: {
  //           workflow_id: workflowId,
  //           title: `Contrat-${Date.now()}`,
  //           status: 'PREPARATION',
  //           data: formData,
  //           file_list: [],
  //           language,
  //           isConfidential: false,
  //           created_by_id: null,
  //         },
  //       })
  //     } else {
  //       // Mettre à jour le contrat existant
  //       contract = await prisma.contract.update({
  //         where: { id: contractId },
  //         data: {
  //           data: {
  //             ...formData,
  //           },
  //           updated_at: new Date(),
  //         },
  //       })
  //     }

  //     // Récupérer l'action courante et la prochaine action
  //     const currentAction = await prisma.action.findFirst({
  //       where: {
  //         step_id: stepId,
  //         id: actionId,
  //       },
  //       include: {
  //         step: true,
  //       },
  //     })

  //     if (!currentAction) {
  //       return response.status(404).json({ message: 'Action courante non trouvée' })
  //     }

  //     // Enregistrer le log de l'action
  //     await prisma.contractStepLog.create({
  //       data: {
  //         contract_id: contract.id,
  //         step_id: stepId,
  //         last_action_id: actionId,
  //       },
  //     })

  //     // Trouver toutes les actions requises pour cette étape
  //     const requiredActions = await prisma.action.findMany({
  //       where: {
  //         step_id: stepId,
  //         is_required: true,
  //       },
  //     })

  //     // Vérifier les actions complétées pour cette étape
  //     const completedActions = await prisma.contractStepLog.findMany({
  //       where: {
  //         contract_id: contract.id,
  //         step_id: stepId,
  //       },
  //       select: {
  //         last_action_id: true,
  //       },
  //     })

  //     const completedActionIds = completedActions.map((log) => log.last_action_id)
  //     const allRequiredActionsCompleted = requiredActions.every((action) =>
  //       completedActionIds.includes(action.id)
  //     )
  //     // Chercher la prochaine action dans la même étape
  //     let nextActionOrStep = await prisma.action.findFirst({
  //       where: {
  //         step_id: stepId,
  //         order: {
  //           gt: currentAction.order,
  //         },
  //       },
  //       orderBy: {
  //         order: 'asc',
  //       },
  //     })

  //     // Si une prochaine action existe dans l'étape courante
  //     if (nextActionOrStep) {
  //       return response.status(200).json({
  //         message: 'Action suivante',
  //         contract,
  //         nextAction: nextActionOrStep,
  //         currentStep: currentAction.step,
  //       })
  //     }

  //     // Ne passer à l'étape suivante que si toutes les actions requises sont complétées
  //     if (!allRequiredActionsCompleted) {
  //       // Trouver la première action requise non complétée
  //       const nextRequiredAction = requiredActions.find(
  //         (action) => !completedActionIds.includes(action.id)
  //       )
  //       if (nextRequiredAction) {
  //         return response.status(200).json({
  //           message: 'Action requise non complétée',
  //           contract,
  //           nextAction: nextRequiredAction,
  //           currentStep: currentAction.step,
  //         })
  //       }
  //     }

  //     // Si toutes les actions requises sont complétées, chercher la prochaine étape
  //     const currentStepOrder = await prisma.step.findUnique({
  //       where: { id: stepId },
  //       select: { order: true },
  //     })

  //     const nextStep = await prisma.step.findFirst({
  //       where: {
  //         workflow_id: workflowId,
  //         order: {
  //           gt: currentStepOrder?.order ?? 0,
  //         },
  //       },
  //       orderBy: {
  //         order: 'asc',
  //       },
  //     })

  //     if (!nextStep) {
  //       return response.status(200).json({
  //         message: 'Workflow terminé',
  //         isComplete: true,
  //         contract,
  //       })
  //     }

  //     // Récupérer la première action de l'étape suivante
  //     const nextStepAction = await prisma.action.findFirst({
  //       where: {
  //         step_id: nextStep.id,
  //         order: 1,
  //       },
  //     })

  //     return response.status(200).json({
  //       message: 'Étape suivante',
  //       contract,
  //       nextStep,
  //       nextStepAction,
  //     })
  //   } catch (error) {
  //     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
  //     return response.status(500).json({
  //       message: "Erreur lors de la soumission de l'étape",
  //       error: errorMessage,
  //     })
  //   }
  // }

  /**
   * contractStep
   */
  // public async contractStep({ params, request, response }: HttpContext) {
  //   const { id } = params
  //   // const steps = await Step.query().where('workflow_id', id)
  //   return response.status(200).json(steps)
  // }

  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {}

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}

  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  // async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}

  public async getPreviousStepData({ request, response }: HttpContext) {
    try {
      const { contractId, currentStepId } = request.body()

      // Récupérer l'étape actuelle pour avoir l'ordre
      const currentStep = await prisma.step.findUnique({
        where: { id: currentStepId },
        select: {
          id: true,
          workflow_id: true,
          order: true,
        },
      })

      if (!currentStep) {
        return response.status(404).json({ message: 'Current step not found' })
      }

      // Récupérer l'étape précédente
      const previousStep = await prisma.step.findFirst({
        where: {
          workflow_id: currentStep.workflow_id,
          order: currentStep.order - 1,
        },
        select: {
          id: true,
        },
      })

      if (!previousStep) {
        return response.status(404).json({ message: 'Previous step not found' })
      }

      // Récupérer le dernier log et le contrat pour cette étape
      const [lastLog, contract] = await Promise.all([
        prisma.contractStepLog.findFirst({
          where: {
            contract_id: contractId,
            step_id: previousStep.id,
          },
          orderBy: {
            created_at: 'desc',
          },
          select: {
            id: true,
            last_action: {
              select: {
                id: true,
                type: true,
                config: true,
                order: true,
                is_required: true,
                step_id: true,
              },
            },
          },
        }),
        prisma.contract.findUnique({
          where: { id: contractId },
          select: {
            data: true,
          },
        }),
      ])

      if (!lastLog?.last_action || !contract?.data) {
        return response.status(404).json({ message: 'No previous data found' })
      }

      // Récupérer les données correspondantes dans le contrat
      const contractData = contract.data as Record<string, Record<string, any>>
      const stepData = contractData[previousStep.id] || {}
      const actionData = stepData[lastLog.last_action.id] || {}

      return response.status(200).json({
        previousAction: lastLog.last_action,
        formData: actionData,
      })
    } catch (error) {
      console.error('Error in getPreviousStepData:', error)
      return response.status(500).json({
        message: 'Erreur lors de la récupération des données précédentes',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
