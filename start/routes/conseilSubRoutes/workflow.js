import router from '@adonisjs/core/services/router'

const workflowRouter = router
  .group(() => {
    // Récupérer tous les workflows
    router.get('/workflows', '#controllers/Conseil/workflow.index')

    // Créer un nouveau workflow
    router.post('/workflows', '#controllers/Conseil/workflow.create')

    // Récupérer un workflow spécifique
    router.get('/workflows/:id', '#controllers/Conseil/workflow.show')

    // Mettre à jour un workflow
    router.put('/workflows/:id', '#controllers/Conseil/workflow.update')

    // Mettre à jour le contenu d'un workflow
    router.put('/workflows/attributes/:id', '#controllers/Conseil/workflow.updateAttributes')
    // Supprimer un workflow
    router.delete('/workflows/:id', '#controllers/Conseil/workflow.delete')
  })
  .prefix('/api/conseil')
//.middleware(['auth']) // Décommentez si vous avez l'authentification configurée

export default workflowRouter
