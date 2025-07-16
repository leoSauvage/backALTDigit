import prisma from '#lib/prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { User as UserModel } from '@prisma/client'


export default class User {
  public static async create(
    email: string,
    firstName: string,
    lastName: string,
    roleId: string,
    teamId: string,
    hashPassword: string
  ): Promise<User> {
    return prisma.user.create({
      data: {
        email: email,
        first_name: firstName,
        last_name: lastName,
        role_id: roleId,
        team_id: teamId,
        password_hash: hashPassword,
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

  public static async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email: email,
      },
    })
  }

  public static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: {
        id: id,
      },
    })
  }

  public static async comparePasswords(dbPassword: string, attemptPassword: string){
    return await bcrypt.compare(attemptPassword, dbPassword);
  }

  public static async hashPassword(password: string) {
    console.log('password', password)
    if (!password) {
      throw new Error('Password is required for hashing')
    }
    return await bcrypt.hash(password, 10)
  }

  public static async createJwt(user: UserModel) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.APP_KEY,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
  }
}
