import prisma from '#lib/prisma'
import Contract from './contract.ts'
import ws from '#models/ws'

export default class DynamicField {
  public static async createContractNotification(
    message: string,
    contractId: string
  ): Promise<void> {
    const participants = await Contract.getParticipants(contractId)
    if (!participants) {
      throw new Error('Contract not found')
    }
    participants.usercontracts.map((participant) => {
      ws.io?.to(`user_${participant.user.id}`).emit('notificationContract', {
        message,
      })
      return prisma.notification.create({
        data: {
          user_id: participant.user.id,
          message,
        },
      })
    })
  }
}
