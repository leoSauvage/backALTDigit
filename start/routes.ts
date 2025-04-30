import router from '@adonisjs/core/services/router'

// Importer les sous-routes
import './routes/conseilSubRoutes/action.js'

// Route de test pour l'API
router.get('/api/test', async ({ response }) => {
  return response.json({ message: "API fonctionne correctement" })
})

// Wildcard route pour le frontend SPA (à ajouter en dernier)
router.get('*', async ({ response }) => {
  return response.json("test")
})