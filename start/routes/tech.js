import router from '@adonisjs/core/services/router'

const techRouter = router
  .group(() => {
    
    router.post('contracts/share', '#controllers/Shared/sharelink.generateShareLink')
    router.get('/contracts/shared/:token', '#controllers/Shared/sharelink.accessSharedContract')
  })
  .prefix('/api/tech')
//.middleware(['auth']) // Décommentez si vous avez l'authentification configurée

export default techRouter
