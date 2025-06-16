import prisma from '#lib/prisma'
import { Team, User } from '@prisma/client'

export default class Category {
  public static async getTeams(id: string): Promise<Team[]> {
    return prisma.team.findMany({
      where: {
        company_id: id,
      },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            role: true,
          },
        },
      },
    })
  }

  public static async create(color: string, name: string, company_id: string): Promise<Team> {
    return prisma.team.create({
      data: {
        color,
        name,
        company_id,
      },
    })
  }

  public static async delete(id: string): Promise<Team> {
    return prisma.team.delete({
      where: {
        id,
      },
    })
  }

  public static async update(id: string, color: string, name: string): Promise<Team> {
    return prisma.team.update({
      where: {
        id,
      },
      data: {
        color,
        name,
      },
    })
  }
}
