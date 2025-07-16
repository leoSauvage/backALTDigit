import prisma from '#lib/prisma'
import scheduler from 'adonisjs-scheduler/services/main'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'

scheduler
  .call(async () => {
    const now = DateTime.local().toJSDate()
    const reminders = await prisma.reminder.findMany({
      where: {
        date: { lte: now },
      },
      include: {
        contract: {
          select: {
            id: true,
            cocontractants: true,
            title: true,
            usercontracts: {
              select: {
                user_id: true,
              },
            },
          },
        },
      },
    })

    for (const r of reminders) {
      const { contract, title, id } = r
      const emails = contract.cocontractants
      const participantIds = r.contract.usercontracts.map((uc) => uc.user_id)

      for (const participantId of participantIds) {
        await prisma.notification.create({
          data: {
            user_id: participantId,
            contract_id: contract.id,
            message: `${contract.title} : ${title}`,
          },
        })
      }

      for (const toEmail of emails) {
        try {
          // 2) Envoi du mail à chaque cocontractant
          await mail.send((message) => {
            message
              .to(toEmail)
              .from('leo@coumbassa-sanden.com')
              .subject(`🔔 Rappel : ${contract.title}`)
              .text(`${title}`)
          })
        } catch (error) {
          console.error(`Erreur envoi à ${toEmail} pour reminder#${id}:`, error)
        }
      }
      // 3) Suppression du rappel une fois envoyé
      await prisma.reminder.deleteMany({
        where: { id },
      })
    }
  })
  .dailyAt('7:55')
