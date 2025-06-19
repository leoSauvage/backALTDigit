import prisma from '#lib/prisma'
import { Permission, Role as RoleModel } from '@prisma/client'

export default class Role {
  public static async updatePermissions(
    companyId: string,
    permissionAssignments: Record<string, Record<string, boolean>>
  ) {
    const updatedRoles = []
    for (const [roleId, permsForRole] of Object.entries(permissionAssignments)) {
      const activePermissionKeys = Object.keys(permsForRole).filter(
        (permKey) => permsForRole[permKey]
      )
      const existing = await prisma.role.findFirst({
        where: {
          id: roleId,
        },
      })
      let upsertedRole
      if (existing) {
        // 2a) s’il existe, on update
        upsertedRole = await prisma.role.update({
          where: { id: existing.id },
          data: {
            permissions: {
              set: activePermissionKeys as Permission[],
            },
          },
        })
      } else {
        // 2b) sinon on crée
        upsertedRole = await prisma.role.create({
          data: {
            name: roleId,
            company_id: companyId,
            permissions: {
              set: activePermissionKeys as Permission[],
            },
          },
        })
      }
      updatedRoles.push(upsertedRole)
    }
    return updatedRoles
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
    })
  }
}
