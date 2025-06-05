import prisma from '#lib/prisma'
import { Permission, Role as RoleModel } from '@prisma/client'

export default class Role {
  public static async updatePermissions(
    roleName: string,
    permissions: Permission[]
  ): Promise<RoleModel> {
    return prisma.role.update({
      where: {
        name: roleName,
      },
      data: {
        permissions: permissions,
      },
    })
  }

  public static async create(roleName: string, permissions: Permission[]): Promise<RoleModel> {
    return prisma.role.create({
      data: {
        name: roleName,
        permissions: permissions,
      },
    })
  }

  public static async delete(roleName: string): Promise<void> {
    await prisma.role.delete({
      where: {
        name: roleName,
      },
    })
  }

  public static async getAll(id: string): Promise<RoleModel[]> {
    return prisma.role.findMany({
      where: {
        company_id: id,
      },
      include: {
        permissions: true,
      },
    })
  }
}
