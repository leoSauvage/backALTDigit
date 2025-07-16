import router from '@adonisjs/core/services/router'

const PublicRouter = router
  .group(() => {
    router.post('login', '#controllers/Shared/user.login');
    router.post('logout', '#controllers/Shared/user.logout')

    //Validation
    router.post('contracts/:id/verify-co', '#controllers/Client/contract.verifyEmail')
    router.put('contracts/:id/validation', '#controllers/Client/contract.setCoValidation')
    router.put('contracts/:id/unset-validation', '#controllers/Client/contract.unsetCoValidation')
    router.get('contracts/:id/co-validation', '#controllers/Client/contract.getCoValidation')
  })
  .prefix('/api/public')

export default PublicRouter
