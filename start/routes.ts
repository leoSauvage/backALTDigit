import { default as Route, default as router } from '@adonisjs/core/services/router'
// Importer les sous-routes
import './routes/conseilSubRoutes/Actions/questionnaire.js'
import './routes/conseilSubRoutes/etape.js'
import './routes/conseilSubRoutes/workflow.js'
import './routes/tech.js'

// const AdminCompagniesController = () => import('#controllers/admin_compagnies_controller');

// Route de test pour l'API
router.get('/api/test', async ({ response }) => {
  return response.json({ message: 'API fonctionne correctement' })
})

// Wildcard route pour le frontend SPA (à ajouter en dernier)
// Route.get('*', async ({ response }) => {
//   return response.json('test')
// })

// Entreprise
Route.get('/api/contract-all', '#controllers/admin_compagnies_controller.contractList')
Route.post('/api/company', '#controllers/users_controller.createCompany')
Route.post('/api/create-contract', '#controllers/contrats_controller.store')
Route.get('/api/contact-steps/:id', '#controllers/admin_compagnies_controller.contractSteps')
Route.get('/api/contact-steps/:stepID', '#controllers/admin_compagnies_controller.nextAction')
Route.get('/api/init-contract/:workflowId', '#controllers/admin_compagnies_controller.initContract')
Route.get('/api/get-step-action/:id', '#controllers/admin_compagnies_controller.initContract')

Route.get('/api/init-contract/:workflowId', '#controllers/admin_compagnies_controller.initContract')
Route.post('/api/submit-action', '#controllers/admin_compagnies_controller.submitAction')
Route.post(
  '/api/get-previous-step-data',
  '#controllers/admin_compagnies_controller.getPreviousStepData'
)
