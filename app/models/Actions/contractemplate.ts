import prisma from '#lib/prisma'
import { ContractTemplate, TemplateField } from '@prisma/client';

export default class ContractTemplateModel {
    /**
     * Crée un nouveau modèle de contrat
     */
    static async createTemplate(data: { name: string; templateContent: string }): Promise<ContractTemplate> {
        return prisma.contractTemplate.create({
            data: {
                name: data.name,
                template_content: data.templateContent,
            },
        })
    }

    /**
     * Récupère un modèle de contrat par son ID
     */
    static async getTemplateById(templateId: string): Promise<ContractTemplate & { template_fields: TemplateField[] }> {
        const template = await prisma.contractTemplate.findUnique({
            where: { id: templateId },
            include: { template_fields: true },
        })

        if (!template) {
            throw new Error('Modèle de contrat non trouvé')
        }

        return template
    }

    /**
   * Met à jour un modèle de contrat
   */
    static async updateTemplate(templateId: string, data: { name?: string; templateContent?: string }): Promise<ContractTemplate> {
        const updatedTemplate = await prisma.contractTemplate.update({
            where: { id: templateId },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.templateContent && { template_content: data.templateContent }),
            },
        })

        if (!updatedTemplate) {
            throw new Error('Échec de la mise à jour du modèle de contrat')
        }

        return updatedTemplate
    }

    

    /**
     * Supprime un champ dynamique d'un modèle de contrat
     */
    static async removeDynamicField(templateId: string, fieldId: string): Promise<void> {
        await prisma.templateField.delete({
            where: {
                field_id_template_id: {
                    field_id: fieldId,
                    template_id: templateId,
                },
            },
        })
    }
}