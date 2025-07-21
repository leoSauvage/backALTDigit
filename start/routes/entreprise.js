import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const EnterpriseRouter = router
  .group(() => {
    // Routes pour la gestion des contrats
    router.resource('contracts', '#controllers/enterprise/contractsController')

    // Routes pour la signature de documents
    router.post('contracts/:id/sign', '#controllers/enterprise/signaturesController.sign')

    // Routes pour les questionnaires
    router.get('questionnaires/:id', '#controllers/enterprise/questionnairesController.show')
    router.post(
      'questionnaires/:id/submit',
      '#controllers/enterprise/questionnairesController.submit'
    )

    //Création
    router.post('/contracts/create', '#controllers/contrats_controller.store')


    router.get('contracts/:id/fields', '#controllers/Client/contract.getFieldValues')
    router.put('contracts/:id/type', '#controllers/Client/contract.updateContractType')  
    router.put('contracts/:id/end', '#controllers/Client/contract.updateEndDate') 
    router.put('contracts/:id/start', '#controllers/Client/contract.updateStartDate') 
    router.get('/contracts/:id/info', '#controllers/Client/contract.getInfos')

    router.get('contracts/:id/workflow', '#controllers/Client/contract.getWorkflowId')

    router.get('contracts/:id/participants', '#controllers/Client/contract.getParticipants')
    router.post('contracts/:id/clients', '#controllers/Client/contract.addClient')
    router.put('contracts/:id/supervisor', '#controllers/Client/contract.setSupervisor')
    router.get('contracts/:id/is-supervisor', '#controllers/Client/contract.isSupervisor')
    router.put('contracts/:id/supervisor-validation', '#controllers/Client/contract.setSupervisorValidation')
    router.delete('contracts/:id/clients/:clientId', '#controllers/Client/contract.deleteClient')
    router.post('contracts/:id/co', '#controllers/Client/contract.addCo')
    router.delete('contracts/:id/co', '#controllers/Client/contract.deleteCo')
    router.get('contracts/:id/numb-participants', '#controllers/Client/contract.getNumberOfParticipants')
    router.get('contracts/:id/numb-validators', '#controllers/Client/contract.getNumberOfValidators')

    router.post('contracts/:id/reminders', '#controllers/Client/contract.addReminder')
    router.get('contracts/:id/reminders', '#controllers/Client/contract.getReminders')
    router.delete('contracts/reminders/:reminderId', '#controllers/Client/contract.deleteReminder')

    router.get('contracts/:id/right', '#controllers/Client/contract.getRight')
    router.put('contracts/:id/right', '#controllers/Client/contract.setRight')
    router.get('contracts/:id/document-id', '#controllers/Client/contract.getDocumentId')

    //GESTION ROLE / EQUIPE / MEMBRES
    
    router.get('companies/:id', '#controllers/Client/role.getAllRoles')

    router.put('companies', '#controllers/Client/role.updatePermissions')

    router.get('companies/:companyId/teams', '#controllers/Client/company.getTeams')
    router.post('companies/:companyId/teams', '#controllers/Client/company.createTeam')
    router.put('companies/teams/:teamId', '#controllers/Client/company.updateTeam')
    router.delete('companies/teams/:teamId', '#controllers/Client/company.deleteTeam')

    router.post('companies/roles/:roleId/users', '#controllers/Client/company.createUser')
    router.get('companies/:companyId/users', '#controllers/Client/company.getUsers')

    //VALIDATION
    router.put('contracts/:id/validation', '#controllers/Client/contract.setValidation')
    router.put('contracts/:id/unset-validation', '#controllers/Client/contract.unsetValidation')
    router.put('contracts/:id/validations', '#controllers/Client/contract.unsetValidations')
    router.get('contracts/:id/is-validated', '#controllers/Client/contract.isValidated')

    //NOTIFICATION (à mettre dans un autre fichier )
    router.get('notifications', '#controllers/Client/notification.getNotifications')
    router.put('notifications/:id/read', '#controllers/Client/notification.markAsRead')
    router.delete('notifications/:id', '#controllers/Client/notification.deleteNotification')
    
  })
  .prefix('/api/enterprise')
  .use(middleware.client())

// Routes avec permissions spécifiques
router
  .get('/api/enterprise/reports', '#controllers/enterprise/reportsController.index')
  .middleware(['auth', 'checkPermission:view_reports'])

export default EnterpriseRouter
