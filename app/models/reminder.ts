import prisma from '#lib/prisma'
import dayjs from 'dayjs'

export default class Reminder {
  public static async updateReminder(contractId: string) {
    // Use a transaction for faster, consistent reads and writes.
    await prisma.$transaction(async (tx) => {
      // Retrieve the contract by ID
      const contract = await tx.contract.findUnique({
        where: { id: contractId },
        select: {
          id: true,
          start_date: true,
          end_date: true,
        },
      })

      if (!contract) {
        throw new Error(`Contract with ID ${contractId} not found.`)
      }

      // Remove existing reminders for this contract in bulk
      await tx.reminder.deleteMany({
        where: { contract_id: contract.id },
      })

      // Determine if the contract is indefinite (no end_date) or limited
      const { start_date, end_date } = contract
      let newRemindersData: Array<{ contract_id: string; date: Date; auto: boolean }> = []

      if (!end_date) {
        const oneYearLater = dayjs(start_date).add(1, 'year').toDate()
        newRemindersData.push({
          contract_id: contract.id,
          date: oneYearLater,
          auto: true,
        })
      } else {
        // Limited contract: decide how many reminders to set
        // Example logic: if it's <= 1 month => 1 reminder one week before end
        // If between 2 months and 1 year => 2 reminders (two weeks & one week before)
        const diffInMonths = dayjs(end_date).diff(dayjs(start_date), 'month', true)

        if (diffInMonths <= 1) {
          // One reminder, one week before end_date
          newRemindersData.push({
            contract_id: contract.id,
            date: dayjs(end_date).subtract(1, 'week').toDate(),
            auto: true,
          })
        } else if (diffInMonths > 1 && diffInMonths <= 12) {
          // Two reminders: two weeks before and one week before end_date
          newRemindersData.push({
            contract_id: contract.id,
            date: dayjs(end_date).subtract(1, 'month').toDate(),
            auto: true,
          })
          newRemindersData.push({
            contract_id: contract.id,
            date: dayjs(end_date).subtract(1, 'week').toDate(),
            auto: true,
          })
        } else {
          newRemindersData.push({
            contract_id: contract.id,
            date: dayjs(end_date).subtract(2, 'month').toDate(),
            auto: true,
          })
          newRemindersData.push({
            contract_id: contract.id,
            date: dayjs(end_date).subtract(1, 'month').toDate(),
            auto: true,
          })
          newRemindersData.push({
            contract_id: contract.id,
            date: dayjs(end_date).subtract(1, 'week').toDate(),
            auto: true,
          })
        }
      }

      // Create new reminders in bulk
      if (newRemindersData.length > 0) {
        await tx.reminder.createMany({
          data: newRemindersData,
        })
      }
    })
  }

  public static async addReminder(contractId: string, date: Date, title: string) {
    // Validate date format
    if (!dayjs(date).isValid()) {
      throw new Error('Invalid date format')
    }
    // Check if contract exists
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    })

    if (!contract) {
      throw new Error(`Contract with ID ${contractId} not found.`)
    }

    // Create a new reminder for the contract
    await prisma.reminder.create({
      data: {
        contract_id: contractId,
        date: dayjs(date).toDate(),
        title,
        auto: false,
      },
    })
  }

  public static async getReminders(contractId: string) {
    // Retrieve reminders for the contract
    const reminders = await prisma.reminder.findMany({
      where: { contract_id: contractId },
      orderBy: { date: 'asc' },
    })
    if (!reminders || reminders.length === 0) {
      return null
    }
    return reminders.map((reminder) => ({
      id: reminder.id,
      date: dayjs(reminder.date).format('DD-MM-YYYY'),
      title: reminder.title,
      auto: reminder.auto,
    }))
  }
  public static async deleteReminder(reminderId: string) {
    // Delete a specific reminder by ID
    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
    })

    if (!reminder) {
      throw new Error(`Reminder with ID ${reminderId} not found.`)
    }

    await prisma.reminder.delete({
      where: { id: reminderId },
    })
  }
}
