export interface MailActionConfig {
  subject: string // Sujet de l'email
  body: string // Corps du message (peut inclure du HTML ou du texte brut)
  recipients: string[] // Liste des destinataires
  cc?: string[] // Destinataires en copie (optionnel)
  bcc?: string[] // Destinataires en copie cachée (optionnel)
  attachments?: {
    filename: string // Nom du fichier
    path: string // Chemin du fichier ou URL pour accès
  }[] // Liste des pièces jointes
}
