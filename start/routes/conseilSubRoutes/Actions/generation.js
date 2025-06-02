import router from '@adonisjs/core/services/router'

// Routes pour la gestion des questionnaires
const generationRouter = router
  .group(() => {
    // Créer un nouveau questionnaire
    router.post('/generation', '#controllers/Conseil/Actions/generation.upload')

    // Récupérer un questionnaire
    router.get('/generation', '#controllers/Conseil/Actions/generation.retrieve')

    // Mettre à jour la configuration d'un questionnaire
    router.put('/generation/:id', '#controllers/Conseil/Actions/generation.updateFile')
  })
  .prefix('/api/conseil')
//.middleware(['auth'])

export default generationRouter
