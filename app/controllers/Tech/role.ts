import { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'

export default class RolesController {
  public async updatePermissions({ request, response }: HttpContext) {
    try {
      const { companyId, permissionAssignments: raw } = request.only([
        'companyId',
        'permissionAssignments',
      ])
      const permissionAssignments = raw as Record<string, Record<string, boolean>>
      const transformedPermissions: Record<string, Record<string, boolean>> = {}
      for (const [permission, roles] of Object.entries(permissionAssignments)) {
        for (const [role, isEnabled] of Object.entries(roles)) {
          if (!transformedPermissions[role]) {
            transformedPermissions[role] = {}
          }
          transformedPermissions[role][permission] = isEnabled
        }
      }
      const updatedRoles = await Role.updatePermissions(companyId, transformedPermissions)

      return response.status(201).json({ message: 'Permissions updated', data: updatedRoles })
    } catch (error) {
      console.error('Error updating permissions:', error)
      return response.status(500).json({
        error: 'Failed to update permissions',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async createRole({ request, response }: HttpContext) {
    try {
      const { name, permissions } = request.only(['name', 'permissions'])

      // Validation des données
      if (!name || !permissions) {
        return response.status(400).json({
          error: 'Name and permissions are required',
        })
      }

      const role = await Role.create(name, permissions)
      return response.status(201).json(role)
    } catch (error: any) {
      console.error('Error creating role:', error)
      return response.status(500).json({
        error: 'Failed to create role',
        details: error.message || 'Unknown error',
      })
    }
  }

  public async deleteRole({ params, response }: HttpContext) {
    try {
      const { id } = params
      await Role.delete(id)
      return response.status(204)
    } catch (error: any) {
      console.error('Error deleting role:', error)
      return response.status(500).json({
        error: 'Failed to delete role',
        details: error.message || 'Unknown error',
      })
    }
  }
  public async getAllRoles({ params, response }: HttpContext) {
    try {
      const { id } = params
      const roles = await Role.getAll(id)
      return response.json(roles)
    } catch (error: any) {
      console.error('Error retrieving roles:', error)
      return response.status(500).json({
        error: 'Failed to retrieve roles',
        details: error.message || 'Unknown error',
      })
    }
  }
}
