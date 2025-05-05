import prisma from '#lib/prisma'
import type { Workflow as WorkflowType } from '@prisma/client'

export default class Workflow {
    /**
     * Crée un nouveau workflow
     * @param name Nom du workflow
     * @param fileName Nom du fichier/dossier associé
     * @param createdById ID de l'utilisateur qui crée le workflow (optionnel)
     */
    public static async create(
        name: string,
        createdById?: string
    ): Promise<WorkflowType> {
        return await prisma.workflow.create({
            data: {
                name,
                created_by_id: createdById
            }
        })
    }

    /**
     * Récupère tous les workflows avec pagination
     * @param page Numéro de page
     * @param limit Nombre d'éléments par page
     */
    public static async getAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit

        const [workflows, total] = await Promise.all([
            prisma.workflow.findMany({
                skip,
                take: limit,
                include: {
                    created_by: {
                        select: {
                            id: true
                        }
                    },
                    _count: {
                        select: {
                            steps: true
                            //contracts: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            }),
            prisma.workflow.count()
        ])

        return {
            data: workflows,
            pagination: {
                total,
                page,
                limit,
                lastPage: Math.ceil(total / limit)
            }
        }
    }

    /**
     * Récupère un workflow par son ID
     * @param id ID du workflow
     * @param includeSteps Si true, inclut les étapes associées
     */
    public static async findById(id: string, includeSteps: boolean = false) {
        return await prisma.workflow.findUnique({
            where: { id },
            include: {
                created_by: {
                    select: {
                        id: true
                    }
                },
                steps: includeSteps ? {
                    include: {
                        stepActions: {
                            include: {
                                action: true
                            },
                            orderBy: {
                                action_order: 'asc'
                            }
                        }
                    },
                    orderBy: {
                        step: 'asc'
                    }
                } : false
            }
        })
    }

    /**
     * Met à jour un workflow
     * @param id ID du workflow à mettre à jour
     * @param data Données à mettre à jour (nom et/ou nom du fichier)
     */
    public static async update(
        id: string,
        data: { name?: string; fileName?: string }
    ) {
        // Vérifier si le workflow existe
        const workflow = await prisma.workflow.findUnique({
            where: { id }
        })

        if (!workflow) {
            throw new Error('Workflow not found')
        }

        return await prisma.workflow.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.fileName && { file_name: data.fileName }), //file name not working
                updated_at: new Date()
            }
        })
    }

    /**
     * Supprime un workflow et toutes ses étapes associées
     * @param id ID du workflow à supprimer
     */
    public static async delete(id: string) {
        // Vérifier si le workflow existe
        const workflow = await prisma.workflow.findUnique({
            where: { id },
            include: {
                steps: {
                    include: {
                        stepActions: true
                    }
                },
                //contracts: true
            }
        })

        if (!workflow) {
            throw new Error('Workflow not found')
        }

        // Vérifier si des contrats utilisent ce workflow
        // if (workflow.contracts.length > 0) {
        //     throw new Error('Cannot delete workflow that is being used by contracts')
        // }

        // Transaction pour assurer l'intégrité des données lors de la suppression
        await prisma.$transaction(async (tx) => {
            // 1. Supprimer toutes les stepActions associées aux étapes du workflow
            for (const step of workflow.steps) {
                await tx.stepAction.deleteMany({
                    where: { step_id: step.id }
                })
            }

            // 2. Supprimer toutes les étapes
            await tx.step.deleteMany({
                where: { workflow_id: id }
            })

            // 3. Supprimer le workflow
            await tx.workflow.delete({
                where: { id }
            })
        })

        return { success: true, message: 'Workflow deleted successfully' }
    }
}