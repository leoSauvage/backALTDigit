import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { errors } from '@adonisjs/auth'
import PermissionService from '../../lib/permissions/permissionService.js'

export default class CheckPermissionMiddleware {
  async handle(ctx: HttpContext, next: NextFn, permissions: string[]) {
    const user = ctx.auth.user

    if (!user) {
      throw new errors.E_UNAUTHORIZED_ACCESS('Authentification requise')
    }

    const permissionService = new PermissionService()
    const hasPermission = await permissionService.checkUserPermissions(user, permissions)

    if (!hasPermission) {
      throw new errors.E_UNAUTHORIZED_ACCESS(
        "Vous n'avez pas les permissions requises pour effectuer cette action"
      )
    }

    return next()
  }
}
