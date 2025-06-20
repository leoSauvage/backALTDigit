import prisma from '#lib/prisma'
import type { HttpContext } from '@adonisjs/core/http'
// import Hash from '@ioc:Adonis/Core/Hash'

export default class UsersController {
  public async createCompany({ response, params }: HttpContext) {
    const { name, email } = params
    try {
      const existingCompany = await prisma.company.count({
        where: {
          email: email,
          name: name,
        },
      })
      if (existingCompany > 0) {
        return response.badRequest({ message: 'Company already exists' })
      } else {
        const company = await prisma.company.create({
          data: {
            name: name,
            email: email,
            password: 'password123', // Replace with actual password logic
          },
        })
        return response.created({ message: 'Company created successfully', company })
      }
    } catch (error) {
      console.error('Error creating company:', error)
      return response.internalServerError({ message: 'Failed to create company' })
    }
  }

  public async createCcompanyUser({ response, params }: HttpContext) {
    const { email } = params
    try {
      //Verifier si la company (l'admin) est connecté
      //Prendre l'id de la company à travers le token
      const user = await prisma.user.create({
        data: {
          name: 'New Company',
          email: 'company' + Math.floor(Math.random() * 10000) + '@gmail.com',
        },
      })

      return response.created({ message: 'Company created successfully', user })
    } catch (error) {
      console.error('Error creating company:', error)
      return response.internalServerError({ message: 'Failed to create company' })
    }
  }
}
