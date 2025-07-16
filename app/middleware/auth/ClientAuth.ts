import { HttpContext } from '@adonisjs/core/http'
import Jwt from 'jsonwebtoken'
import env from '#start/env'
import prisma from '#lib/prisma'

// Extend HttpContext to include 'user'
declare module '@adonisjs/core/http' {
  interface HttpContext {
    user?: any
  }
}

export default class ClientAuth {
  /**
   * This middleware checks if the token is valid, finds the user from the database,
   * and attaches the user to the context so that controllers can identify the requester.
   */
  public async handle(ctx: HttpContext, next: () => Promise<void>) {
    // We read the token from cookie named 'authToken'
    const token = ctx.request.cookie('authToken')
    if (!token) {
      return ctx.response.unauthorized({ error: 'Token manquant' })
    }

    try {
      // 1) Validate the JWT token
      const payload = Jwt.verify(token, env.get('APP_KEY')) as {
        id: string
        iat: number
        exp: number
      }
      // 2) Retrieve the user by ID from the database
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
      })

      if (!user) {
        return ctx.response.unauthorized({ error: 'Utilisateur introuvable' })
      }

      ctx.user = user
      // Proceed to the next middleware or controller
      await next()
    } catch (err) {
      return ctx.response.unauthorized({ error: 'Token invalide ou expiré' })
    }
  }
}
