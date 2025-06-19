import type { HttpContext } from '@adonisjs/core/http'
import prisma from '#lib/prisma'

export default class ContratsController {
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {
    //Fait un post dans la table contrats pour stoker: le titre, la description, workflow_id: string; isConfidential: boolean;
    const { title, description, workflowId, isConfidential } = request.all()
    const newContract = await prisma.contract.create({
      data: {
        title: title,
        description,
        workflow_id: workflowId,
        isConfidential,
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
