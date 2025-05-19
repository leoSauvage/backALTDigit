import router from '@adonisjs/core/services/router'

const etapeRouter = router
  .group(() => {
    // Récupérer toutes les étapes d'un workflow
    router.get('/workflows/:workflow_id/steps', '#controllers/Conseil/etape.getByWorkflow')

    // Créer une nouvelle étape
    router.post('/steps/:id', '#controllers/Conseil/etape.create')

    // Récupérer une étape spécifique
    router.get('/steps/:id', '#controllers/Conseil/etape.show')

    // Mettre à jour une étape
    router.put('/steps/:id', '#controllers/Conseil/etape.update')

    // Réorganiser les étapes d'un workflow
    router.put('/workflows/:workflow_id/steps/reorder', '#controllers/Conseil/etape.reorder')

    // Supprimer une étape
    router.delete('/steps/:id', '#controllers/Conseil/etape.delete')
  })
  .prefix('/api/conseil')
//.middleware(['auth']) // Décommentez si vous avez l'authentification configurée

export default etapeRouter
