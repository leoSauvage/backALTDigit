// import type { HttpContext } from '@adonisjs/core/http'
// import type { NextFn } from '@adonisjs/core/types/http'
// import { errors } from '@adonisjs/auth'

// export default class SuperAdminMiddleware {
//     async handle(ctx: HttpContext, next: NextFn) {
//         const user = ctx.auth.user

//         if (!user) {
//             throw new errors.E_UNAUTHORIZED_ACCESS('Authentification requise')
//         }

//         if (user.role?.name !== 'super_admin') {
//             throw new errors.E_UNAUTHORIZED_ACCESS('Accès restreint aux super administrateurs')
//         }

//         return next()
//     }
// }
