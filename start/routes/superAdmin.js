import router from '@adonisjs/core/services/router'

const AdminRouter = router.group(() => {
    // Routes pour la gestion des utilisateurs du cabinet
    router.resource('cabinet-users', '#controllers/admin/cabinetUsersController')

    // Routes pour la gestion des entreprises
    router.resource('companies', '#controllers/admin/companiesController')

    // Routes pour les paramètres généraux
    router.get('settings', '#controllers/admin/settingsController.index')
    router.put('settings', '#controllers/admin/settingsController.update')

    // Routes pour les statistiques globales
    router.get('stats', '#controllers/admin/statsController.index')
})
    .prefix('/api/admin')
    .middleware(['auth', 'superAdmin'])

export default AdminRouter