export interface MailActionConfig {
  subject: string // Sujet de l'email
  body: string // Corps du message (peut inclure du HTML ou du texte brut)
  destinataires: string[] // Liste des destinataires
  CC?: string[] // Destinataires en copie (optionnel)
  BCC?: string[] // Destinataires en copie cachée (optionnel)
  attachments?: string[] // Liste des pièces jointes
}
