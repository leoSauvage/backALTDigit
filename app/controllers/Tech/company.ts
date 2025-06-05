import { HttpContext } from '@adonisjs/core/http'
import Company from '#models/company'

export default class CompaniesController {
  public async createCompany({ request, response }: HttpContext) {
    try {
      const { name, email } = request.only(['name', 'email'])

      // Validation des données
      if (!name || !email) {
        return response.status(400).json({
          error: 'Name and permissions are required',
        })
      }

      const company = await Company.create(name, email)
      return response.status(201).json(company)
    } catch (error: any) {
      return response.status(500).json({
        error: 'Failed to create role',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async getAllCompanys({ response }: HttpContext) {
    try {
      const roles = await Company.getAll()
      return response.json(roles)
    } catch (error: any) {
      console.error('Error retrieving roles:', error)
      return response.status(500).json({
        error: 'Failed to retrieve roles',
        details: error.message || 'Unknown error',
      })
    }
  }
}
