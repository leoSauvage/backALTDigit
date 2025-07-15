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

  /**
   * Initialiser un contrat avec toutes les étapes et actions
   */
  public async initContract({ params, request, response }: HttpContext) {
    try {
      const { workflowId } = params

      // Récupérer toutes les étapes avec leurs actions
      const steps = await prisma.step.findMany({
        where: {
          workflow_id: workflowId,
        },
        include: {
          action: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      })

      if (!steps || steps.length === 0) {
        return response.status(404).json({ message: 'Aucune étape trouvée pour ce workflow' })
      }

      // Récupérer la première action de la première étape
      const firstAction = steps[0].action.find((action) => action.order === 1)

      if (!firstAction) {
        return response.status(404).json({
          message: 'Aucune action initiale trouvée pour la première étape',
        })
      }

      // Retourner les données dans le format attendu par le client
      return response.status(200).json({
        steps: steps,
        action: firstAction,
        totalSteps: steps.length,
        currentStep: 0,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      return response.status(500).json({
        message: "Erreur lors de la récupération de l'action initiale",
        error: errorMessage,
      })
    }
  }

  /**
   * Soumettre une action et naviguer vers la suivante
   */
  public async submitAction({ request, response }: HttpContext) {
    try {
      const {
        stepId,
        actionId,
        workflowId,
        formData,
        contractId = null,
        language = 'Français',
      } = request.body()

      // Si c'est la première soumission, créer le contrat
      let contract
      if (!contractId) {
        contract = await prisma.contract.create({
          data: {
            workflow_id: workflowId,
            title: `Contrat-${Date.now()}`,
            status: 'PREPARATION',
            data: { [stepId]: { [actionId]: formData } },
            file_list: '',
            date_start: new Date().toISOString(),
            date_end: null,
            language,
            isConfidential: false,
            created_by_id: null,
          },
        })
      } else {
        // Mettre à jour le contrat existant
        const existingContract = await prisma.contract.findUnique({
          where: { id: contractId },
          select: { data: true },
        })

        const existingData: any = existingContract?.data || {}
        const updatedData = {
          ...existingData,
          [stepId]: {
            ...existingData[stepId],
            [actionId]: formData,
          },
        }

        contract = await prisma.contract.update({
          where: { id: contractId },
          data: {
            data: updatedData,
            updated_at: new Date(),
          },
        })
      }

      // Enregistrer le log de l'action
      await prisma.contractStepLog.create({
        data: {
          contract_id: contract.id,
          step_id: stepId,
          last_action_id: actionId,
        },
      })

      // Récupérer l'action courante
      const currentAction = await prisma.action.findUnique({
        where: { id: actionId },
        include: {
          step: true,
        },
      })

      if (!currentAction) {
        return response.status(404).json({ message: 'Action courante non trouvée' })
      }

      // Chercher la prochaine action dans la même étape
      const nextActionInStep = await prisma.action.findFirst({
        where: {
          step_id: stepId,
          order: {
            gt: currentAction.order,
          },
        },
        orderBy: {
          order: 'asc',
        },
      })

      // Si une prochaine action existe dans l'étape courante
      if (nextActionInStep) {
        return response.status(200).json({
          type: 'NEXT_ACTION',
          contract,
          nextAction: nextActionInStep,
          currentStep: currentAction.step,
          message: 'Action suivante dans la même étape',
        })
      }

      // Si c'est la dernière action de l'étape, passer à l'étape suivante
      const nextStep = await prisma.step.findFirst({
        where: {
          workflow_id: workflowId,
          order: {
            gt: currentAction.step.order,
          },
        },
        orderBy: {
          order: 'asc',
        },
      })

      if (!nextStep) {
        // Workflow terminé
        await prisma.contract.update({
          where: { id: contract.id },
          data: { status: 'SIGNATURE' },
        })

        return response.status(200).json({
          type: 'WORKFLOW_COMPLETE',
          contract,
          message: 'Workflow terminé',
          isComplete: true,
        })
      }

      // Récupérer la première action de l'étape suivante
      const nextStepFirstAction = await prisma.action.findFirst({
        where: {
          step_id: nextStep.id,
          order: 1,
        },
      })

      if (!nextStepFirstAction) {
        return response.status(404).json({
          message: "Aucune action trouvée pour l'étape suivante",
        })
      }

      return response.status(200).json({
        type: 'NEXT_STEP',
        contract,
        nextStep,
        nextAction: nextStepFirstAction,
        message: 'Étape suivante',
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      return response.status(500).json({
        message: "Erreur lors de la soumission de l'action",
        error: errorMessage,
      })
    }
  }

  /**
   * Récupérer les données de l'étape précédente
   */
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
        return response.status(404).json({ message: 'Étape courante non trouvée' })
      }

      // Récupérer l'étape précédente
      const previousStep = await prisma.step.findFirst({
        where: {
          workflow_id: currentStep.workflow_id,
          order: currentStep.order - 1,
        },
        select: {
          id: true,
          action: {
            orderBy: {
              order: 'desc',
            },
            take: 1,
          },
        },
      })

      if (!previousStep || !previousStep.action.length) {
        return response.status(404).json({ message: 'Étape précédente non trouvée' })
      }

      // Récupérer le contrat avec les données
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        select: {
          data: true,
        },
      })

      if (!contract?.data) {
        return response.status(404).json({ message: 'Données du contrat non trouvées' })
      }

      // Récupérer les données de l'étape précédente
      const contractData = contract.data as Record<string, Record<string, any>>
      const stepData = contractData[previousStep.id] || {}
      const lastAction = previousStep.action[0]
      const actionData = stepData[lastAction.id] || {}

      return response.status(200).json({
        previousAction: lastAction,
        formData: actionData,
        previousStep: previousStep,
      })
    } catch (error) {
      console.error('Erreur dans getPreviousStepData:', error)
      return response.status(500).json({
        message: 'Erreur lors de la récupération des données précédentes',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Récupérer les étapes d'un contrat
   */
  public async contractSteps({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const steps = await prisma.step.findMany({
        where: {
          workflow_id: id,
        },
        include: {
          action: {
            orderBy: {
              order: 'asc',
            },
          },
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

  /**
   * Récupérer la prochaine action
   */
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
        message: "Erreur lors de la récupération de l'action",
        error: errorMessage,
      })
    }
  }

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
   * Delete record
   */
  async destroy({ params }: HttpContext) {}
}
