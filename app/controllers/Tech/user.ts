import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UserController {

  public async createUser({ request, response }: HttpContext) {
    try {
      const { email } = request.only(['email'])

      // Validation des données
      if (!email) {
        return response.status(400).json({
          error: 'Name and permissions are required',
        })
      }

      const user = await User.create(email)
      return response.status(201).json(user)
    } catch (error: any) {
      return response.status(500).json({
        error: 'Failed to create user',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async getAllUsers({ params, response }: HttpContext) {
    try {
      const { id } = params

      const users = await Company.getAllUserFromCompany(id)
      //TODO mapper les utilisateurs par role
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
