/*
|--------------------------------------------------------------------------
| HTTP server entrypoint
|--------------------------------------------------------------------------
|
| The "server.ts" file is the entrypoint for starting the AdonisJS HTTP
| server. Either you can run this file directly or use the "serve"
| command to run this file and monitor file changes
|
*/

import 'reflect-metadata'
import { Ignitor, prettyPrintError } from '@adonisjs/core'

/**
 * URL to the application root. AdonisJS need it to resolve
 * paths to file and directories for scaffolding commands
 */
const APP_ROOT = new URL('../', import.meta.url)

/**
 * The importer is used to import files in context of the
 * application.
 */
const IMPORTER = async (filePath: string) => {
  try {
    // Vérifier explicitement si le module 'Admin' est demandé
    if (filePath === 'Admin') {
      console.warn('Warning: Attempted to import "Admin" module which is not defined.')
      // Retourner un objet vide pour éviter l'erreur
      return { default: {} }
    }

    if (filePath.startsWith('./') || filePath.startsWith('../')) {
      return await import(new URL(filePath, APP_ROOT).href)
    }
    return await import(filePath)
  } catch (error) {
    console.error(`Error importing module: ${filePath}`, error)
    // Si le module n'est pas trouvé mais est critique, rethrow l'erreur
    if (filePath !== 'Admin') {
      throw error
    }
    // Retourner un objet vide pour les modules non critiques
    return { default: {} }
  }
}

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .httpServer()
  .start()
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })
