import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create companies
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'Acme Corporation',
        email: 'contact@acme.com'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Global Enterprises',
        email: 'info@globalenterprises.com'
      }
    })
  ]);
  console.log('Created companies:', companies.length);

  // Create files
  const files = await Promise.all([
    prisma.file.create({
      data: {
        name: 'Contract Template',
        location: '/files/templates/contract_v1.docx',
        company_id: companies[0].id
      }
    }),
    prisma.file.create({
      data: {
        name: 'Legal Guidelines',
        location: '/files/guides/legal_guidelines.pdf',
        company_id: companies[1].id
      }
    })
  ]);
  console.log('Created files:', files.length);

  // Create permissions
  const permissions = await Promise.all([
    prisma.permission.create({
      data: {
        name: 'contract:read'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'contract:write'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'workflow:manage'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'users:manage'
      }
    })
  ]);
  console.log('Created permissions:', permissions.length);

  // Create roles with permissions
  const roles = await Promise.all([
    prisma.role.create({
      data: {
        name: 'Admin',
        permissions: {
          create: permissions.map(permission => ({
            permission_id: permission.id
          }))
        }
      }
    }),
    prisma.role.create({
      data: {
        name: 'User',
        permissions: {
          create: [
            { permission_id: permissions[0].id } // contract:read
          ]
        }
      }
    }),
    prisma.role.create({
      data: {
        name: 'Manager',
        permissions: {
          create: [
            { permission_id: permissions[0].id }, // contract:read
            { permission_id: permissions[1].id }, // contract:write
            { permission_id: permissions[2].id }  // workflow:manage
          ]
        }
      }
    })
  ]);
  console.log('Created roles:', roles.length);

  // Hash passwords
  const saltRounds = 10;
  const password = await bcrypt.hash('Password123', saltRounds);

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@acme.com',
        password_hash: password,
        first_name: 'Admin',
        last_name: 'User',
        role_id: roles[0].id,
        company_id: companies[0].id
      }
    }),
    prisma.user.create({
      data: {
        email: 'manager@acme.com',
        password_hash: password,
        first_name: 'Manager',
        last_name: 'User',
        role_id: roles[2].id,
        company_id: companies[0].id
      }
    }),
    prisma.user.create({
      data: {
        email: 'user@globalenterprises.com',
        password_hash: password,
        first_name: 'Regular',
        last_name: 'User',
        role_id: roles[1].id,
        company_id: companies[1].id
      }
    })
  ]);
  console.log('Created users:', users.length);

  // Create dynamic fields
  const dynamicFields = await Promise.all([
    prisma.dynamicField.create({
      data: {
        key: 'client_name',
        value: '',
        type: 'Text',
        description: 'Full legal name of the client',
        is_required: true,
        placeholder: 'Enter client name'
      }
    }),
    prisma.dynamicField.create({
      data: {
        key: 'contract_value',
        value: '',
        type: 'Currency',
        description: 'Total value of the contract',
        is_required: true,
        placeholder: '0.00'
      }
    }),
    prisma.dynamicField.create({
      data: {
        key: 'start_date',
        value: '',
        type: 'Date',
        description: 'Contract start date',
        is_required: true
      }
    }),
    prisma.dynamicField.create({
      data: {
        key: 'contract_type',
        value: '',
        type: 'Select',
        description: 'Type of contract',
        is_required: true
      }
    }),
    prisma.dynamicField.create({
      data: {
        key: 'client_address',
        value: '',
        type: 'Address',
        description: 'Client address',
        is_required: false
      }
    })
  ]);
  console.log('Created dynamic fields:', dynamicFields.length);

  // Create workflows
  const workflows = await Promise.all([
    prisma.workflow.create({
      data: {
        name: 'Standard Contract Workflow',
        description: 'Standard process for contract review and signature',
        file_name: 'standard_contract_template.docx',
        created_by_id: users[0].id,
        template_content: '<p>This is a standard contract template.</p>'
      }
    }),
    prisma.workflow.create({
      data: {
        name: 'NDA Process',
        description: 'Workflow for processing NDAs',
        file_name: 'nda_template.docx',
        created_by_id: users[1].id,
        template_content: '<p>This is a non-disclosure agreement template.</p>'
      }
    })
  ]);
  console.log('Created workflows:', workflows.length);

  // Associate dynamic fields with workflows
  await Promise.all([
    prisma.workflowField.create({
      data: {
        field_id: dynamicFields[0].id,
        workflow_id: workflows[0].id
      }
    }),
    prisma.workflowField.create({
      data: {
        field_id: dynamicFields[1].id,
        workflow_id: workflows[0].id
      }
    }),
    prisma.workflowField.create({
      data: {
        field_id: dynamicFields[2].id,
        workflow_id: workflows[0].id
      }
    }),
    prisma.workflowField.create({
      data: {
        field_id: dynamicFields[3].id,
        workflow_id: workflows[1].id
      }
    }),
    prisma.workflowField.create({
      data: {
        field_id: dynamicFields[4].id,
        workflow_id: workflows[1].id
      }
    })
  ]);
  console.log('Associated dynamic fields with workflows');

  // Create steps for workflows
  const steps = await Promise.all([
    // Steps for Standard Contract Workflow
    prisma.step.create({
      data: {
        workflow_id: workflows[0].id,
        name: 'Initial Draft',
        description: 'Create the initial contract draft',
        order: 1
      }
    }),
    prisma.step.create({
      data: {
        workflow_id: workflows[0].id,
        name: 'Legal Review',
        description: 'Legal department reviews the contract',
        order: 2
      }
    }),
    prisma.step.create({
      data: {
        workflow_id: workflows[0].id,
        name: 'Client Review',
        description: 'Client reviews and suggests changes',
        order: 3
      }
    }),
    prisma.step.create({
      data: {
        workflow_id: workflows[0].id,
        name: 'Final Approval',
        description: 'Final approval of the contract',
        order: 4
      }
    }),
    prisma.step.create({
      data: {
        workflow_id: workflows[0].id,
        name: 'Signatures',
        description: 'All parties sign the contract',
        order: 5
      }
    }),
    
    // Steps for NDA Process
    prisma.step.create({
      data: {
        workflow_id: workflows[1].id,
        name: 'NDA Preparation',
        description: 'Prepare the NDA document',
        order: 1
      }
    }),
    prisma.step.create({
      data: {
        workflow_id: workflows[1].id,
        name: 'NDA Review',
        description: 'Internal review of the NDA',
        order: 2
      }
    }),
    prisma.step.create({
      data: {
        workflow_id: workflows[1].id,
        name: 'NDA Signing',
        description: 'Signing of the NDA by all parties',
        order: 3
      }
    })
  ]);
  console.log('Created steps:', steps.length);

  // Create actions for steps
  const actions = await Promise.all([
    // Actions for Standard Contract Workflow
    prisma.action.create({
      data: {
        step_id: steps[0].id,
        type: 'GENERER',
        config: { template: 'standard_contract' },
        order: 1,
        is_required: true
      }
    }),
    prisma.action.create({
      data: {
        step_id: steps[1].id,
        type: 'QUESTIONNAIRE',
        config: { questions: ['Is this contract compliant with our policies?', 'Any legal risks?'] },
        order: 1,
        is_required: true
      }
    }),
    prisma.action.create({
      data: {
        step_id: steps[2].id,
        type: 'ENVOYER_MAIL',
        config: { template: 'client_review', recipient: 'client' },
        order: 1,
        is_required: true
      }
    }),
    prisma.action.create({
      data: {
        step_id: steps[3].id,
        type: 'VALIDER',
        config: { approvers: ['legal', 'finance'] },
        order: 1,
        is_required: true
      }
    }),
    prisma.action.create({
      data: {
        step_id: steps[4].id,
        type: 'SIGNER',
        config: { signatories: ['company_representative', 'client_representative'] },
        order: 1,
        is_required: true
      }
    }),
    
    // Actions for NDA Process
    prisma.action.create({
      data: {
        step_id: steps[5].id,
        type: 'GENERER',
        config: { template: 'nda_template' },
        order: 1,
        is_required: true
      }
    }),
    prisma.action.create({
      data: {
        step_id: steps[6].id,
        type: 'VALIDER',
        config: { approvers: ['legal'] },
        order:1,
        is_required: true
      }
    }),
    prisma.action.create({
      data: {
        step_id: steps[7].id,
        type: 'SIGNER',
        config: { signatories: ['company_representative', 'partner_representative'] },
        order: 1,
        is_required: true
      }
    }),
    prisma.action.create({
      data: {
        step_id: steps[7].id,
        type: 'NOTIFIER',
        config: { recipients: ['all'], message: 'NDA has been signed' },
        order: 2,
        is_required: true
      }
    })
  ]);
  console.log('Created actions:', actions.length);

  // Create contracts
  const contracts = await Promise.all([
    prisma.contract.create({
      data: {
        title: 'Service Agreement with Acme Corp',
        status: 'PREPARATION',
        data: { 
          client_name: 'Acme Corporation',
          contract_value: 50000,
          start_date: '2025-06-01'
        },
        language: 'Français',
        isConfidential: false,
        created_by_id: users[0].id
      }
    }),
    prisma.contract.create({
      data: {
        title: 'Confidential NDA',
        status: 'NEGOCIATION',
        data: {
          client_name: 'Global Enterprises',
          contract_type: 'NDA',
          start_date: '2025-05-15'
        },
        language: 'Anglais',
        isConfidential: true,
        created_by_id: users[1].id
      }
    })
  ]);
  console.log('Created contracts:', contracts.length);

  // Associate users with contracts
  await Promise.all([
    prisma.userContract.create({
      data: {
        user_id: users[0].id,
        contract_id: contracts[0].id,
        droit: 'EDITOR'
      }
    }),
    prisma.userContract.create({
      data: {
        user_id: users[1].id,
        contract_id: contracts[0].id,
        droit: 'COMMENTATOR'
      }
    }),
    prisma.userContract.create({
      data: {
        user_id: users[1].id,
        contract_id: contracts[1].id,
        droit: 'EDITOR'
      }
    }),
    prisma.userContract.create({
      data: {
        user_id: users[2].id,
        contract_id: contracts[1].id,
        droit: 'COMMENTATOR'
      }
    })
  ]);
  console.log('Associated users with contracts');

  // Create comments
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        contract_id: contracts[0].id,
        commented_by_id: users[1].id,
        comment: 'We should review the payment terms in section 3.',
        position: 1
      }
    }),
    prisma.comment.create({
      data: {
        contract_id: contracts[0].id,
        commented_by_id: users[0].id,
        comment: 'I agree, let\'s update that section.',
        position: 2
      }
    }),
    prisma.comment.create({
      data: {
        contract_id: contracts[1].id,
        commented_by_id: users[1].id,
        comment: 'The confidentiality clause needs to be stronger.',
        position: 1
      }
    })
  ]);
  console.log('Created comments:', comments.length);

  // Create notifications
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        user_id: users[0].id,
        type: 'CONTRACT_COMMENT',
        payload: { 
          contract_id: contracts[0].id, 
          comment_id: comments[0].id,
          message: 'New comment on Service Agreement'
        }
      }
    }),
    prisma.notification.create({
      data: {
        user_id: users[1].id,
        type: 'CONTRACT_UPDATED',
        payload: { 
          contract_id: contracts[0].id,
          message: 'Service Agreement has been updated'
        }
      }
    }),
    prisma.notification.create({
      data: {
        user_id: users[2].id,
        type: 'CONTRACT_SHARED',
        payload: { 
          contract_id: contracts[1].id,
          message: 'Confidential NDA has been shared with you'
        }
      }
    })
  ]);
  console.log('Created notifications:', notifications.length);

  // Create tickets
  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        title: 'Issue with contract generation',
        content: 'I\'m having trouble generating a contract from the template.',
        user_id: users[0].id,
        company_id: companies[0].id
      }
    }),
    prisma.ticket.create({
      data: {
        title: 'Need assistance with workflow',
        content: 'Can someone help me set up a custom workflow for our partnership agreements?',
        user_id: users[1].id,
        company_id: companies[0].id
      }
    }),
    prisma.ticket.create({
      data: {
        title: 'Access issue',
        content: 'I can\'t access the contracts I\'m supposed to review.',
        user_id: users[2].id,
        company_id: companies[1].id
      }
    })
  ]);
  console.log('Created tickets:', tickets.length);

  // Create settings
  const settings = await Promise.all([
    prisma.setting.create({
      data: {
        key: 'email_notifications',
        value: { enabled: true, digest: 'daily' }
      }
    }),
    prisma.setting.create({
      data: {
        key: 'default_language',
        value: { language: 'Français' }
      }
    }),
    prisma.setting.create({
      data: {
        key: 'security',
        value: { 
          password_expiry_days: 90,
          two_factor_auth: true,
          session_timeout_minutes: 30
        }
      }
    })
  ]);

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });