import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Define FieldType enum to match your provided interface
const FieldType = {
  Text: 'Text',
  LongText: 'LongText',
  Number: 'Number',
  Date: 'Date',
  Time: 'Time',
  Select: 'Select',
  MultiSelect: 'MultiSelect',
  Radio: 'Radio',
  Currency: 'Currency',
  Email: 'Email',
  Phone: 'Phone',
  Address: 'Address',
  File: 'File',
  Country: 'Country',
  City: 'City',
  Nationality: 'Nationality',
  TypeOfCompany: 'TypeOfCompany',
  Contact: 'Contact'
};

async function seedQuestionnaires() {
  console.log('Starting questionnaire data seeding...');

  // First, fetch existing workflows to reference them
  const standardContractWorkflow = await prisma.workflow.findFirst({
    where: { name: 'Standard Contract Workflow' }
  });

  const ndaWorkflow = await prisma.workflow.findFirst({
    where: { name: 'NDA Process' }
  });

  if (!standardContractWorkflow || !ndaWorkflow) {
    console.error('Required workflows not found! Run the main seed script first.');
    return;
  }

  // Fetch the step IDs where we want to attach questionnaires
  const legalReviewStep = await prisma.step.findFirst({
    where: {
      workflow_id: standardContractWorkflow.id,
      name: 'Legal Review'
    }
  });

  const ndaReviewStep = await prisma.step.findFirst({
    where: {
      workflow_id: ndaWorkflow.id,
      name: 'NDA Review'
    }
  });

  if (!legalReviewStep || !ndaReviewStep) {
    console.error('Required steps not found! Check step names or run the main seed script first.');
    return;
  }

  // Create questionnaire dynamic fields
  console.log('Creating questionnaire dynamic fields...');

  // Legal Review Questionnaire Fields
  const legalReviewFields = await Promise.all([
    prisma.dynamicField.create({
      data: {
        key: 'legal_compliance',
        value: '',
        type: FieldType.Select,
        description: 'Is this contract compliant with our company policies?',
        is_required: true,
        placeholder: 'Select compliance status'
      }
    }),
    prisma.dynamicField.create({
      data: {
        key: 'legal_risks',
        value: '',
        type: FieldType.LongText,
        description: 'Describe any potential legal risks associated with this contract',
        is_required: true,
        placeholder: 'Enter detailed analysis of legal risks'
      }
    }),
    prisma.dynamicField.create({
      data: {
        key: 'recommended_changes',
        value: '',
        type: FieldType.LongText,
        description: 'List recommended changes to mitigate legal risks',
        is_required: false,
        placeholder: 'Enter recommended contract modifications'
      }
    }),
    prisma.dynamicField.create({
      data: {
        key: 'jurisdiction_check',
        value: '',
        type: FieldType.Country,
        description: 'Primary legal jurisdiction for this contract',
        is_required: true,
        placeholder: 'Select applicable jurisdiction'
      }
    }),
    prisma.dynamicField.create({
      data: {
        key: 'legal_approval_date',
        value: '',
        type: FieldType.Date,
        description: 'Date of legal department approval',
        is_required: true
      }
    })
  ]);

  // NDA Review Questionnaire Fields
  const ndaReviewFields = await Promise.all([
    prisma.dynamicField.create({
      data: {
        key: 'confidentiality_level',
        value: '',
        type: FieldType.Select,
        description: 'Required level of confidentiality',
        is_required: true,
        placeholder: 'Select confidentiality level'
      }
    }),
    prisma.dynamicField.create({
      data: {
        key: 'disclosure_scope',
        value: '',
        type: FieldType.MultiSelect,
        description: 'What types of information will be disclosed?',
        is_required: true,
        placeholder: 'Select all applicable information types'
      }
    }),
    prisma.dynamicField.create({
      data: {
        key: 'duration_years',
        value: '',
        type: FieldType.Number,
        description: 'Duration of confidentiality obligations (in years)',
        is_required: true,
        placeholder: 'Enter number of years'
      }
    }),
    prisma.dynamicField.create({
      data: {
        key: 'third_party_disclosure',
        value: '',
        type: FieldType.Radio,
        description: 'Will third parties need access to confidential information?',
        is_required: true
      }
    }),
    prisma.dynamicField.create({
      data: {
        key: 'special_provisions',
        value: '',
        type: FieldType.LongText,
        description: 'Any special confidentiality provisions needed',
        is_required: false,
        placeholder: 'Describe any special provisions'
      }
    })
  ]);

  console.log(`Created ${legalReviewFields.length + ndaReviewFields.length} questionnaire fields`);

  // Create questionnaire action configs
  const legalReviewQuestionnaireConfig = {
    title: "Legal Department Contract Review",
    questions: [
      {
        id: "q1",
        question: "Is this contract compliant with our company policies?",
        description: "Please assess overall compliance with current company guidelines and policies",
        type: FieldType.Select,
        fieldKey: legalReviewFields[0].key,
        isRequired: true,
        placeholder: "Select an option",
        order: 1,
        options: [
          { label: "Fully Compliant", value: "fully_compliant" },
          { label: "Mostly Compliant - Minor Issues", value: "mostly_compliant" },
          { label: "Requires Significant Changes", value: "needs_changes" },
          { label: "Non-Compliant", value: "non_compliant" }
        ]
      },
      {
        id: "q2",
        question: "Describe any potential legal risks associated with this contract",
        description: "Detail all identified legal risks and their potential impact",
        type: FieldType.LongText,
        fieldKey: legalReviewFields[1].key,
        isRequired: true,
        placeholder: "Enter detailed risk assessment",
        order: 2,
        validation: {
          minLength: 50,
          maxLength: 2000
        }
      },
      {
        id: "q3",
        question: "List recommended changes to mitigate legal risks",
        description: "Provide specific recommendations for contract modifications",
        type: FieldType.LongText,
        fieldKey: legalReviewFields[2].key,
        isRequired: false,
        placeholder: "Enter recommendations",
        order: 3
      },
      {
        id: "q4",
        question: "Primary legal jurisdiction for this contract",
        description: "Select the primary jurisdiction where this contract will be enforced",
        type: FieldType.Country,
        fieldKey: legalReviewFields[3].key,
        isRequired: true,
        order: 4
      },
      {
        id: "q5",
        question: "Date of legal department approval",
        description: "When was this contract approved by the legal department?",
        type: FieldType.Date,
        fieldKey: legalReviewFields[4].key,
        isRequired: true,
        order: 5
      }
    ]
  };

  const ndaReviewQuestionnaireConfig = {
    title: "NDA Requirements Assessment",
    questions: [
      {
        id: "q1",
        question: "Required level of confidentiality",
        description: "Select the appropriate confidentiality classification for this NDA",
        type: FieldType.Select,
        fieldKey: ndaReviewFields[0].key,
        isRequired: true,
        placeholder: "Select confidentiality level",
        order: 1,
        options: [
          { label: "Standard", value: "standard" },
          { label: "Sensitive", value: "sensitive" },
          { label: "Highly Confidential", value: "highly_confidential" },
          { label: "Top Secret", value: "top_secret" }
        ]
      },
      {
        id: "q2",
        question: "What types of information will be disclosed?",
        description: "Select all categories of information covered by this NDA",
        type: FieldType.MultiSelect,
        fieldKey: ndaReviewFields[1].key,
        isRequired: true,
        placeholder: "Select all that apply",
        order: 2,
        options: [
          { label: "Financial Data", value: "financial" },
          { label: "Intellectual Property", value: "ip" },
          { label: "Business Strategies", value: "strategy" },
          { label: "Customer Information", value: "customer" },
          { label: "Technical Specifications", value: "technical" },
          { label: "Employee Information", value: "employee" },
          { label: "Research & Development", value: "research" }
        ]
      },
      {
        id: "q3",
        question: "Duration of confidentiality obligations (in years)",
        description: "How many years should the confidentiality obligations remain in effect?",
        type: FieldType.Number,
        fieldKey: ndaReviewFields[2].key,
        isRequired: true,
        placeholder: "Enter number of years",
        order: 3,
        validation: {
          min: 1,
          max: 20
        }
      },
      {
        id: "q4",
        question: "Will third parties need access to confidential information?",
        description: "Indicate if third parties will need access to the confidential information",
        type: FieldType.Radio,
        fieldKey: ndaReviewFields[3].key,
        isRequired: true,
        order: 4,
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" }
        ]
      },
      {
        id: "q5",
        question: "Any special confidentiality provisions needed",
        description: "Describe any special provisions or non-standard requirements",
        type: FieldType.LongText,
        fieldKey: ndaReviewFields[4].key,
        isRequired: false,
        placeholder: "Enter special provisions",
        order: 5
      }
    ]
  };

  // Update the step actions to include questionnaire configs
  console.log('Updating step actions with questionnaire configurations...');

  // Find the existing QUESTIONNAIRE action for Legal Review step
  const legalReviewAction = await prisma.action.findFirst({
    where: {
      step_id: legalReviewStep.id,
      type: 'QUESTIONNAIRE'
    }
  });

  if (legalReviewAction) {
    await prisma.action.update({
      where: { id: legalReviewAction.id },
      data: {
        config: legalReviewQuestionnaireConfig
      }
    });
  } else {
    // Create new action if not found
    await prisma.action.create({
      data: {
        step_id: legalReviewStep.id,
        type: 'QUESTIONNAIRE',
        config: legalReviewQuestionnaireConfig,
        order: 1,
        is_required: true
      }
    });
  }

  // Create NDA Review questionnaire action
  await prisma.action.create({
    data: {
      step_id: ndaReviewStep.id,
      type: 'QUESTIONNAIRE',
      config: ndaReviewQuestionnaireConfig,
      order: 1,
      is_required: true
    }
  });

  // Sample answers for questionnaires (could be stored as contract data)
  const sampleLegalReviewAnswers = {
    legal_compliance: "mostly_compliant",
    legal_risks: "The contract has some potential issues with the payment terms in section 4.2. The current wording could lead to payment disputes if deliverables are partially completed. Additionally, the liability cap in section 7.1 may be insufficient for the scope of work described.",
    recommended_changes: "1. Revise section 4.2 to clearly define acceptance criteria for each deliverable\n2. Increase liability cap in section 7.1 from 50% to 100% of contract value\n3. Add more specific dispute resolution procedures in section 9",
    jurisdiction_check: "FR",
    legal_approval_date: "2025-05-20"
  };

  const sampleNdaAnswers = {
    confidentiality_level: "highly_confidential",
    disclosure_scope: ["financial", "ip", "strategy", "technical"],
    duration_years: 5,
    third_party_disclosure: "no",
    special_provisions: "Include special handling procedures for technical specifications related to pending patent applications. Require all digital copies to be encrypted with AES-256 encryption."
  };

  // Create sample completed questionnaires by updating contract data
  console.log('Creating sample questionnaire responses...');

  // Find the contracts we want to update
  const standardContract = await prisma.contract.findFirst({
    where: { title: 'Service Agreement with Acme Corp' }
  });

  const ndaContract = await prisma.contract.findFirst({
    where: { title: 'Confidential NDA' }
  });

  if (standardContract) {
    await prisma.contract.update({
      where: { id: standardContract.id },
      data: {
        data: {
          ...standardContract.data,
          questionnaire_legal_review: sampleLegalReviewAnswers
        }
      }
    });
  }

  if (ndaContract) {
    await prisma.contract.update({
      where: { id: ndaContract.id },
      data: {
        data: {
          ...ndaContract.data,
          questionnaire_nda_review: sampleNdaAnswers
        }
      }
    });
  }

  console.log('Questionnaire data seeding completed successfully!');
}

// Run the seeding function
seedQuestionnaires()
  .catch((e) => {
    console.error('Error during questionnaire seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
