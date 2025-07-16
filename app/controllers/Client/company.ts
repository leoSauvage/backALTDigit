import { HttpContext } from '@adonisjs/core/http'
import Company from '#models/company'
import Team from '#models/team'
import User from '#models/user'
import mail from '@adonisjs/mail/services/main'

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

  public async getTeams({ params, response }: HttpContext) {
    try {
      const { id } = params
      const teams = await Team.getTeams(id)
      return response.json(teams)
    } catch (error: any) {
      console.error('Error retrieving teams:', error)
      return response.status(500).json({
        error: 'Failed to retrieve teams',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async createTeam({ request, params, response }: HttpContext) {
    try {
      const { color, name } = request.only(['color', 'name'])
      const { companyId } = params
      // Validation des données
      if (!color || !name) {
        return response.status(400).json({
          error: 'Color and name are required',
        })
      }

      const team = await Team.create(color, name, companyId)
      return response.status(201).json(team)
    } catch (error: any) {
      console.error('Error creating team:', error)
      return response.status(500).json({
        error: 'Failed to create team',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async deleteTeam({ params, response }: HttpContext) {
    try {
      const { teamId } = params
      const team = await Team.delete(teamId)

      if (!team) {
        return response.status(404).json({
          error: 'Team not found',
        })
      }

      return response.status(200).json({ message: 'Team deleted successfully' })
    } catch (error: any) {
      console.error('Error deleting team:', error)
      return response.status(500).json({
        error: 'Failed to delete team',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async updateTeam({ request, params, response }: HttpContext) {
    try {
      const { color, name } = request.only(['color', 'name'])
      const { teamId } = params

      // Validation des données
      if (!color || !name) {
        return response.status(400).json({
          error: 'Color, name and users are required',
        })
      }

      const team = await Team.update(teamId, color, name)
      return response.status(200).json(team)
    } catch (error: any) {
      console.error('Error updating team:', error)
      return response.status(500).json({
        error: 'Failed to update team',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async createUser({ request, params, response }: HttpContext) {
    try {
      const { email, firstName, lastName, teamId, password } = request.only([
        'email',
        'firstName',
        'lastName',
        'teamId',
        'password',
      ])
      const { roleId } = params
      // Validation des données
      if (!email || !firstName || !lastName || !teamId) {
        return response.status(400).json({
          error: 'Email, name and role are required',
        })
      }
      const hashPassword = await User.hashPassword(password)
      const user = await User.create(email, firstName, lastName, roleId, teamId, hashPassword)
      await mail.sendLater((message) => {
        message
          .to(email)
          .from('leo@coumbassa-sanden.com')
          .subject('Bonjour !')
          .text("Bienvenue dans l'application ALTDigit !")
      })
      return response.status(201).json(user)
    } catch (error: any) {
      console.error('Error creating user:', error)
      return response.status(500).json({
        error: 'Failed to create user',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async getUsers({ params, response }: HttpContext) {
    try {
      const { companyId } = params
      const teams = await Team.getTeams(companyId)
      const teamIds = teams.map((t) => t.id)
      const users = await User.getUsersByTeams(teamIds)
      if (!users || users.length === 0) {
        return response.status(404).json({
          error: 'No users found for this company',
        })
      }
      return response.json(users)
    } catch (error: any) {
      console.error('Error retrieving users:', error)
      return response.status(500).json({
        error: 'Failed to retrieve users',
        details: error.message || 'Unknown error',
      })
    }
  }

  public static async sendMail(emails: string[], contractTitle: string, typeOfMail: string) {
    try {
      console.log('Sending email to:', emails)
      let subject: string
      let body: string
      switch (typeOfMail) {
        case 'CREATION':
          subject = 'Création du contrat ' + contractTitle
          body = 'Vous avez créé un contrat avec succès.'
          break
        case 'QUESTIONNAIRE':
          subject = 'Complétion du questionnaire du contrat ' + contractTitle
          body =
            'Vous venez de remplir le questionnaire. Vous pouvez désormais passer à l’étape suivante.'
          break
        case 'VALIDATION':
          subject = 'Validation du contrat ' + contractTitle
          body = 'Votre contrat a été validé avec succès. Vous pouvez désormais le signer.'
          break
        default:
          subject = 'Erreur'
          body = 'Vous avez reçu une notification.'
      }
      for (const email of emails) {
        await mail.sendLater((message) => {
          message.to(email).from('leo@coumbassa-sanden.com').subject(subject).text(body)
        })
      }
    } catch (error: any) {
      console.error('Error sending email:', error)
      throw new Error('Failed to send email')
    }
  }

  public static async sendParticipantMail(
    email: string,
    contractTitle: string,
    typeOfMail: string
  ) {
    try {
      let subject: string
      let body: string
      switch (typeOfMail) {
        case 'DELETE':
          subject = 'ALT Digit '
          body = 'Vous avez été retiré à la participation du contrat ' + contractTitle
          break
        case 'ADD':
          subject = 'ALT Digit '
          body = 'Vous avez été ajouté à la participation du contrat ' + contractTitle
          break
        default:
          subject = 'Erreur'
          body = 'Vous avez reçu une notification.'
      }
      await mail.sendLater((message) => {
        message.to(email).from('leo@coumbassa-sanden.com').subject(subject).text(body)
      })
    } catch (error: any) {
      console.error('Error sending email:', error)
      throw new Error('Failed to send email')
    }
  }
}
