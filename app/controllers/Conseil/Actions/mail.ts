import { MailActionConfig } from '#types/email'
import { HttpContext } from '@adonisjs/core/http'
import Mail from '#models/Actions/mail'
import Action from '#models/Actions/action'

import nodemailer from 'nodemailer'

export default class MailController {
  /**
   * Met à jour la configuration d'une action d'envoi de mail
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      const { id: actionId } = params
      const newConfig = request.body() as Partial<MailActionConfig>

      const updatedConfig = await Mail.updateMailActionConfig(actionId, newConfig)
      return response.ok(updatedConfig)
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({
          error: error.message || "Erreur lors de la mise à jour de l'action",
        })
      }
      return response.status(500).json({
        error: 'Une erreur inconnue est survenue lors de la mise à jour',
      })
    }
  }

  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, // Exemple: 'smtp.gmail.com'
      port: Number.parseInt(process.env.MAIL_PORT || '587'), // Port SMTP (587 ou 465 pour SSL)
      secure: process.env.MAIL_SECURE === 'true', // Utiliser SSL (true ou false)
      auth: {
        user: process.env.MAIL_USER, // Adresse e-mail d'envoi
        pass: process.env.MAIL_PASSWORD, // Mot de passe/clé d'application
      },
    })
  }

  public async sendEmail({ params, response }: HttpContext) {
    try {
      const { id: actionId } = params

      const action = await Action.getAction(actionId)
      const config = action.config as unknown as MailActionConfig

      const mailOptions: nodemailer.SendMailOptions = {
        from: process.env.MAIL_FROM || process.env.MAIL_USER, // Adresse d'envoi
        to: config.recipients.join(','), // Liste des destinataires
        subject: config.subject, // Sujet de l'e-mail
        html: config.body, // Corps de l'e-mail en HTML
        cc: config.cc?.join(','), // Copie (optionnel)
        bcc: config.bcc?.join(','), // Copie cachée (optionnel)
        attachments: config.attachments?.map((attachment) => ({
          filename: attachment.filename,
          path: attachment.path,
        })), // Pièces jointes (optionnel)
      }

      // Envoi de l'email
      const info = await this.transporter.sendMail(mailOptions)
      return response.status(200).json({
        message: 'Email envoyé avec succès',
        info,
      })
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email :", error)
      return response.status(500).json({
        error: "Erreur lors de l'envoi de l'email",
      })
    }
  }
}
