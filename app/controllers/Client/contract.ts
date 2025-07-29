import Contract from '#models/contract'
import Reminder from '#models/reminder'
import Workflow from '#models/workflow'
import Notification from '#models/notification'
import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import CompaniesController from './company.ts'
import ws from '#models/ws'

export default class WorkflowController {
  public async getFieldValues({ params, response }: HttpContext) {
    try {
      const { id } = params
      const contract = await Contract.getContract(id)
      if (!contract) {
        return response.status(404).json({ error: 'Contract not found' })
      }
    const raw = contract.data as Record<string, Record<string, { data?: Record<string, any> }>>;

    const allValues: Record<string, any> = {};
    for (const stepMap of Object.values(raw)) {
      for (const actionEntry of Object.values(stepMap)) {
        if (actionEntry.data && typeof actionEntry.data === 'object') {
          Object.assign(allValues, actionEntry.data);
        }
      }
    }
    return response.json(allValues);
    } catch (error: any) {
      console.error('Error retrieving file list:', error)
      return response.status(500).json({
        error: 'Failed to retrieve file list',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async updateContractType({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const { type } = request.body()
      if (type === 'Durée Indéterminée') {
        await Contract.setContractType(id, true)
        await Notification.createContractNotification(
          'La durée du contrat a été changée en Durée Indéterminée',
          id
        )
      } else {
        await Contract.setContractType(id, false)
        await Notification.createContractNotification(
          'La durée du contrat a été changée en Durée Déterminée',
          id
        )
      }
      await Reminder.updateReminder(id)
      return response.json({ message: 'Contract type updated successfully' })
    } catch (error: any) {
      console.error('Error retrieving contract:', error)
      return response.status(500).json({
        error: 'Failed to retrieve contract',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async updateEndDate({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const { endDate } = request.body()
      await Contract.updateEndDate(id, endDate)
      await Notification.createContractNotification(
        'La date de fin du contrat a été changée en ' + endDate,
        id
      )
      await Reminder.updateReminder(id)
      return response.json({ message: 'End date updated successfully' })
    } catch (error: any) {
      console.error('Error retrieving contract:', error)
      return response.status(500).json({
        error: 'Failed to retrieve contract',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async updateStartDate({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const { startDate } = request.body()
      await Contract.updateStartDate(id, startDate)
      await Reminder.updateReminder(id)
      return response.json({ message: 'Start date updated successfully' })
    } catch (error: any) {
      console.error('Error retrieving contract:', error)
      return response.status(500).json({
        error: 'Failed to retrieve contract',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async getWorkflowId({ params, response }: HttpContext) {
    try {
      const { id } = params
      const contract = await Contract.getContract(id)
      if (!contract) {
        return response.status(404).json({ error: 'Workflow ID not found for this contract' })
      }
      return response.json(contract.workflow_id)
    } catch (error: any) {
      console.error('Error retrieving file list:', error)
      return response.status(500).json({
        error: 'Failed to retrieve file list',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async getInfos({ params, response }: HttpContext) {
    try {
      const { id } = params
      const contract = await Contract.getContract(id)
      if (!contract) {
        return response.status(404).json({ error: 'Contract not found' })
      }
      const { start_date, end_date } = contract
      return response.status(200).json({ start_date, end_date })
    } catch (error: any) {
      console.error('Error retrieving file list:', error)
      return response.status(500).json({
        error: 'Failed to retrieve file list',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async getParticipants({ params, response }: HttpContext) {
    try {
      const { id } = params
      const participants = await Contract.getParticipants(id)
      if (!participants) {
        return response.status(404).json({ error: 'Contract not found' })
      }
      return response.json(participants)
    } catch (error: any) {
      console.error('Error retrieving contract:', error)
      return response.status(500).json({
        error: 'Failed to retrieve contract',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async addClient({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const { clientId } = request.body()
      console.log('contrat', id, clientId)
      const title = await Contract.addClient(id, clientId)
      ws.io?.to(`contract_${id}`).emit('addParticipant', {
        contractId: id,
      })
      const client = User.getUserById(clientId)
      await CompaniesController.sendParticipantMail(client.email, title, 'ADD')
      return response.json({ success: true })
    } catch (error: any) {
      console.error('Error retrieving contract:', error)
      return response.status(500).json({
        error: 'Failed to retrieve contract',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async setSupervisor({ params, response, user }: HttpContext) {
    try {
      const { id } = params
      await Contract.setSupervisor(id, user?.id)
      return response.json({ success: true })
    } catch (error: any) {
      console.error('Error setting supervisor:', error)
      return response.status(500).json({
        error: 'Failed to set supervisor',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async isSupervisor({ params, response, user }: HttpContext) {
    try {
      const { id } = params
      const isSupervisor = Contract.isSupervisor(id, user?.id)
      return response.json(isSupervisor)
    } catch (error: any) {
      console.error('Error checking supervisor status:', error)
      return response.status(500).json({
        error: 'Failed to check supervisor status',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async setSupervisorValidation({ params, response, user }: HttpContext) {
    try {
      const { id } = params
      const isSupervisor = await Contract.isSupervisor(id, user?.id)
      if (isSupervisor) {
        const contract = await Contract.getContract(id)
        if (!contract) {
          return response.status(404).json({ error: 'Contract not found' })
        }
        const { cocontractants, usercontracts } = await Contract.getParticipants(contract.id)
        const emailsFromCocontractants: string[] = cocontractants
        const emailsFromUsers: string[] = usercontracts.map((uc) => uc.user.email)
        const allEmails = [...emailsFromCocontractants, ...emailsFromUsers]
        await CompaniesController.sendMail(allEmails, contract.title, 'VALIDATION')
        return response.json({ success: true })
      }
      return response.status(403).json({ error: 'User is not a supervisor' })
    } catch (error: any) {
      console.error('Error setting supervisor validation:', error)
      return response.status(500).json({
        error: 'Failed to set supervisor validation',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async deleteClient({ params, response }: HttpContext) {
    try {
      const { id, clientId } = params
      const title = await Contract.deleteClient(id, clientId)
      ws.io?.to(`contract_${id}`).emit('deleteParticipant', {
        contractId: id,
      })
      const client = User.getUserById(clientId)
      await CompaniesController.sendParticipantMail(client.email, title, 'DELETE')
      return response.json({ success: true })
    } catch (error: any) {
      console.error('Error deleting client:', error)
      return response.status(500).json({
        error: 'Failed to delete client',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async addCo({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const { email } = request.body()
      const title = await Contract.addCo(id, email)
      ws.io?.to(`contract_${id}`).emit('addParticipant', {
        contractId: id,
      })
      await CompaniesController.sendParticipantMail(email, title, 'ADD')
      return response.json({ success: true })
    } catch (error: any) {
      return response.status(500).json({
        error: 'Failed to add co-contractant',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async deleteCo({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const { email } = request.body()
      const title = await Contract.deleteCo(id, email)
      ws.io?.to(`contract_${id}`).emit('deleteParticipant', {
        contractId: id,
      })
      await CompaniesController.sendParticipantMail(email, title, 'DELETE')
      return response.json({ success: true })
    } catch (error: any) {
      return response.status(500).json({
        error: 'Failed to delete co-contractant',
        details: error.message || 'Unknown error',
      })
    }
  }
  public async getNumberOfValidators({ params, response }: HttpContext) {
    try {
      const { id } = params
      const numberOfValidators = await Contract.getNumberOfValidators(id)
      return response.json(numberOfValidators)
    } catch {
      return response.status(500).json({
        error: 'Failed to add reminder',
      })
    }
  }
  public async getNumberOfParticipants({ params, response }: HttpContext) {
    try {
      const { id } = params
      const numberOfParticipants = await Contract.getNumberOfParticipants(id)
      return response.json(numberOfParticipants)
    } catch {
      return response.status(500).json({
        error: 'Failed to add reminder',
      })
    }
  }
  public async addReminder({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const { date, title } = request.body()
      await Reminder.addReminder(id, date, title)
      return response.json({ success: true })
    } catch (error: any) {
      console.error('Error adding reminder:', error)
      return response.status(500).json({
        error: 'Failed to add reminder',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async getReminders({ params, response }: HttpContext) {
    try {
      const { id } = params
      const reminders = await Reminder.getReminders(id)
      if (!reminders) {
        return response.status(404).json({ error: 'No reminders found for this contract' })
      }
      return response.json(reminders)
    } catch (error: any) {
      return response.status(500).json({
        error: 'Failed to retrieve reminders',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async deleteReminder({ params, response }: HttpContext) {
    try {
      const { reminderId } = params
      await Reminder.deleteReminder(reminderId)
      return response.json({ success: true })
    } catch (error: any) {
      console.error('Error deleting reminder:', error)
      return response.status(500).json({
        error: 'Failed to delete reminder',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async getRight({ params, response }: HttpContext) {
    const { id } = params
    try {
      const contract = await Contract.getContract(id)
      if (!contract) {
        return response.status(404).json({ error: 'Contract not found' })
      }
      const right = contract.right || []
      return response.json(right)
    } catch (error: any) {
      return response.status(500).json({
        error: 'Failed to retrieve contract rights',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async setRight({ params, request, response }: HttpContext) {
    const { id } = params
    const { right } = request.body()
    try {
      const contract = await Contract.getContract(id)
      if (!contract) {
        return response.status(404).json({ error: 'Contract not found' })
      }
      await Contract.setRight(id, right)
      return response.json({ success: true })
    } catch (error: any) {
      return response.status(500).json({
        error: 'Failed to set contract rights',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async getDocumentId({ params, response }: HttpContext) {
    const { id } = params
    try {
      const contract = await Contract.getContract(id)
      if (!contract) {
        return response.status(404).json({ error: 'Contract not found' })
      }
      const actionId = await Workflow.getValidateId(contract.workflow_id)
      if (!actionId) {
        return response.status(404).json({ error: 'Action ID not found for this contract' })
      }
      return response.json(`${actionId}.${id}`)
    } catch (error: any) {
      return response.status(500).json({
        error: 'Failed to retrieve document ID',
        details: error.message || 'Unknown error',
      })
    }
  }
  //Validation
  public async setValidation({ params, response, user }: HttpContext) {
    const { id } = params
    try {
      await Contract.setValidation(id, user?.id)
      const numberOfValidations = await Contract.getNumberOfValidators(id)
      const numberOfParticipants = await Contract.getNumberOfParticipants(id)
      ws.io?.to(`contract_${id}`).emit('contractValidated', {
        contractId: id,
      })
      return response.json({ validators: numberOfValidations, participants: numberOfParticipants })
    } catch (error: any) {
      console.error('Error setting validation:', error)
      return response.status(500).json({
        error: 'Failed to set validation',
        details: error.message || 'Unknown error',
      })
    }
  }
  public async unsetValidation({ params, response, user }: HttpContext) {
    const { id } = params
    try {
      await Contract.unsetValidation(id, user?.id)
      const numberOfValidations = await Contract.getNumberOfValidators(id)
      const numberOfParticipants = await Contract.getNumberOfParticipants(id)
      ws.io?.to(`contract_${id}`).emit('contractUnvalidated', {
        contractId: id,
      })
      return response.json({ validators: numberOfValidations, participants: numberOfParticipants })
    } catch (error: any) {
      console.error('Error unsetting validation:', error)
      return response.status(500).json({
        error: 'Failed to unset validation',
        details: error.message || 'Unknown error',
      })
    }
  }
  public async unsetValidations({ params, response }: HttpContext) {
    const { id } = params
    try {
      await Contract.unsetValidations(id)
      const numberOfParticipants = await Contract.getNumberOfParticipants(id)

      return response.json({ validators: 0, participants: numberOfParticipants })
    } catch (error: any) {
      console.error('Error unsetting validations:', error)
      return response.status(500).json({
        error: 'Failed to unset validations',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async isValidated({ params, response, user }: HttpContext) {
    const { id } = params
    try {
      const isValidated = await Contract.isValidated(id, user.id)
      return response.json(isValidated)
    } catch (error: any) {
      console.error('Error checking validation status:', error)
      return response.status(500).json({
        error: 'Failed to check validation status',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async verifyEmail({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const { email } = request.body()
      const contract = await Contract.getContract(id)
      if (!contract) {
        return response.status(404).json({
          success: false,
          error: 'Contrat non trouvé.',
        })
      }
      const exists =
        Array.isArray(contract.cocontractants) && contract.cocontractants.includes(email)
      return response.json(exists)
    } catch (error: any) {
      return response.status(500).json({
        error: 'Failed to add co-contractant',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async setCoValidation({ params, request, response }: HttpContext) {
    const { id } = params
    const { email } = request.body()
    try {
      await Contract.setCoValidation(id, email)
      ws.io?.to(`contract_${id}`).emit('contractValidated', {
        contractId: id,
      })
      return response.json({ success: true })
    } catch (error: any) {
      console.error('Error setting co-validation:', error)
      return response.status(500).json({
        error: 'Failed to set co-validation',
        details: error.message || 'Unknown error',
      })
    }
  }
  public async unsetCoValidation({ params, request, response }: HttpContext) {
    const { id } = params
    const { email } = request.body()
    try {
      await Contract.unsetCoValidation(id, email)
      ws.io?.to(`contract_${id}`).emit('contractUnvalidated', {
        contractId: id,
      })
      return response.json({ success: true })
    } catch (error: any) {
      console.error('Error unsetting co-validation:', error)
      return response.status(500).json({
        error: 'Failed to unset co-validation',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async getCoValidation({ params, request, response }: HttpContext) {
    const { id } = params
    const { email } = request.body()
    try {
      const isValidated = await Contract.getCoValidation(id, email)
      return response.json({ isValidated })
    } catch (error: any) {
      console.error('Error getting co-validation status:', error)
      return response.status(500).json({
        error: 'Failed to get co-validation status',
        details: error.message || 'Unknown error',
      })
    }
  }
}
