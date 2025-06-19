import router from '@adonisjs/core/services/router'

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
    
  })
  .prefix('/api/enterprise')
  .middleware(['auth'])

// Routes avec permissions spécifiques
router
  .get('/api/enterprise/reports', '#controllers/enterprise/reportsController.index')
  .middleware(['auth', 'checkPermission:view_reports'])

export default EnterpriseRouter
