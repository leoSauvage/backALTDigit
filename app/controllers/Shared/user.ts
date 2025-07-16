import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class ContractSharingController {
  /**
   * Generate a temporary share link for a contract
   */
  public async login({ request, response }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])

      const user = await User.getUserByEmail(email)

      if (!user) {
        // Si l'utilisateur n'est pas trouvé, renvoyer une réponse d'erreur générique
        return response.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
      }

      const isPasswordValid = User.comparePasswords(user.password_hash, password)

      if (!isPasswordValid) {
        // Si le mot de passe n'est pas valide, renvoyer une réponse d'erreur générique
        return response.status(401).json({ message: "Nom d'utilisateur ou mot de passe incorrect" });
      }
      const JWTtoken = await User.createJwt(user)
      response.cookie('authToken', JWTtoken, {
        httpOnly: true,
        maxAge: 28800,
        secure: true,
        sameSite: 'none',
      });
      response.status(200).json({
        expirationInSec: 28800,
        user_id: user.id,
        message: 'Connexion réussie',
      });
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  }

  public async logout({ response }: HttpContext) {
    response.clearCookie('authToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    })
    return response.ok({
      message: 'Déconnexion réussie',
    })
  }
}
