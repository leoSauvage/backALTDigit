import prisma from '#lib/prisma'
import type { HttpContext } from '@adonisjs/core/http'

export default class ContratsController {
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request, params }: HttpContext) {
    //Fait un post dans la table contrats pour stoker: le titre, la description, workflow_id: string; isConfidential: boolean;
    const { title, description, workflowId, isConfidential, startDate, endDate } = params
    const newContract = await prisma.contract.create({
      data: {
        title: title,
        description: description,
        workflow_id: workflowId,
        isConfidential: isConfidential === 'true', // Convert string to boolean
        date_start: startDate, // Convert string to Date if provided
        date_end: endDate, // Convert string to Date if provided
        status: 'PREPARATION',
        language: 'Français', // Default language, can be changed later
        file_list: '',
      },
    })
    return newContract
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}

  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) {}
}
