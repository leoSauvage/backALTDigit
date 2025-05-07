import router from '@adonisjs/core/services/router'

// Routes pour la gestion des questionnaires
const questionnaireRouter = router
  .group(() => {
    // Créer un nouveau questionnaire
    router.post('/questionnaires', '#controllers/Conseil/Actions/questionnaire.create')

    // Récupérer un questionnaire
    router.get('/questionnaires/:id', '#controllers/Conseil/Actions/questionnaire.show')

    // Mettre à jour la configuration d'un questionnaire
    router.put('/questionnaires/:id', '#controllers/Conseil/Actions/questionnaire.updateConfig')

    // Ajouter une question à un questionnaire
    router.post(
      '/questionnaires/:id/questions',
      '#controllers/Conseil/Actions/questionnaire.addQuestion'
    )

    // Mettre à jour une question
    router.put(
      '/questionnaires/:id/questions/:questionId',
      '#controllers/Conseil/Actions/questionnaire.updateQuestion'
    )

    // Supprimer une question
    router.delete(
      '/questionnaires/:id/questions/:questionId',
      '#controllers/Conseil/Actions/questionnaire.deleteQuestion'
    )

    // Réorganiser les questions
    router.put(
      '/questionnaires/:id/reorder',
      '#controllers/Conseil/Actions/questionnaire.reorderQuestions'
    )
  })
  .prefix('/api/conseil')
//.middleware(['auth'])

export default questionnaireRouter
