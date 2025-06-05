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
      contract_name: 'Standard Service Contract',
      file_name: 'standard_contract_template.docx',
      created_by_id: adminUser.id,
      template_content: 'Standard contract template content...',
    },
    create: {
      id: 'standard-contract-workflow',
      name: 'Standard Contract Workflow',
      description: 'Workflow for standard contract processing',
      contract_name: 'Standard Service Contract',
      file_name: 'standard_contract_template.docx',
      created_by_id: adminUser.id,
      template_content: 'Standard contract template content...',
    },
  })

  const ndaWorkflow = await prisma.workflow.upsert({
    where: { id: 'nda-process' },
    update: {
      name: 'NDA Process',
      description: 'Workflow for processing Non-Disclosure Agreements',
      contract_name: 'Non-Disclosure Agreement',
      file_name: 'nda_template.docx',
      created_by_id: adminUser.id,
      template_content: 'NDA template content...',
    },
    create: {
      id: 'nda-process',
      name: 'NDA Process',
      description: 'Workflow for processing Non-Disclosure Agreements',
      contract_name: 'Non-Disclosure Agreement',
      file_name: 'nda_template.docx',
      created_by_id: adminUser.id,
      template_content: 'NDA template content...',
    },
  })

  console.log(`Created workflows: ${standardContractWorkflow.name}, ${ndaWorkflow.name}`)

  // Create steps for Standard Contract Workflow
  const draftStep = await prisma.step.upsert({
    where: { id: 'draft-step' },
    update: {
      name: 'Draft Contract',
      description: 'Create initial contract draft',
      contract_name: 'Draft Contract Document',
      workflow_id: standardContractWorkflow.id,
      order: 1,
    },
    create: {
      id: 'draft-step',
      name: 'Draft Contract',
      description: 'Create initial contract draft',
      contract_name: 'Draft Contract Document',
      workflow_id: standardContractWorkflow.id,
      order: 1,
    },
  })

  const legalReviewStep = await prisma.step.upsert({
    where: { id: 'legal-review-step' },
    update: {
      name: 'Legal Review',
      description: 'Legal department reviews the contract',
      contract_name: 'Contract Under Legal Review',
      workflow_id: standardContractWorkflow.id,
      order: 2,
    },
    create: {
      id: 'legal-review-step',
      name: 'Legal Review',
      description: 'Legal department reviews the contract',
      contract_name: 'Contract Under Legal Review',
      workflow_id: standardContractWorkflow.id,
      order: 2,
    },
  })

  const approvalStep = await prisma.step.upsert({
    where: { id: 'approval-step' },
    update: {
      name: 'Final Approval',
      description: 'Get final approval for the contract',
      contract_name: 'Contract Pending Final Approval',
      workflow_id: standardContractWorkflow.id,
      order: 3,
    },
    create: {
      id: 'approval-step',
      name: 'Final Approval',
      description: 'Get final approval for the contract',
      contract_name: 'Contract Pending Final Approval',
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
      contract_name: 'NDA Draft Document',
      workflow_id: ndaWorkflow.id,
      order: 1,
    },
    create: {
      id: 'nda-draft-step',
      name: 'Draft NDA',
      description: 'Create initial NDA draft',
      contract_name: 'NDA Draft Document',
      workflow_id: ndaWorkflow.id,
      order: 1,
    },
  })

  const ndaReviewStep = await prisma.step.upsert({
    where: { id: 'nda-review-step' },
    update: {
      name: 'NDA Review',
      description: 'Legal department reviews the NDA',
      contract_name: 'NDA Under Review',
      workflow_id: ndaWorkflow.id,
      order: 2,
    },
    create: {
      id: 'nda-review-step',
      name: 'NDA Review',
      description: 'Legal department reviews the NDA',
      contract_name: 'NDA Under Review',
      workflow_id: ndaWorkflow.id,
      order: 2,
    },
  })

  const ndaSignatureStep = await prisma.step.upsert({
    where: { id: 'nda-signature-step' },
    update: {
      name: 'NDA Signature',
      description: 'Sign the NDA',
      contract_name: 'NDA Ready for Signature',
      workflow_id: ndaWorkflow.id,
      order: 3,
    },
    create: {
      id: 'nda-signature-step',
      name: 'NDA Signature',
      description: 'Sign the NDA',
      contract_name: 'NDA Ready for Signature',
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
      file_list: 'acme_service_agreement.pdf,acme_annexes.pdf',
      language: Languages.Français,
      isConfidential: false,
      workflow: {
        connect: {
          id: standardContractWorkflow.id,
        },
      },
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
      file_list: 'acme_service_agreement.pdf,acme_annexes.pdf',
      language: Languages.Français,
      isConfidential: false,
      workflow: {
        connect: {
          id: standardContractWorkflow.id,
        },
      },
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
      file_list: 'techpartner_nda.pdf',
      language: Languages.Anglais,
      isConfidential: true,
      created_by_id: legalUser.id,
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
      file_list: 'techpartner_nda.pdf',
      language: Languages.Anglais,
      isConfidential: true,
      created_by_id: legalUser.id,
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
      file_list: 'beta_consulting_agreement.pdf',
      language: Languages.Français,
      isConfidential: false,
      created_by_id: regularUser.id,
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
      file_list: 'beta_consulting_agreement.pdf',
      language: Languages.Français,
      isConfidential: false,
      created_by_id: regularUser.id,
      workflow_id: standardContractWorkflow.id,
    },
  })

  console.log(`Created sample contracts`)

  // Create some dynamic fields examples
  const clientNameField = await prisma.dynamicField.create({
    data: {
      key: 'client_name',
      type: FieldType.Text,
      description: 'Name of the client company',
    },
  })

  const contractValueField = await prisma.dynamicField.create({
    data: {
      key: 'contract_value',
      type: FieldType.Currency,
      description: 'Total value of the contract',
    },
  })

  const startDateField = await prisma.dynamicField.create({
    data: {
      key: 'start_date',
      type: FieldType.Date,
      description: 'Contract start date',
    },
  })

  // Link dynamic fields to workflows
  await prisma.workflowField.createMany({
    data: [
      {
        field_id: clientNameField.id,
        workflow_id: standardContractWorkflow.id,
      },
      {
        field_id: contractValueField.id,
        workflow_id: standardContractWorkflow.id,
      },
      {
        field_id: startDateField.id,
        workflow_id: standardContractWorkflow.id,
      },
    ],
  })

  console.log('Created dynamic fields and linked them to workflows')

  // Create some sample files
  await prisma.file.createMany({
    data: [
      {
        name: 'acme_service_agreement.pdf',
        location: '/uploads/contracts/acme_service_agreement.pdf',
        company_id: company.id,
      },
      {
        name: 'techpartner_nda.pdf',
        location: '/uploads/contracts/techpartner_nda.pdf',
        company_id: company.id,
      },
      {
        name: 'beta_consulting_agreement.pdf',
        location: '/uploads/contracts/beta_consulting_agreement.pdf',
        company_id: company.id,
      },
    ],
  })

  console.log('Created sample files')

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
          type: FieldType.Adress,
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
          question: 'Rentabilité prévue',
          description: 'Estimation de la rentabilité de ce contrat',
          type: FieldType.Select,
          fieldKey: 'profitability',
          isRequired: true,
          order: 2,
          options: [
            { label: 'Très rentable', value: 'very_profitable' },
            { label: 'Rentable', value: 'profitable' },
            { label: 'Neutre', value: 'neutral' },
            { label: 'Peu rentable', value: 'low_profit' },
            { label: 'Non rentable', value: 'unprofitable' },
          ],
        },
        {
          id: 'approval1_q3',
          question: 'Alignement stratégique',
          description: "Ce contrat est-il aligné avec la stratégie de l'entreprise?",
          type: FieldType.Radio,
          fieldKey: 'strategic_alignment',
          isRequired: true,
          order: 3,
          options: [
            { label: 'Parfaitement aligné', value: 'perfectly_aligned' },
            { label: 'Bien aligné', value: 'well_aligned' },
            { label: 'Partiellement aligné', value: 'partially_aligned' },
            { label: 'Peu aligné', value: 'poorly_aligned' },
            { label: 'Non aligné', value: 'not_aligned' },
          ],
        },
        {
          id: 'approval1_q4',
          question: 'Ressources nécessaires',
          description: 'Quelles ressources seront nécessaires pour exécuter ce contrat?',
          type: FieldType.LongText,
          fieldKey: 'required_resources',
          isRequired: true,
          order: 4,
          placeholder: 'Décrivez les ressources humaines, techniques et financières',
        },
      ],
    },
    {
      title: 'Approbation finale',
      questions: [
        {
          id: 'approval2_q1',
          question: "Décision d'approbation",
          description: 'Décision finale concernant ce contrat',
          type: FieldType.Select,
          fieldKey: 'final_approval_decision',
          isRequired: true,
          order: 1,
          options: [
            { label: 'Approuvé sans réserve', value: 'approved_unconditionally' },
            { label: 'Approuvé avec conditions', value: 'approved_with_conditions' },
            { label: 'Rejeté - Modifications mineures requises', value: 'rejected_minor_changes' },
            { label: 'Rejeté - Modifications majeures requises', value: 'rejected_major_changes' },
            { label: 'Rejeté définitivement', value: 'rejected_permanently' },
          ],
        },
        {
          id: 'approval2_q2',
          question: "Conditions d'approbation",
          description: 'Si approuvé avec conditions, précisez lesquelles',
          type: FieldType.LongText,
          fieldKey: 'approval_conditions',
          isRequired: false,
          order: 2,
          placeholder: 'Listez les conditions à respecter',
        },
        {
          id: 'approval2_q3',
          question: 'Date limite de signature',
          description: 'Date limite recommandée pour la signature',
          type: FieldType.Date,
          fieldKey: 'signature_deadline',
          isRequired: true,
          order: 3,
        },
        {
          id: 'approval2_q4',
          question: 'Approbateur final',
          description: "Nom de la personne qui donne l'approbation finale",
          type: FieldType.Text,
          fieldKey: 'final_approver',
          isRequired: true,
          order: 4,
          placeholder: 'Nom et fonction',
        },
      ],
    },
  ]

  // 4. Configuration pour l'étape de Draft NDA
  const ndaDraftConfigs = [
    {
      title: 'Informations de base du NDA',
      questions: [
        {
          id: 'nda_draft1_q1',
          question: 'Type de NDA',
          description: "Sélectionnez le type d'accord de confidentialité",
          type: FieldType.Select,
          fieldKey: 'nda_type',
          isRequired: true,
          order: 1,
          options: [
            { label: 'NDA unilatéral', value: 'unilateral' },
            { label: 'NDA bilatéral', value: 'bilateral' },
            { label: 'NDA multilatéral', value: 'multilateral' },
          ],
        },
        {
          id: 'nda_draft1_q2',
          question: 'Durée de confidentialité',
          description: 'Durée pendant laquelle les informations restent confidentielles',
          type: FieldType.Number,
          fieldKey: 'confidentiality_duration_years',
          isRequired: true,
          order: 2,
          placeholder: "Nombre d'années",
          validation: {
            min: 1,
            max: 20,
          },
        },
        {
          id: 'nda_draft1_q3',
          question: 'Objet de la confidentialité',
          description: "Décrivez l'objet ou le projet nécessitant la confidentialité",
          type: FieldType.LongText,
          fieldKey: 'confidentiality_purpose',
          isRequired: true,
          order: 3,
          placeholder: "Décrivez le contexte et l'objet",
        },
        {
          id: 'nda_draft1_q4',
          question: 'Informations sensibles',
          description: "Types d'informations considérées comme confidentielles",
          type: FieldType.MultiSelect,
          fieldKey: 'sensitive_info_types',
          isRequired: true,
          order: 4,
          options: [
            { label: 'Informations techniques', value: 'technical' },
            { label: 'Informations commerciales', value: 'commercial' },
            { label: 'Informations financières', value: 'financial' },
            { label: 'Données clients', value: 'customer_data' },
            { label: "Stratégie d'entreprise", value: 'business_strategy' },
            { label: 'Propriété intellectuelle', value: 'intellectual_property' },
          ],
        },
      ],
    },
    {
      title: 'Parties concernées',
      questions: [
        {
          id: 'nda_draft2_q1',
          question: 'Partie divulgatrice',
          description: "Nom de l'entité qui divulgue les informações confidentielles",
          type: FieldType.Text,
          fieldKey: 'disclosing_party',
          isRequired: true,
          order: 1,
          placeholder: "Nom de l'entreprise divulgatrice",
        },
        {
          id: 'nda_draft2_q2',
          question: 'Partie réceptrice',
          description: "Nom de l'entité qui reçoit les informações confidentielles",
          type: FieldType.Text,
          fieldKey: 'receiving_party',
          isRequired: true,
          order: 2,
          placeholder: "Nom de l'entreprise réceptrice",
        },
        {
          id: 'nda_draft2_q3',
          question: 'Représentant légal divulgateur',
          description: 'Contact du représentant légal de la partie divulgatrice',
          type: FieldType.Contact,
          fieldKey: 'disclosing_legal_contact',
          isRequired: true,
          order: 3,
          placeholder: 'Coordonnées du représentant légal',
        },
        {
          id: 'nda_draft2_q4',
          question: 'Représentant légal récepteur',
          description: 'Contact du représentant légal de la partie réceptrice',
          type: FieldType.Contact,
          fieldKey: 'receiving_legal_contact',
          isRequired: true,
          order: 4,
          placeholder: 'Coordonnées du représentant légal',
        },
      ],
    },
  ]

  // 5. Configuration pour l'étape de NDA Review
  const ndaReviewConfigs = [
    {
      title: 'Évaluation de conformité NDA',
      questions: [
        {
          id: 'nda_review1_q1',
          question: 'Conformité réglementaire',
          description: 'Le NDA est-il conforme aux réglementations applicables?',
          type: FieldType.Select,
          fieldKey: 'nda_regulatory_compliance',
          isRequired: true,
          order: 1,
          options: [
            { label: 'Entièrement conforme', value: 'fully_compliant' },
            { label: 'Conforme avec ajustements mineurs', value: 'minor_adjustments' },
            { label: 'Modifications importantes requises', value: 'major_changes' },
            { label: 'Non conforme', value: 'non_compliant' },
          ],
        },
        {
          id: 'nda_review1_q2',
          question: 'Portée de la confidentialité',
          description: 'La portée de la confidentialité est-elle appropriée?',
          type: FieldType.Radio,
          fieldKey: 'confidentiality_scope_adequate',
          isRequired: true,
          order: 2,
          options: [
            { label: 'Appropriée', value: 'appropriate' },
            { label: 'Trop large', value: 'too_broad' },
            { label: 'Trop restrictive', value: 'too_restrictive' },
          ],
        },
        {
          id: 'nda_review1_q3',
          question: 'Durée de confidentialité',
          description: 'La durée de confidentialité est-elle raisonnable?',
          type: FieldType.Radio,
          fieldKey: 'duration_reasonable',
          isRequired: true,
          order: 3,
          options: [
            { label: 'Raisonnable', value: 'reasonable' },
            { label: 'Trop courte', value: 'too_short' },
            { label: 'Trop longue', value: 'too_long' },
          ],
        },
        {
          id: 'nda_review1_q4',
          question: 'Exceptions à la confidentialité',
          description: 'Les exceptions à la confidentialité sont-elles bien définies?',
          type: FieldType.Radio,
          fieldKey: 'exceptions_well_defined',
          isRequired: true,
          order: 4,
          options: [
            { label: 'Bien définies', value: 'well_defined' },
            { label: 'Partiellement définies', value: 'partially_defined' },
            { label: 'Mal définies', value: 'poorly_defined' },
          ],
        },
      ],
    },
    {
      title: 'Validation juridique NDA',
      questions: [
        {
          id: 'nda_review2_q1',
          question: 'Recommandations juridiques',
          description: 'Recommandations du département juridique',
          type: FieldType.LongText,
          fieldKey: 'nda_legal_recommendations',
          isRequired: true,
          order: 1,
          placeholder: 'Détaillez vos recommandations',
        },
        {
          id: 'nda_review2_q2',
          question: 'Risques identifiés',
          description: 'Principaux risques identifiés dans ce NDA',
          type: FieldType.LongText,
          fieldKey: 'nda_identified_risks',
          isRequired: true,
          order: 2,
          placeholder: 'Listez les risques potentiels',
        },
        {
          id: 'nda_review2_q3',
          question: 'Niveau de risque global',
          description: 'Évaluation du niveau de risque de ce NDA',
          type: FieldType.Select,
          fieldKey: 'nda_risk_level',
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
          id: 'nda_review2_q4',
          question: 'Approbation juridique',
          description: 'Le département juridique approuve-t-il ce NDA?',
          type: FieldType.Select,
          fieldKey: 'nda_legal_approval',
          isRequired: true,
          order: 4,
          options: [
            { label: 'Approuvé', value: 'approved' },
            { label: 'Approuvé avec réserves', value: 'approved_with_reservations' },
            { label: 'Rejeté - Modifications requises', value: 'rejected_changes_required' },
            { label: 'Rejeté', value: 'rejected' },
          ],
        },
      ],
    },
  ]

  // 6. Configuration pour l'étape de NDA Signature
  const ndaSignatureConfigs = [
    {
      title: 'Préparation à la signature',
      questions: [
        {
          id: 'nda_signature1_q1',
          question: 'Mode de signature',
          description: 'Comment le NDA sera-t-il signé?',
          type: FieldType.Select,
          fieldKey: 'signature_method',
          isRequired: true,
          order: 1,
          options: [
            { label: 'Signature électronique', value: 'electronic' },
            { label: 'Signature manuscrite', value: 'handwritten' },
            { label: 'Signature numérique certifiée', value: 'digital_certified' },
          ],
        },
        {
          id: 'nda_signature1_q2',
          question: 'Lieu de signature',
          description: 'Où aura lieu la signature du NDA?',
          type: FieldType.Adress,
          fieldKey: 'signature_location',
          isRequired: true,
          order: 2,
          placeholder: 'Adresse du lieu de signature',
        },
        {
          id: 'nda_signature1_q3',
          question: 'Date prévue de signature',
          description: 'Date prévue pour la signature du NDA',
          type: FieldType.Date,
          fieldKey: 'planned_signature_date',
          isRequired: true,
          order: 3,
        },
        {
          id: 'nda_signature1_q4',
          question: 'Signataires',
          description: 'Personnes autorisées à signer ce NDA',
          type: FieldType.LongText,
          fieldKey: 'authorized_signatories',
          isRequired: true,
          order: 4,
          placeholder: 'Listez les noms et fonctions des signataires',
        },
      ],
    },
    {
      title: 'Finalisation',
      questions: [
        {
          id: 'nda_signature2_q1',
          question: 'Témoins requis',
          description: 'Des témoins sont-ils requis pour cette signature?',
          type: FieldType.Radio,
          fieldKey: 'witnesses_required',
          isRequired: true,
          order: 1,
          options: [
            { label: 'Oui', value: 'yes' },
            { label: 'Non', value: 'no' },
          ],
        },
        {
          id: 'nda_signature2_q2',
          question: 'Copies requises',
          description: 'Nombre de copies originales requises',
          type: FieldType.Number,
          fieldKey: 'required_copies',
          isRequired: true,
          order: 2,
          placeholder: 'Nombre de copies',
          validation: {
            min: 1,
            max: 10,
          },
        },
        {
          id: 'nda_signature2_q3',
          question: 'Instructions spéciales',
          description: 'Instructions spéciales pour la signature',
          type: FieldType.LongText,
          fieldKey: 'special_signature_instructions',
          isRequired: false,
          order: 3,
          placeholder: 'Instructions particulières',
        },
        {
          id: 'nda_signature2_q4',
          question: 'Responsable du suivi',
          description: 'Personne responsable du suivi post-signature',
          type: FieldType.Contact,
          fieldKey: 'follow_up_responsible',
          isRequired: true,
          order: 4,
          placeholder: 'Coordonnées du responsable',
        },
      ],
    },
  ]

  // Création des questionnaires pour chaque étape
  await createQuestionnairesForStep(draftStep.id, draftStepConfigs)
  await createQuestionnairesForStep(legalReviewStep.id, legalReviewConfigs)
  await createQuestionnairesForStep(approvalStep.id, approvalConfigs)
  await createQuestionnairesForStep(ndaDraftStep.id, ndaDraftConfigs)
  await createQuestionnairesForStep(ndaReviewStep.id, ndaReviewConfigs)
  await createQuestionnairesForStep(ndaSignatureStep.id, ndaSignatureConfigs)

  console.log('Questionnaire data seeding completed successfully!')
}

// Fonction pour créer des logs d'étapes pour les contrats existants
async function createContractStepLogs() {
  console.log('Creating contract step logs...')

  // Récupérer tous les contrats existants
  const contracts = await prisma.contract.findMany({
    include: {
      workflow: {
        include: {
          steps: {
            include: {
              action: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      },
    },
  })

  for (const contract of contracts) {
    console.log(`Creating logs for contract: ${contract.title}`)

    // Pour chaque contrat, créer un log pour chaque étape du workflow
    for (const step of contract.workflow.steps) {
      // Prendre la première action de l'étape comme action par défaut
      const firstAction = step.action[0]

      if (firstAction) {
        await prisma.contractStepLog.create({
          data: {
            contract_id: contract.id,
            step_id: step.id,
            last_action_id: firstAction.id,
          },
        })
      }
    }
  }

  console.log('Contract step logs created successfully!')
}

// Fonction pour créer des permissions et les assigner aux rôles
async function createPermissions() {
  console.log('Creating permissions...')

  const permissions = [
    { name: 'CREATE_CONTRACT' },
    { name: 'READ_CONTRACT' },
    { name: 'UPDATE_CONTRACT' },
    { name: 'DELETE_CONTRACT' },
    { name: 'MANAGE_WORKFLOW' },
    { name: 'LEGAL_REVIEW' },
    { name: 'FINAL_APPROVAL' },
    { name: 'MANAGE_USERS' },
    { name: 'VIEW_REPORTS' },
    { name: 'MANAGE_SETTINGS' },
  ]

  // Créer toutes les permissions
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    })
  }

  // Récupérer les rôles et permissions créés
  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } })
  const legalRole = await prisma.role.findUnique({ where: { name: 'Legal' } })
  const userRole = await prisma.role.findUnique({ where: { name: 'User' } })

  const allPermissions = await prisma.permission.findMany()

  // Assigner toutes les permissions à l'Admin
  for (const permission of allPermissions) {
    await prisma.permissionRole.upsert({
      where: {
        permission_id_role_id: {
          permission_id: permission.id,
          role_id: adminRole.id,
        },
      },
      update: {},
      create: {
        permission_id: permission.id,
        role_id: adminRole.id,
      },
    })
  }

  // Assigner des permissions spécifiques au rôle Legal
  const legalPermissions = allPermissions.filter((p) =>
    ['READ_CONTRACT', 'UPDATE_CONTRACT', 'LEGAL_REVIEW', 'VIEW_REPORTS'].includes(p.name)
  )

  for (const permission of legalPermissions) {
    await prisma.permissionRole.upsert({
      where: {
        permission_id_role_id: {
          permission_id: permission.id,
          role_id: legalRole.id,
        },
      },
      update: {},
      create: {
        permission_id: permission.id,
        role_id: legalRole.id,
      },
    })
  }

  // Assigner des permissions de base au rôle User
  const userPermissions = allPermissions.filter((p) =>
    ['CREATE_CONTRACT', 'READ_CONTRACT', 'UPDATE_CONTRACT'].includes(p.name)
  )

  for (const permission of userPermissions) {
    await prisma.permissionRole.upsert({
      where: {
        permission_id_role_id: {
          permission_id: permission.id,
          role_id: userRole.id,
        },
      },
      update: {},
      create: {
        permission_id: permission.id,
        role_id: userRole.id,
      },
    })
  }

  console.log('Permissions created and assigned successfully!')
}

// Fonction pour créer des notifications de test
async function createSampleNotifications() {
  console.log('Creating sample notifications...')

  const users = await prisma.user.findMany()

  const notificationTypes = [
    {
      type: 'CONTRACT_CREATED',
      message: 'Un nouveau contrat a été créé et nécessite votre attention',
    },
    {
      type: 'LEGAL_REVIEW_REQUIRED',
      message: 'Un contrat nécessite une révision juridique',
    },
    {
      type: 'APPROVAL_PENDING',
      message: "Un contrat est en attente d'approbation finale",
    },
    {
      type: 'CONTRACT_SIGNED',
      message: 'Un contrat a été signé avec succès',
    },
  ]

  for (const user of users) {
    // Créer 2-3 notifications par utilisateur
    const numNotifications = Math.floor(Math.random() * 2) + 2

    for (let i = 0; i < numNotifications; i++) {
      const randomNotification =
        notificationTypes[Math.floor(Math.random() * notificationTypes.length)]

      await prisma.notification.create({
        data: {
          user_id: user.id,
          type: randomNotification.type,
          payload: {
            message: randomNotification.message,
            contract_id: 'standard-contract-1', // Référence à un contrat existant
            timestamp: new Date().toISOString(),
          },
          is_read: Math.random() > 0.5, // 50% de chance d'être lue
        },
      })
    }
  }

  console.log('Sample notifications created successfully!')
}

// Fonction pour créer des paramètres système
async function createSystemSettings() {
  console.log('Creating system settings...')

  const settings = [
    {
      key: 'EMAIL_NOTIFICATIONS_ENABLED',
      value: { enabled: true },
    },
    {
      key: 'DEFAULT_CONTRACT_LANGUAGE',
      value: { language: 'Français' },
    },
    {
      key: 'MAX_FILE_UPLOAD_SIZE',
      value: { size_mb: 50 },
    },
    {
      key: 'SIGNATURE_VALIDITY_DAYS',
      value: { days: 30 },
    },
    {
      key: 'AUTO_ARCHIVE_CONTRACTS',
      value: { enabled: true, days_after_completion: 365 },
    },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  console.log('System settings created successfully!')
}

main()
  .then(async () => {
    // Créer les logs d'étapes pour les contrats
    await createContractStepLogs()

    // Créer les permissions
    await createPermissions()

    // Créer des notifications d'exemple
    await createSampleNotifications()

    // Créer les paramètres système
    await createSystemSettings()

    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
