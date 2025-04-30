import { PrismaClient } from '@prisma/client'

// Création d'un singleton de PrismaClient avec des logs détaillés
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
})

// Fonctions auxiliaires pour la gestion de connexion
const connect = async () => {
    try {
        await prisma.$connect()
        console.log('Prisma Client successfully connected to the database')
        return true
    } catch (error) {
        console.error('Failed to connect to the database:', error)
        return false
    }
}

const disconnect = async () => {
    try {
        await prisma.$disconnect()
        console.log('Prisma Client disconnected from the database')
        return true
    } catch (error) {
        console.error('Failed to disconnect from the database:', error)
        return false
    }
}

// Exposer le client et les fonctions d'aide
export default prisma
export { connect, disconnect }