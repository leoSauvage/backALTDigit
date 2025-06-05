import prisma from '#lib/prisma'
import { Company as CompanyModel } from '@prisma/client'

export default class Company {
  public static async create(name: string, email: string): Promise<CompanyModel> {
    return prisma.company.create({
      data: {
        name: name,
        email: email,
      },
    })
  }

  public static async getAll(): Promise<CompanyModel[]> {
    return prisma.company.findMany()
  }

  public static async getAllClientByCompany(id: string): Promise<CompanyModel[]> {
    return prisma.company.findMany({
      where: {
        id: id,
      },
      include: {
        roles: { true,
        include: 
          users: true,
        },
      },
    })
  }
}
