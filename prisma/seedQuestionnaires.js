import pkg from '@prisma/client'
const { PrismaClient, FieldType, TypeActions, Status, Languages } = pkg
const prisma = new PrismaClient()
//Commande :=> node prisma/seedQuestionnaires.js
async function createQuestionnairesForStep(stepId, configs) {
  console.log(`Creating questionnaires for step ${stepId}...`)

  // Créer 3 actions de type QUESTIONNAIRE pour chaque étape
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
      created_by_id: adminUser.id,
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
      created_by_id: adminUser.id,
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
      created_by_id: legalUser.id,
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
      created_by_id: legalUser.id,
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
      created_by_id: adminUser.id,
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
      created_by_id: adminUser.id,
    },
  })

  console.log(`Created sample contracts`)

  // Seed questionnaires data
  await seedQuestionnaires()

  console.log('Seed data creation completed successfully!')
}

async function seedQuestionnaires() {
  console.log('Starting questionnaire data seeding...')

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

  if (!legalReviewStep || !ndaReviewStep) {
    console.error('Required steps not found! Check step names or run the main seed script first.')
    return
  }

  // Create questionnaire dynamic fields
  console.log('Creating questionnaire dynamic fields...')

  const draftStepConfigs = [
    {
      title: 'Initial Draft Requirements',
      questions: [
        {
          id: 'd1',
          question: 'Contract Type Selection',
          type: FieldType.Select,
          fieldKey: 'contract_type',
          isRequired: true,
          order: 1,
          options: [
            { label: 'Service Agreement', value: 'service' },
            { label: 'License Agreement', value: 'license' },
            { label: 'Partnership Agreement', value: 'partnership' },
          ],
        },
      ],
    },
    {
      title: 'Contract Parties Information',
      questions: [
        {
          id: 'd2',
          question: 'Counterparty Details',
          type: FieldType.Text,
          fieldKey: 'counterparty_info',
          isRequired: true,
          order: 1,
        },
      ],
    },
    {
      title: 'Contract Terms',
      questions: [
        {
          id: 'd3',
          question: 'Contract Duration',
          type: FieldType.Number,
          fieldKey: 'duration_months',
          isRequired: true,
          order: 1,
        },
      ],
    },
  ]

  const approvalStepConfigs = [
    {
      title: 'Business Approval',
      questions: [
        {
          id: 'a1',
          question: 'Business Impact Assessment',
          type: FieldType.LongText,
          fieldKey: 'business_impact',
          isRequired: true,
          order: 1,
        },
      ],
    },
    {
      title: 'Financial Approval',
      questions: [
        {
          id: 'a2',
          question: 'Budget Validation',
          type: FieldType.Currency,
          fieldKey: 'budget_validation',
          isRequired: true,
          order: 1,
        },
      ],
    },
    {
      title: 'Risk Assessment',
      questions: [
        {
          id: 'a3',
          question: 'Risk Level Evaluation',
          type: FieldType.Select,
          fieldKey: 'risk_level',
          isRequired: true,
          order: 1,
          options: [
            { label: 'Low Risk', value: 'low' },
            { label: 'Medium Risk', value: 'medium' },
            { label: 'High Risk', value: 'high' },
          ],
        },
      ],
    },
  ]

  const signatureStepConfigs = [
    {
      title: 'Signature Authorization',
      questions: [
        {
          id: 's1',
          question: 'Signatory Information',
          type: FieldType.Text,
          fieldKey: 'signatory_info',
          isRequired: true,
          order: 1,
        },
      ],
    },
    {
      title: 'Signature Method',
      questions: [
        {
          id: 's2',
          question: 'Preferred Signature Method',
          type: FieldType.Select,
          fieldKey: 'signature_method',
          isRequired: true,
          order: 1,
          options: [
            { label: 'Electronic', value: 'electronic' },
            { label: 'Physical', value: 'physical' },
          ],
        },
      ],
    },
    {
      title: 'Signature Validation',
      questions: [
        {
          id: 's3',
          question: 'Authority Verification',
          type: FieldType.Radio,
          fieldKey: 'authority_verified',
          isRequired: true,
          order: 1,
          options: [
            { label: 'Verified', value: 'yes' },
            { label: 'Not Verified', value: 'no' },
          ],
        },
      ],
    },
  ]

  // Créer les actions pour chaque étape

  // Legal Review Questionnaire Fields
  const legalReviewFields = await Promise.all([
    prisma.dynamicField.create({
      data: {
        key: 'legal_compliance',
        value: '',
        type: FieldType.Select,
        description: 'Is this contract compliant with our company policies?',
        is_required: true,
        placeholder: 'Select compliance status',
      },
    }),
    prisma.dynamicField.create({
      data: {
        key: 'legal_risks',
        value: '',
        type: FieldType.LongText,
        description: 'Describe any potential legal risks associated with this contract',
        is_required: true,
        placeholder: 'Enter detailed analysis of legal risks',
      },
    }),
    prisma.dynamicField.create({
      data: {
        key: 'recommended_changes',
        value: '',
        type: FieldType.LongText,
        description: 'List recommended changes to mitigate legal risks',
        is_required: false,
        placeholder: 'Enter recommended contract modifications',
      },
    }),
    prisma.dynamicField.create({
      data: {
        key: 'jurisdiction_check',
        value: '',
        type: FieldType.Country,
        description: 'Primary legal jurisdiction for this contract',
        is_required: true,
        placeholder: 'Select applicable jurisdiction',
      },
    }),
    prisma.dynamicField.create({
      data: {
        key: 'legal_approval_date',
        value: '',
        type: FieldType.Date,
        description: 'Date of legal department approval',
        is_required: true,
      },
    }),
  ])

  // NDA Review Questionnaire Fields
  const ndaReviewFields = await Promise.all([
    prisma.dynamicField.create({
      data: {
        key: 'confidentiality_level',
        value: '',
        type: FieldType.Select,
        description: 'Required level of confidentiality',
        is_required: true,
        placeholder: 'Select confidentiality level',
      },
    }),
    prisma.dynamicField.create({
      data: {
        key: 'disclosure_scope',
        value: '',
        type: FieldType.MultiSelect,
        description: 'What types of information will be disclosed?',
        is_required: true,
        placeholder: 'Select all applicable information types',
      },
    }),
    prisma.dynamicField.create({
      data: {
        key: 'duration_years',
        value: '',
        type: FieldType.Number,
        description: 'Duration of confidentiality obligations (in years)',
        is_required: true,
        placeholder: 'Enter number of years',
      },
    }),
    prisma.dynamicField.create({
      data: {
        key: 'third_party_disclosure',
        value: '',
        type: FieldType.Radio,
        description: 'Will third parties need access to confidential information?',
        is_required: true,
      },
    }),
    prisma.dynamicField.create({
      data: {
        key: 'special_provisions',
        value: '',
        type: FieldType.LongText,
        description: 'Any special confidentiality provisions needed',
        is_required: false,
        placeholder: 'Describe any special provisions',
      },
    }),
  ])

  console.log(`Created ${legalReviewFields.length + ndaReviewFields.length} questionnaire fields`)

  // Associate the dynamic fields with the workflows
  for (const field of legalReviewFields) {
    await prisma.workflowField.create({
      data: {
        field_id: field.id,
        workflow_id: standardContractWorkflow.id,
      },
    })
  }

  for (const field of ndaReviewFields) {
    await prisma.workflowField.create({
      data: {
        field_id: field.id,
        workflow_id: ndaWorkflow.id,
      },
    })
  }

  console.log('Associated dynamic fields with workflows')

  // Create questionnaire action configs
  const legalReviewQuestionnaireConfig = {
    title: 'Legal Department Contract Review',
    questions: [
      {
        id: 'q1',
        question: 'Is this contract compliant with our company policies?',
        description:
          'Please assess overall compliance with current company guidelines and policies',
        type: FieldType.Select,
        fieldKey: legalReviewFields[0].key,
        isRequired: true,
        placeholder: 'Select an option',
        order: 1,
        options: [
          { label: 'Fully Compliant', value: 'fully_compliant' },
          { label: 'Mostly Compliant - Minor Issues', value: 'mostly_compliant' },
          { label: 'Requires Significant Changes', value: 'needs_changes' },
          { label: 'Non-Compliant', value: 'non_compliant' },
        ],
      },
      {
        id: 'q2',
        question: 'Describe any potential legal risks associated with this contract',
        description: 'Detail all identified legal risks and their potential impact',
        type: FieldType.LongText,
        fieldKey: legalReviewFields[1].key,
        isRequired: true,
        placeholder: 'Enter detailed risk assessment',
        order: 2,
        validation: {
          minLength: 50,
          maxLength: 2000,
        },
      },
      {
        id: 'q3',
        question: 'List recommended changes to mitigate legal risks',
        description: 'Provide specific recommendations for contract modifications',
        type: FieldType.LongText,
        fieldKey: legalReviewFields[2].key,
        isRequired: false,
        placeholder: 'Enter recommendations',
        order: 3,
      },
      {
        id: 'q4',
        question: 'Primary legal jurisdiction for this contract',
        description: 'Select the primary jurisdiction where this contract will be enforced',
        type: FieldType.Country,
        fieldKey: legalReviewFields[3].key,
        isRequired: true,
        order: 4,
      },
      {
        id: 'q5',
        question: 'Date of legal department approval',
        description: 'When was this contract approved by the legal department?',
        type: FieldType.Date,
        fieldKey: legalReviewFields[4].key,
        isRequired: true,
        order: 5,
      },
    ],
  }

  const ndaReviewQuestionnaireConfig = {
    title: 'NDA Requirements Assessment',
    questions: [
      {
        id: 'q1',
        question: 'Required level of confidentiality',
        description: 'Select the appropriate confidentiality classification for this NDA',
        type: FieldType.Select,
        fieldKey: ndaReviewFields[0].key,
        isRequired: true,
        placeholder: 'Select confidentiality level',
        order: 1,
        options: [
          { label: 'Standard', value: 'standard' },
          { label: 'Sensitive', value: 'sensitive' },
          { label: 'Highly Confidential', value: 'highly_confidential' },
          { label: 'Top Secret', value: 'top_secret' },
        ],
      },
      {
        id: 'q2',
        question: 'What types of information will be disclosed?',
        description: 'Select all categories of information covered by this NDA',
        type: FieldType.MultiSelect,
        fieldKey: ndaReviewFields[1].key,
        isRequired: true,
        placeholder: 'Select all that apply',
        order: 2,
        options: [
          { label: 'Financial Data', value: 'financial' },
          { label: 'Intellectual Property', value: 'ip' },
          { label: 'Business Strategies', value: 'strategy' },
          { label: 'Customer Information', value: 'customer' },
          { label: 'Technical Specifications', value: 'technical' },
          { label: 'Employee Information', value: 'employee' },
          { label: 'Research & Development', value: 'research' },
        ],
      },
      {
        id: 'q3',
        question: 'Duration of confidentiality obligations (in years)',
        description: 'How many years should the confidentiality obligations remain in effect?',
        type: FieldType.Number,
        fieldKey: ndaReviewFields[2].key,
        isRequired: true,
        placeholder: 'Enter number of years',
        order: 3,
        validation: {
          min: 1,
          max: 20,
        },
      },
      {
        id: 'q4',
        question: 'Will third parties need access to confidential information?',
        description: 'Indicate if third parties will need access to the confidential information',
        type: FieldType.Radio,
        fieldKey: ndaReviewFields[3].key,
        isRequired: true,
        order: 4,
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
      },
      {
        id: 'q5',
        question: 'Any special confidentiality provisions needed',
        description: 'Describe any special provisions or non-standard requirements',
        type: FieldType.LongText,
        fieldKey: ndaReviewFields[4].key,
        isRequired: false,
        placeholder: 'Enter special provisions',
        order: 5,
      },
    ],
  }

  // Update the step actions to include questionnaire configs
  console.log('Updating step actions with questionnaire configurations...')

  // Find the existing QUESTIONNAIRE action for Legal Review step
  const legalReviewAction = await prisma.action.findFirst({
    where: {
      step_id: legalReviewStep.id,
      type: TypeActions.QUESTIONNAIRE,
    },
  })

  if (legalReviewAction) {
    await prisma.action.update({
      where: { id: legalReviewAction.id },
      data: {
        config: legalReviewQuestionnaireConfig,
      },
    })
  } else {
    // Create new action if not found
    await prisma.action.create({
      data: {
        step_id: legalReviewStep.id,
        type: TypeActions.QUESTIONNAIRE,
        config: legalReviewQuestionnaireConfig,
        order: 1,
        is_required: true,
      },
    })
  }

  // Find the existing QUESTIONNAIRE action for NDA Review step
  const ndaReviewAction = await prisma.action.findFirst({
    where: {
      step_id: ndaReviewStep.id,
      type: TypeActions.QUESTIONNAIRE,
    },
  })

  if (ndaReviewAction) {
    await prisma.action.update({
      where: { id: ndaReviewAction.id },
      data: {
        config: ndaReviewQuestionnaireConfig,
      },
    })
  } else {
    // Create new action if not found
    await prisma.action.create({
      data: {
        step_id: ndaReviewStep.id,
        type: TypeActions.QUESTIONNAIRE,
        config: ndaReviewQuestionnaireConfig,
        order: 1,
        is_required: true,
      },
    })
  }

  const steps = [
    { id: draftStep.id, configs: draftStepConfigs },
    {
      id: legalReviewStep.id,
      configs: [legalReviewQuestionnaireConfig, ...approvalStepConfigs.slice(0, 2)],
    },
    { id: approvalStep.id, configs: approvalStepConfigs },
    { id: ndaDraftStep.id, configs: draftStepConfigs },
    {
      id: ndaReviewStep.id,
      configs: [ndaReviewQuestionnaireConfig, ...approvalStepConfigs.slice(0, 2)],
    },
    { id: ndaSignatureStep.id, configs: signatureStepConfigs },
  ]

  // Créer les actions pour toutes les étapes
  for (const step of steps) {
    await createQuestionnairesForStep(step.id, step.configs)
  }

  // Sample answers for questionnaires (could be stored as contract data)
  const sampleLegalReviewAnswers = {
    legal_compliance: 'mostly_compliant',
    legal_risks:
      'The contract has some potential issues with the payment terms in section 4.2. The current wording could lead to payment disputes if deliverables are partially completed. Additionally, the liability cap in section 7.1 may be insufficient for the scope of work described.',
    recommended_changes:
      '1. Revise section 4.2 to clearly define acceptance criteria for each deliverable\n2. Increase liability cap in section 7.1 from 50% to 100% of contract value\n3. Add more specific dispute resolution procedures in section 9',
    jurisdiction_check: 'FR',
    legal_approval_date: '2025-05-20',
  }

  const sampleNdaAnswers = {
    confidentiality_level: 'highly_confidential',
    disclosure_scope: ['financial', 'ip', 'strategy', 'technical'],
    duration_years: 5,
    third_party_disclosure: 'no',
    special_provisions:
      'Include special handling procedures for technical specifications related to pending patent applications. Require all digital copies to be encrypted with AES-256 encryption.',
  }

  // Create sample completed questionnaires by updating contract data
  console.log('Creating sample questionnaire responses...')

  // Find the contracts we want to update
  const standardContract = await prisma.contract.findFirst({
    where: { title: 'Service Agreement with Acme Corp' },
  })

  const ndaContract = await prisma.contract.findFirst({
    where: { title: 'Confidential NDA' },
  })

  const consultingContract = await prisma.contract.findFirst({
    where: { title: 'Consulting Agreement with Beta LLC' },
  })

  if (standardContract) {
    await prisma.contract.update({
      where: { id: standardContract.id },
      data: {
        data: {
          ...standardContract.data,
          questionnaire_legal_review: sampleLegalReviewAnswers,
        },
      },
    })
  }

  if (ndaContract) {
    await prisma.contract.update({
      where: { id: ndaContract.id },
      data: {
        data: {
          ...ndaContract.data,
          questionnaire_nda_review: sampleNdaAnswers,
        },
      },
    })
  }

  if (consultingContract) {
    await prisma.contract.update({
      where: { id: consultingContract.id },
      data: {
        data: {
          ...consultingContract.data,
          questionnaire_legal_review: sampleLegalReviewAnswers, // Using same sample for simplicity
        },
      },
    })
  }

  console.log('Questionnaire data seeding completed successfully!')
}

// Run the main seeding function
main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
