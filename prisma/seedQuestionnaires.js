import pkg from '@prisma/client'
const { PrismaClient, FieldType, TypeActions, Status, Languages } = pkg
const prisma = new PrismaClient()
//Commande :=> node prisma/seedQuestionnaires.js

async function createQuestionnairesForStep(stepId, configs) {
  console.log(`Creating questionnaires for step ${stepId}...`)

  // Créer les actions de type QUESTIONNAIRE pour chaque étape
  await Promise.all(
    configs.map((config, index) => {
      return prisma.action.create({
        data: {
          step_id: stepId,
          type: TypeActions.QUESTIONNAIRE,
          config: config,
          order: index + 1,
          is_required: true,
        },
      })
    })
  )
}

async function main() {
  console.log('Starting seed script...')

  // Create test company
  const company = await prisma.company.upsert({
    where: { email: 'contact@testcompany.com' },
    update: {},
    create: {
      name: 'Test Company',
      email: 'contact@testcompany.com',
    },
  })
  console.log(`Created company: ${company.name}`)

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin' },
  })

  const legalRole = await prisma.role.upsert({
    where: { name: 'Legal' },
    update: {},
    create: { name: 'Legal' },
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: { name: 'User' },
  })

  console.log(`Created roles: Admin, Legal, User`)

  // Create test users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@testcompany.com' },
    update: {},
    create: {
      email: 'admin@testcompany.com',
      password_hash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // 'password123'
      first_name: 'Admin',
      last_name: 'User',
      role_id: adminRole.id,
      company_id: company.id,
    },
  })

  const legalUser = await prisma.user.upsert({
    where: { email: 'legal@testcompany.com' },
    update: {},
    create: {
      email: 'legal@testcompany.com',
      password_hash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // 'password123'
      first_name: 'Legal',
      last_name: 'User',
      role_id: legalRole.id,
      company_id: company.id,
    },
  })

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@testcompany.com' },
    update: {},
    create: {
      email: 'user@testcompany.com',
      password_hash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // 'password123'
      first_name: 'Regular',
      last_name: 'User',
      role_id: userRole.id,
      company_id: company.id,
    },
  })

  console.log(`Created users: ${adminUser.email}, ${legalUser.email}, ${regularUser.email}`)

  // Create workflows
  const standardContractWorkflow = await prisma.workflow.upsert({
    where: { id: 'standard-contract-workflow' },
    update: {
      name: 'Standard Contract Workflow',
      description: 'Workflow for standard contract processing',
      created_by_id: adminUser.id,
    },
    create: {
      id: 'standard-contract-workflow',
      name: 'Standard Contract Workflow',
      description: 'Workflow for standard contract processing',
      created_by_id: adminUser.id,
    },
  })

  const ndaWorkflow = await prisma.workflow.upsert({
    where: { id: 'nda-process' },
    update: {
      name: 'NDA Process',
      description: 'Workflow for processing Non-Disclosure Agreements',
      created_by_id: adminUser.id,
    },
    create: {
      id: 'nda-process',
      name: 'NDA Process',
      description: 'Workflow for processing Non-Disclosure Agreements',
      created_by_id: adminUser.id,
    },
  })

  console.log(`Created workflows: ${standardContractWorkflow.name}, ${ndaWorkflow.name}`)

  // Create steps for Standard Contract Workflow
  const draftStep = await prisma.step.upsert({
    where: { id: 'draft-step' },
    update: {
      name: 'Draft Contract',
      description: 'Create initial contract draft',
      workflow_id: standardContractWorkflow.id,
      order: 1,
    },
    create: {
      id: 'draft-step',
      name: 'Draft Contract',
      description: 'Create initial contract draft',
      workflow_id: standardContractWorkflow.id,
      order: 1,
    },
  })

  const legalReviewStep = await prisma.step.upsert({
    where: { id: 'legal-review-step' },
    update: {
      name: 'Legal Review',
      description: 'Legal department reviews the contract',
      workflow_id: standardContractWorkflow.id,
      order: 2,
    },
    create: {
      id: 'legal-review-step',
      name: 'Legal Review',
      description: 'Legal department reviews the contract',
      workflow_id: standardContractWorkflow.id,
      order: 2,
    },
  })

  const approvalStep = await prisma.step.upsert({
    where: { id: 'approval-step' },
    update: {
      name: 'Final Approval',
      description: 'Get final approval for the contract',
      workflow_id: standardContractWorkflow.id,
      order: 3,
    },
    create: {
      id: 'approval-step',
      name: 'Final Approval',
      description: 'Get final approval for the contract',
      workflow_id: standardContractWorkflow.id,
      order: 3,
    },
  })

  console.log(`Created steps for Standard Contract Workflow`)

  // Create steps for NDA Workflow
  const ndaDraftStep = await prisma.step.upsert({
    where: { id: 'nda-draft-step' },
    update: {
      name: 'Draft NDA',
      description: 'Create initial NDA draft',
      workflow_id: ndaWorkflow.id,
      order: 1,
    },
    create: {
      id: 'nda-draft-step',
      name: 'Draft NDA',
      description: 'Create initial NDA draft',
      workflow_id: ndaWorkflow.id,
      order: 1,
    },
  })

  const ndaReviewStep = await prisma.step.upsert({
    where: { id: 'nda-review-step' },
    update: {
      name: 'NDA Review',
      description: 'Legal department reviews the NDA',
      workflow_id: ndaWorkflow.id,
      order: 2,
    },
    create: {
      id: 'nda-review-step',
      name: 'NDA Review',
      description: 'Legal department reviews the NDA',
      workflow_id: ndaWorkflow.id,
      order: 2,
    },
  })

  const ndaSignatureStep = await prisma.step.upsert({
    where: { id: 'nda-signature-step' },
    update: {
      name: 'NDA Signature',
      description: 'Sign the NDA',
      workflow_id: ndaWorkflow.id,
      order: 3,
    },
    create: {
      id: 'nda-signature-step',
      name: 'NDA Signature',
      description: 'Sign the NDA',
      workflow_id: ndaWorkflow.id,
      order: 3,
    },
  })

  console.log(`Created steps for NDA Workflow`)

  // Create sample contracts
  const standardContract = await prisma.contract.upsert({
    where: { id: 'standard-contract-1' },
    update: {
      title: 'Service Agreement with Acme Corp',
      status: Status.NEGOCIATION,
      data: {
        client_name: 'Acme Corporation',
        contract_value: 50000,
        start_date: '2025-06-01',
        end_date: '2026-05-31',
      },
      language: Languages.Français,
      isConfidential: false,
      workflow: {
        connect: {
          id: standardContractWorkflow.id
        }
      }
    },
    create: {
      id: 'standard-contract-1',
      title: 'Service Agreement with Acme Corp',
      status: Status.NEGOCIATION,
      data: {
        client_name: 'Acme Corporation',
        contract_value: 50000,
        start_date: '2025-06-01',
        end_date: '2026-05-31',
      },
      language: Languages.Français,
      isConfidential: false,
      workflow: {
        connect: {
          id: standardContractWorkflow.id
        }
      }
    },
  })

  const ndaContract = await prisma.contract.upsert({
    where: { id: 'nda-contract-1' },
    update: {
      title: 'Confidential NDA',
      status: Status.PREPARATION,
      data: {
        counterparty: 'TechPartner Inc.',
        effective_date: '2025-05-30',
      },
      language: Languages.Anglais,
      isConfidential: true,
      workflow_id: ndaWorkflow.id,
    },
    create: {
      id: 'nda-contract-1',
      title: 'Confidential NDA',
      status: Status.PREPARATION,
      data: {
        counterparty: 'TechPartner Inc.',
        effective_date: '2025-05-30',
      },
      language: Languages.Anglais,
      isConfidential: true,
      workflow_id: ndaWorkflow.id,
    },
  })

  // Additional sample contracts
  const consultingContract = await prisma.contract.upsert({
    where: { id: 'consulting-contract-1' },
    update: {
      title: 'Consulting Agreement with Beta LLC',
      status: Status.NEGOCIATION,
      data: {
        client_name: 'Beta LLC',
        contract_value: 75000,
        start_date: '2025-07-01',
        end_date: '2026-06-30',
      },
      language: Languages.Français,
      isConfidential: false,
      workflow_id: standardContractWorkflow.id,
    },
    create: {
      id: 'consulting-contract-1',
      title: 'Consulting Agreement with Beta LLC',
      status: Status.NEGOCIATION,
      data: {
        client_name: 'Beta LLC',
        contract_value: 75000,
        start_date: '2025-07-01',
        end_date: '2026-06-30',
      },
      language: Languages.Français,
      isConfidential: false,
      workflow_id: standardContractWorkflow.id,
    },
  })

  console.log(`Created sample contracts`)

  // Seed questionnaires data
  await seedQuestionnaires()

  console.log('Seed data creation completed successfully!')
}

async function seedQuestionnaires() {
  console.log('Starting questionnaire data seeding...')

  // Récupérer toutes les étapes
  const draftStep = await prisma.step.findFirst({
    where: {
      name: 'Draft Contract',
    },
  })

  const legalReviewStep = await prisma.step.findFirst({
    where: {
      name: 'Legal Review',
    },
  })

  const approvalStep = await prisma.step.findFirst({
    where: {
      name: 'Final Approval',
    },
  })

  const ndaDraftStep = await prisma.step.findFirst({
    where: {
      name: 'Draft NDA',
    },
  })

  const ndaReviewStep = await prisma.step.findFirst({
    where: {
      name: 'NDA Review',
    },
  })

  const ndaSignatureStep = await prisma.step.findFirst({
    where: {
      name: 'NDA Signature',
    },
  })

  // Vérification que toutes les étapes ont été trouvées
  const requiredSteps = [
    draftStep,
    legalReviewStep,
    approvalStep,
    ndaDraftStep,
    ndaReviewStep,
    ndaSignatureStep,
  ]

  if (requiredSteps.some((step) => !step)) {
    console.error(
      'Some required steps were not found! Check step names or run the main seed script first.'
    )
    return
  }

  // First, fetch existing workflows to reference them
  const standardContractWorkflow = await prisma.workflow.findFirst({
    where: { name: 'Standard Contract Workflow' },
  })

  const ndaWorkflow = await prisma.workflow.findFirst({
    where: { name: 'NDA Process' },
  })

  if (!standardContractWorkflow || !ndaWorkflow) {
    console.error('Required workflows not found! Run the main seed script first.')
    return
  }

  // Création des configurations de questionnaires pour chaque étape

  // 1. Configuration pour l'étape de Draft Contract
  const draftStepConfigs = [
    {
      title: 'Informations générales du contrat',
      questions: [
        {
          id: 'draft1_q1',
          question: 'Type de contrat',
          description: 'Sélectionnez le type de contrat approprié',
          type: FieldType.Select,
          fieldKey: 'contract_type',
          isRequired: true,
          order: 1,
          options: [
            { label: 'Contrat de service', value: 'service' },
            { label: 'Contrat de licence', value: 'license' },
            { label: 'Contrat de partenariat', value: 'partnership' },
            { label: 'Contrat de vente', value: 'sale' },
            { label: 'Contrat de distribution', value: 'distribution' },
          ],
        },
        {
          id: 'draft1_q2',
          question: 'Langue du contrat',
          description: 'Sélectionnez la langue principale du contrat',
          type: FieldType.Select,
          fieldKey: 'contract_language',
          isRequired: true,
          order: 2,
          options: [
            { label: 'Français', value: 'french' },
            { label: 'Anglais', value: 'english' },
            { label: 'Bilingue', value: 'bilingual' },
          ],
        },
        {
          id: 'draft1_q3',
          question: 'Montant du contrat',
          description: 'Indiquez le montant total du contrat',
          type: FieldType.Currency,
          fieldKey: 'contract_amount',
          isRequired: true,
          order: 3,
          placeholder: 'Entrez le montant',
        },
        {
          id: 'draft1_q4',
          question: 'Confidentialité',
          description: 'Ce contrat contient-il des informations confidentielles?',
          type: FieldType.Radio,
          fieldKey: 'is_confidential',
          isRequired: true,
          order: 4,
          options: [
            { label: 'Oui', value: 'yes' },
            { label: 'Non', value: 'no' },
          ],
        },
      ],
    },
    {
      title: 'Informations sur les parties',
      questions: [
        {
          id: 'draft2_q1',
          question: 'Nom de la contrepartie',
          description: "Nom complet de l'entreprise ou de la personne",
          type: FieldType.Text,
          fieldKey: 'counterparty_name',
          isRequired: true,
          order: 1,
          placeholder: 'Entrez le nom complet',
        },
        {
          id: 'draft2_q2',
          question: 'Adresse de la contrepartie',
          description: 'Adresse complète de la contrepartie',
          type: FieldType.Address,
          fieldKey: 'counterparty_address',
          isRequired: true,
          order: 2,
          placeholder: "Entrez l'adresse complète",
        },
        {
          id: 'draft2_q3',
          question: "Type d'entreprise",
          description: "Sélectionnez le type d'entreprise de la contrepartie",
          type: FieldType.TypeOfCompany,
          fieldKey: 'counterparty_type',
          isRequired: true,
          order: 3,
        },
        {
          id: 'draft2_q4',
          question: 'Contact principal',
          description: 'Informations sur le contact principal de la contrepartie',
          type: FieldType.Contact,
          fieldKey: 'counterparty_contact',
          isRequired: true,
          order: 4,
          placeholder: 'Entrez les coordonnées du contact',
        },
      ],
    },
    {
      title: 'Termes et conditions',
      questions: [
        {
          id: 'draft3_q1',
          question: 'Date de début',
          description: 'Date prévue de début du contrat',
          type: FieldType.Date,
          fieldKey: 'start_date',
          isRequired: true,
          order: 1,
        },
        {
          id: 'draft3_q2',
          question: 'Date de fin',
          description: 'Date prévue de fin du contrat',
          type: FieldType.Date,
          fieldKey: 'end_date',
          isRequired: true,
          order: 2,
        },
        {
          id: 'draft3_q3',
          question: 'Durée en mois',
          description: 'Durée totale du contrat en mois',
          type: FieldType.Number,
          fieldKey: 'duration_months',
          isRequired: true,
          order: 3,
          placeholder: 'Nombre de mois',
          validation: {
            min: 1,
            max: 120,
          },
        },
        {
          id: 'draft3_q4',
          question: 'Conditions particulières',
          description: 'Détaillez toutes les conditions particulières à inclure',
          type: FieldType.LongText,
          fieldKey: 'special_terms',
          isRequired: false,
          order: 4,
          placeholder: 'Décrivez les conditions particulières',
        },
      ],
    },
  ]

  // 2. Configuration pour l'étape de Legal Review
  const legalReviewConfigs = [
    {
      title: 'Évaluation juridique générale',
      questions: [
        {
          id: 'legal1_q1',
          question: "Conformité avec les politiques de l'entreprise",
          description: 'Le contrat est-il conforme aux politiques internes?',
          type: FieldType.Select,
          fieldKey: 'legal_compliance',
          isRequired: true,
          order: 1,
          options: [
            { label: 'Entièrement conforme', value: 'fully_compliant' },
            { label: 'Majoritairement conforme - Problèmes mineurs', value: 'mostly_compliant' },
            { label: 'Modifications significatives requises', value: 'needs_changes' },
            { label: 'Non conforme', value: 'non_compliant' },
          ],
        },
        {
          id: 'legal1_q2',
          question: 'Risques juridiques identifiés',
          description: 'Décrivez tous les risques juridiques identifiés et leur impact potentiel',
          type: FieldType.LongText,
          fieldKey: 'legal_risks',
          isRequired: true,
          order: 2,
          placeholder: 'Détaillez les risques juridiques',
          validation: {
            minLength: 50,
            maxLength: 2000,
          },
        },
        {
          id: 'legal1_q3',
          question: 'Modifications recommandées',
          description:
            'Quelles modifications recommandez-vous pour atténuer les risques juridiques?',
          type: FieldType.LongText,
          fieldKey: 'recommended_changes',
          isRequired: true,
          order: 3,
          placeholder: 'Listez les modifications recommandées',
        },
        {
          id: 'legal1_q4',
          question: 'Juridiction principale',
          description: 'Quelle est la juridiction principale applicable à ce contrat?',
          type: FieldType.Country,
          fieldKey: 'jurisdiction',
          isRequired: true,
          order: 4,
        },
      ],
    },
    {
      title: 'Analyse des clauses contractuelles',
      questions: [
        {
          id: 'legal2_q1',
          question: 'Clause de résiliation',
          description: 'La clause de résiliation est-elle satisfaisante?',
          type: FieldType.Radio,
          fieldKey: 'termination_clause_adequate',
          isRequired: true,
          order: 1,
          options: [
            { label: 'Oui', value: 'yes' },
            { label: 'Non', value: 'no' },
          ],
        },
        {
          id: 'legal2_q2',
          question: 'Commentaires sur la clause de résiliation',
          description: 'Commentaires ou suggestions concernant la clause de résiliation',
          type: FieldType.LongText,
          fieldKey: 'termination_clause_comments',
          isRequired: false,
          order: 2,
          placeholder: 'Vos commentaires ici',
        },
        {
          id: 'legal2_q3',
          question: 'Limitation de responsabilité',
          description: 'La clause de limitation de responsabilité est-elle adéquate?',
          type: FieldType.Select,
          fieldKey: 'liability_limitation',
          isRequired: true,
          order: 3,
          options: [
            { label: 'Adéquate', value: 'adequate' },
            { label: 'Insuffisante', value: 'insufficient' },
            { label: 'Trop restrictive', value: 'too_restrictive' },
            { label: 'À modifier', value: 'needs_modification' },
          ],
        },
        {
          id: 'legal2_q4',
          question: 'Propriété intellectuelle',
          description: 'Les clauses de propriété intellectuelle sont-elles appropriées?',
          type: FieldType.Radio,
          fieldKey: 'ip_clauses_appropriate',
          isRequired: true,
          order: 4,
          options: [
            { label: 'Oui', value: 'yes' },
            { label: 'Non', value: 'no' },
          ],
        },
      ],
    },
    {
      title: 'Validation juridique finale',
      questions: [
        {
          id: 'legal3_q1',
          question: "Date d'approbation juridique",
          description: "Date d'approbation par le département juridique",
          type: FieldType.Date,
          fieldKey: 'legal_approval_date',
          isRequired: true,
          order: 1,
        },
        {
          id: 'legal3_q2',
          question: 'Approbateur juridique',
          description: 'Nom de la personne qui approuve ce contrat',
          type: FieldType.Text,
          fieldKey: 'legal_approver',
          isRequired: true,
          order: 2,
          placeholder: 'Nom complet',
        },
        {
          id: 'legal3_q3',
          question: 'Niveau de risque global',
          description: 'Évaluation du niveau de risque global du contrat',
          type: FieldType.Select,
          fieldKey: 'overall_risk_level',
          isRequired: true,
          order: 3,
          options: [
            { label: 'Faible', value: 'low' },
            { label: 'Moyen', value: 'medium' },
            { label: 'Élevé', value: 'high' },
            { label: 'Critique', value: 'critical' },
          ],
        },
        {
          id: 'legal3_q4',
          question: 'Commentaires supplémentaires',
          description: 'Tout commentaire supplémentaire sur ce contrat',
          type: FieldType.LongText,
          fieldKey: 'additional_legal_comments',
          isRequired: false,
          order: 4,
          placeholder: 'Commentaires supplémentaires',
        },
      ],
    },
  ]

  // 3. Configuration pour l'étape d'Approval
  const approvalConfigs = [
    {
      title: 'Validation commerciale',
      questions: [
        {
          id: 'approval1_q1',
          question: 'Impact commercial',
          description: "Évaluation de l'impact commercial de ce contrat",
          type: FieldType.LongText,
          fieldKey: 'business_impact',
          isRequired: true,
          order: 1,
          placeholder: "Décrivez l'impact commercial",
        },
        {
          id: 'approval1_q2',
          question: 'Alignement stratégique',
          description: "Ce contrat est-il aligné avec la stratégie de l'entreprise?",
          type: FieldType.Select,
          fieldKey: 'strategic_alignment',
          isRequired: true,
          order: 2,
          options: [
            { label: 'Parfaitement aligné', value: 'perfectly_aligned' },
            { label: 'Bien aligné', value: 'well_aligned' },
            { label: 'Partiellement aligné', value: 'partially_aligned' },
            { label: 'Non aligné', value: 'not_aligned' },
          ],
        },
        {
          id: 'approval1_q3',
          question: 'Retour sur investissement estimé',
          description: 'Quel est le ROI estimé pour ce contrat?',
          type: FieldType.Select,
          fieldKey: 'estimated_roi',
          isRequired: true,
          order: 3,
          options: [
            { label: 'Moins de 6 mois', value: 'less_than_6_months' },
            { label: '6-12 mois', value: '6_to_12_months' },
            { label: '1-2 ans', value: '1_to_2_years' },
            { label: 'Plus de 2 ans', value: 'more_than_2_years' },
          ],
        },
        {
          id: 'approval1_q4',
          question: 'Justification commerciale',
          description: 'Justification détaillée pour ce contrat',
          type: FieldType.LongText,
          fieldKey: 'business_justification',
          isRequired: true,
          order: 4,
          placeholder: 'Entrez la justification commerciale détaillée',
        },
      ],
    },
    {
      title: 'Validation financière',
      questions: [
        {
          id: 'approval2_q1',
          question: 'Budget disponible',
          description: 'Le budget est-il disponible pour ce contrat?',
          type: FieldType.Radio,
          fieldKey: 'budget_available',
          isRequired: true,
          order: 1,
          options: [
            { label: 'Oui', value: 'yes' },
            { label: 'Non', value: 'no' },
            { label: 'Partiellement', value: 'partially' },
          ],
        },
        {
          id: 'approval2_q2',
          question: 'Montant budgété',
          description: 'Montant total budgété pour ce contrat',
          type: FieldType.Currency,
          fieldKey: 'budgeted_amount',
          isRequired: true,
          order: 2,
          placeholder: 'Entrez le montant',
        },
        {
          id: 'approval2_q3',
          question: 'Impact financier',
          description: "Décrivez l'impact financier de ce contrat",
          type: FieldType.LongText,
          fieldKey: 'financial_impact',
          isRequired: true,
          order: 3,
          placeholder: "Détaillez l'impact financier",
        },
        {
          id: 'approval2_q4',
          question: 'Centre de coûts',
          description: 'Quel centre de coûts sera affecté?',
          type: FieldType.Text,
          fieldKey: 'cost_center',
          isRequired: true,
          order: 4,
          placeholder: 'Entrez le centre de coûts',
        },
      ],
    },
    {
      title: 'Validation finale',
      questions: [
        {
          id: 'approval3_q1',
          question: 'Approbateur final',
          description: "Nom de l'approbateur final",
          type: FieldType.Text,
          fieldKey: 'final_approver',
          isRequired: true,
          order: 1,
          placeholder: 'Nom complet',
        },
        {
          id: 'approval3_q2',
          question: "Date d'approbation",
          description: "Date de l'approbation finale",
          type: FieldType.Date,
          fieldKey: 'approval_date',
          isRequired: true,
          order: 2,
        },
        {
          id: 'approval3_q3',
          question: "Commentaires d'approbation",
          description: "Commentaires ou conditions d'approbation",
          type: FieldType.LongText,
          fieldKey: 'approval_comments',
          isRequired: false,
          order: 3,
          placeholder: 'Entrez vos commentaires',
        },
        {
          id: 'approval3_q4',
          question: 'Statut final',
          description: 'Statut final du contrat après approbation',
          type: FieldType.Select,
          fieldKey: 'final_status',
          isRequired: true,
          order: 4,
          options: [
            { label: 'Approuvé', value: 'approved' },
            { label: 'Rejeté', value: 'rejected' },
            { label: 'En attente', value: 'pending' },
          ],
        },
      ],
    },
  ]

  // Configuration pour l'étape NDA Draft
  const ndaDraftConfigs = [
    {
      title: 'Informations de base NDA',
      questions: [
        {
          id: 'nda_draft_q1',
          question: 'Type de NDA',
          description: "Sélectionnez le type d'accord de confidentialité",
          type: FieldType.Select,
          fieldKey: 'nda_type',
          isRequired: true,
          order: 1,
          options: [
            { label: 'Unilatéral', value: 'unilateral' },
            { label: 'Bilatéral', value: 'bilateral' },
            { label: 'Multilatéral', value: 'multilateral' },
          ],
        },
        {
          id: 'nda_draft_q2',
          question: 'Durée de confidentialité',
          description: 'Durée pendant laquelle les informations doivent rester confidentielles',
          type: FieldType.Select,
          fieldKey: 'confidentiality_duration',
          isRequired: true,
          order: 2,
          options: [
            { label: '1 an', value: '1_year' },
            { label: '2 ans', value: '2_years' },
            { label: '5 ans', value: '5_years' },
            { label: 'Illimitée', value: 'unlimited' },
          ],
        },
        {
          id: 'nda_draft_q3',
          question: 'Portée des informations confidentielles',
          description: 'Définissez la portée des informations confidentielles',
          type: FieldType.LongText,
          fieldKey: 'confidential_info_scope',
          isRequired: true,
          order: 3,
          placeholder: "Décrivez les types d'informations couvertes",
        },
      ],
    },
  ]

  // Configuration pour l'étape NDA Review
  const ndaReviewConfigs = [
    {
      title: 'Révision du NDA',
      questions: [
        {
          id: 'nda_review_q1',
          question: 'Niveau de protection',
          description: 'Évaluez le niveau de protection offert par le NDA',
          type: FieldType.Select,
          fieldKey: 'protection_level',
          isRequired: true,
          order: 1,
          options: [
            { label: 'Très élevé', value: 'very_high' },
            { label: 'Élevé', value: 'high' },
            { label: 'Moyen', value: 'medium' },
            { label: 'Faible', value: 'low' },
          ],
        },
        {
          id: 'nda_review_q2',
          question: 'Clauses manquantes',
          description: 'Identifiez les clauses manquantes ou à améliorer',
          type: FieldType.MultiSelect,
          fieldKey: 'missing_clauses',
          isRequired: true,
          order: 2,
          options: [
            {
              label: 'Définition des informations confidentielles',
              value: 'confidential_info_def',
            },
            { label: 'Obligations de non-divulgation', value: 'non_disclosure' },
            { label: "Durée de l'obligation", value: 'duration' },
            { label: 'Retour des informations', value: 'info_return' },
          ],
        },
        {
          id: 'nda_review_q3',
          question: 'Commentaires juridiques',
          description: 'Ajoutez vos commentaires juridiques sur le NDA',
          type: FieldType.LongText,
          fieldKey: 'legal_comments',
          isRequired: true,
          order: 3,
          placeholder: 'Entrez vos commentaires juridiques',
        },
      ],
    },
  ]

  // Configuration pour l'étape NDA Signature
  const ndaSignatureConfigs = [
    {
      title: 'Signature du NDA',
      questions: [
        {
          id: 'nda_sign_q1',
          question: 'Méthode de signature',
          description: 'Sélectionnez la méthode de signature préférée',
          type: FieldType.Select,
          fieldKey: 'signature_method',
          isRequired: true,
          order: 1,
          options: [
            { label: 'Signature électronique', value: 'electronic' },
            { label: 'Signature manuscrite', value: 'manual' },
            { label: 'Signature numérique certifiée', value: 'certified_digital' },
          ],
        },
        {
          id: 'nda_sign_q2',
          question: 'Signataires requis',
          description: 'Liste des signataires requis',
          type: FieldType.MultiSelect,
          fieldKey: 'required_signers',
          isRequired: true,
          order: 2,
          options: [
            { label: 'Représentant légal', value: 'legal_representative' },
            { label: 'Directeur général', value: 'ceo' },
            { label: 'Responsable projet', value: 'project_manager' },
          ],
        },
        {
          id: 'nda_sign_q3',
          question: 'Date limite de signature',
          description: 'Date limite pour obtenir toutes les signatures',
          type: FieldType.Date,
          fieldKey: 'signature_deadline',
          isRequired: true,
          order: 3,
        },
      ],
    },
  ]

  // Create questionnaires for each step
  await Promise.all([
    createQuestionnairesForStep(draftStep.id, draftStepConfigs),
    createQuestionnairesForStep(legalReviewStep.id, legalReviewConfigs),
    createQuestionnairesForStep(approvalStep.id, approvalConfigs),
    createQuestionnairesForStep(ndaDraftStep.id, ndaDraftConfigs),
    createQuestionnairesForStep(ndaReviewStep.id, ndaReviewConfigs),
    createQuestionnairesForStep(ndaSignatureStep.id, ndaSignatureConfigs),
  ])

  console.log('Questionnaire data seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
