import router from '@adonisjs/core/services/router'

// Routes pour la gestion des questionnaires
const questionnaireRouter = router.group(() => {
    // Créer un nouveau questionnaire
    router.post('/questionnaires', '#controllers/Admin/Actions/questionnaire.create')

    // Récupérer un questionnaire
    router.get('/questionnaires/:id', '#controllers/Admin/Actions/questionnaire.show')

    // Mettre à jour la configuration d'un questionnaire
    router.put('/questionnaires/:id', '#controllers/Admin/Actions/questionnaire.updateConfig')

    // Ajouter une question à un questionnaire
    router.post('/questionnaires/:id/questions', '#controllers/Admin/Actions/questionnaire.addQuestion')

    // Mettre à jour une question
    router.put('/questionnaires/:id/questions/:questionId', '#controllers/Admin/Actions/questionnaire.updateQuestion')

    // Supprimer une question
    router.delete('/questionnaires/:id/questions/:questionId', '#controllers/Admin/Actions/questionnaire.deleteQuestion')

    // Réorganiser les questions
    router.put('/questionnaires/:id/reorder', '#controllers/Admin/Actions/questionnaire.reorderQuestions')
})
    .prefix('/api/cabinet')
    //.middleware(['auth'])

export default questionnaireRouter