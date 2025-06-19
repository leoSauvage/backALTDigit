import prisma from '#lib/prisma'

export default class User {
  public static async create(
    email: string,
    firstName: string,
    lastName: string,
    roleId: string,
    teamId: string
  ): Promise<User> {
    return prisma.user.create({
      data: {
        email: email,
        first_name: firstName,
        last_name: lastName,
        role_id: roleId,
        team_id: teamId,
      },
    })
  }

  public static async getUsersByTeams(teamIds: string[]): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        team_id: {
          in: teamIds,
        },
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        created_at: true,
        role: {
          select: {
            name: true,
          },
        },
        team: {
          select: {
            name: true,
          },
        },
      },
    })
  }
}
