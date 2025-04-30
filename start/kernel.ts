/*
|--------------------------------------------------------------------------
| HTTP kernel file
|--------------------------------------------------------------------------
|
| The HTTP kernel file is used to register the middleware with the server
| or the router.
|
*/

import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'
import { connect, disconnect } from '#lib/prisma' // Import du singleton Prisma

/**
 * The error handler is used to convert an exception
 * to a HTTP response.
 */
server.errorHandler(() => import('#exceptions/handler'))

/**
 * The server middleware stack runs middleware on all the HTTP
 * requests, even if there is no route registered for
 * the request URL.
 */
server.use([
  () => import('#middleware/container_bindings_middleware'),
  () => import('#middleware/force_json_response_middleware'),
  // Commentez la ligne suivante si vous n'avez pas installé @adonisjs/cors
  // () => import('@adonisjs/cors/cors_middleware'),
])

/**
 * The router middleware stack runs middleware on all the HTTP
 * requests with a registered route.
 */
router.use([() => import('@adonisjs/core/bodyparser_middleware'), () => import('@adonisjs/auth/initialize_auth_middleware')])

/**
 * Named middleware collection must be explicitly assigned to
 * the routes or the routes group.
 */
export const middleware = router.named({
  auth: () => import('#middleware/auth_middleware'),
  //superAdmin: () => import('#middleware/auth/superAdmin'),
  conseil: () => import('#middleware/auth/conseil'),
  checkPermission: () => import('#middleware/permissions/checkPermission'),
})


// Connexion à Prisma au démarrage
connect()
  .then((success) => {
    if (!success) {
      console.warn('Application starting without database connection')
    }
  })
  .catch((error: Error) => {
    console.error('Unhandled error during database connection:', error)
  })

// Assure-toi de fermer proprement la connexion lorsque l'application s'arrête
process.on('SIGTERM', async () => {
  await disconnect()
})

process.on('SIGINT', async () => {
  await disconnect()
  process.exit(0)
})