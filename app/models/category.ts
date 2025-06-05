import prisma from '#lib/prisma'

export default class Category {
  public static async getAll(): Promise<Category[]> {
    return prisma.category.findMany({
      include: {
        workflows: true,
      },
    })
  }
  public static async create(name: string): Promise<Category> {
    return prisma.category.create({
      data: {
        name,
      },
    })
  }
}
