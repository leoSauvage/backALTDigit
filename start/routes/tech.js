import router from '@adonisjs/core/services/router'

const techRouter = router
  .group(() => {
    router.get('/companies/:id', '#controllers/Tech/role.getAllRoles')

    router.put('/companies', '#controllers/Tech/role.updatePermissions')

  })
  .prefix('/api/tech')
//.middleware(['auth']) // Décommentez si vous avez l'authentification configurée

export default techRouter
