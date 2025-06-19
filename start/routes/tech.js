import router from '@adonisjs/core/services/router'

const techRouter = router
  .group(() => {
    router.get('/companies/:id', '#controllers/Tech/role.getAllRoles')

    router.put('/companies', '#controllers/Tech/role.updatePermissions')

    router.get('/companies/:companyId/teams', '#controllers/Tech/company.getTeams')
    router.post('/companies/:companyId/teams', '#controllers/Tech/company.createTeam')
    router.put('/companies/teams/:teamId', '#controllers/Tech/company.updateTeam')
    router.delete('/companies/teams/:teamId', '#controllers/Tech/company.deleteTeam')

    router.post('/companies/roles/:roleId/users', '#controllers/Tech/company.createUser')
    router.get('/companies/:companyId/users', '#controllers/Tech/company.getUsers')
    
    router.post('contracts/share', '#controllers/Shared/sharelink.generateShareLink')
    router.get('/contracts/shared/:token', '#controllers/Shared/sharelink.accessSharedContract')
  })
  .prefix('/api/tech')
//.middleware(['auth']) // Décommentez si vous avez l'authentification configurée

export default techRouter
