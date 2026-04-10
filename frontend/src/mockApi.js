const MOCK_TOKEN_KEY = 'sixto_mock_token';
const MOCK_USER_KEY = 'sixto_mock_user';

const ADMIN_EMAIL = 'sixto.developer@gmail.com';
const CLIENT_EMAIL = 'arman@bluegateinc.com';

const clients = [
  {
    id: 'client-bluegate',
    name: 'Bluegate Inc.',
    contact_person: 'Arman Diaz',
    email: CLIENT_EMAIL,
    source: 'Referral',
    status: 'Active',
    industry: 'Construction',
    stripe: 'cus_bluegate_001',
    projects: ['project-bluegate-revops', 'project-bluegate-retainer'],
  },
  {
    id: 'client-northstar',
    name: 'Northstar Health',
    contact_person: 'Maya Wells',
    email: 'maya@northstarhealth.com',
    source: 'Inbound',
    status: 'Paused',
    industry: 'Healthcare',
    stripe: 'cus_northstar_001',
    projects: ['project-northstar-migration'],
  },
];

const projects = [
  {
    id: 'project-bluegate-revops',
    name: 'RevOps Acceleration',
    client: ['client-bluegate'],
    client_name: 'Bluegate Inc.',
    status: 'In progress',
    project_type: ['Sales Cloud', 'Automation'],
    branch: 'Growth',
    project_date: { start: '2026-03-01', end: '2026-05-15' },
    estimated_amount: 24000,
    project_health: 'On Track',
    client_facing_summary: 'We are moving through the first automation release and preparing the executive dashboard review.',
  },
  {
    id: 'project-bluegate-retainer',
    name: 'Salesforce Support Retainer',
    client: ['client-bluegate'],
    client_name: 'Bluegate Inc.',
    status: 'Onboarding',
    project_type: ['Support'],
    branch: 'Operations',
    project_date: { start: '2026-04-01', end: '2026-06-30' },
    estimated_amount: 8000,
    project_health: 'On Track',
    client_facing_summary: 'Support operations are being set up so requests and escalation paths are clear from the start.',
  },
  {
    id: 'project-northstar-migration',
    name: 'CRM Migration',
    client: ['client-northstar'],
    client_name: 'Northstar Health',
    status: 'Research',
    project_type: ['Migration'],
    branch: 'Transformation',
    project_date: { start: '2026-02-10', end: '2026-06-01' },
    estimated_amount: 32000,
    project_health: 'At Risk',
    client_facing_summary: 'Internal sample project for admin verification and workflow testing.',
  },
];

const portalUsers = [
  {
    id: 'portal-user-admin',
    email: ADMIN_EMAIL,
    name: 'Erick Sixto',
    role: 'Admin',
    notion_role: 'Admin',
    status: 'Active',
    client_notion_id: null,
    project_ids: projects.map((project) => project.id),
    default_project_id: 'project-bluegate-revops',
    access_scope: 'Admin',
    portal_user_notion_id: 'portal-user-admin',
  },
  {
    id: 'portal-user-bluegate',
    email: CLIENT_EMAIL,
    name: 'Arman Diaz',
    role: 'Client',
    notion_role: 'Client',
    status: 'Active',
    client_notion_id: 'client-bluegate',
    project_ids: ['project-bluegate-revops', 'project-bluegate-retainer'],
    default_project_id: 'project-bluegate-revops',
    access_scope: 'Project-specific',
    portal_user_notion_id: 'portal-user-bluegate',
  },
];

const tasksByProject = {
  'project-bluegate-revops': [
    {
      id: 'task-1',
      name: 'Finalize discovery summary',
      project: ['project-bluegate-revops'],
      status: 'Done',
      priority: 'High',
      due_date: { start: '2026-03-10', end: null },
      phase: 'Getting Started',
      client_visible: true,
      tag: 'Discovery',
      notes: 'Consolidated stakeholder interviews, lead routing issues, and reporting gaps.',
      client_facing_notes: 'Discovery is complete and the findings package has already been shared.',
      assignee: [{ name: 'Erick Sixto' }],
      files: [{ name: 'Discovery Summary.pdf', url: 'https://example.com/discovery-summary.pdf' }],
      customer_action_needed: false,
      blocked_reason: '',
      sort_order: 1,
    },
    {
      id: 'task-2',
      name: 'Map lead lifecycle automation',
      project: ['project-bluegate-revops'],
      status: 'In progress',
      priority: 'High',
      due_date: { start: '2026-04-12', end: null },
      phase: 'Planning',
      client_visible: true,
      tag: 'Automation',
      notes: 'Define handoff rules from marketing-qualified lead through opportunity creation.',
      client_facing_notes: 'We are mapping the future-state lead lifecycle and validating handoff logic.',
      assignee: [{ name: 'Erick Sixto' }, { name: 'Arman Diaz' }],
      files: [],
      customer_action_needed: true,
      blocked_reason: '',
      sort_order: 2,
    },
    {
      id: 'task-3',
      name: 'Build executive pipeline dashboard',
      project: ['project-bluegate-revops'],
      status: 'Blocked',
      priority: 'Medium',
      due_date: { start: '2026-04-18', end: null },
      phase: 'Implementation',
      client_visible: true,
      tag: 'Reporting',
      notes: 'Waiting on final definitions for regional pipeline segmentation.',
      client_facing_notes: 'The dashboard build is ready to continue once the final segmentation definitions are confirmed.',
      assignee: [{ name: 'Erick Sixto' }],
      files: [],
      customer_action_needed: true,
      blocked_reason: 'Waiting on final definitions for regional pipeline segmentation.',
      sort_order: 3,
    },
    {
      id: 'task-4',
      name: 'Clean duplicate accounts',
      project: ['project-bluegate-revops'],
      status: 'Not Started',
      priority: 'Low',
      due_date: { start: '2026-04-26', end: null },
      phase: 'Implementation',
      client_visible: true,
      tag: 'Data',
      notes: 'Batch cleanup after validation rules are finalized.',
      client_facing_notes: 'Account cleanup will happen after validation rules are confirmed.',
      assignee: [{ name: 'Ops Coordinator' }],
      files: [],
      customer_action_needed: false,
      blocked_reason: '',
      sort_order: 4,
    },
    {
      id: 'task-7',
      name: 'Internal QA checklist',
      project: ['project-bluegate-revops'],
      status: 'Not Started',
      priority: 'Low',
      due_date: { start: '2026-04-22', end: null },
      phase: 'Implementation',
      client_visible: false,
      tag: 'Internal',
      notes: 'Internal verification task that should remain hidden from clients.',
      assignee: [{ name: 'Erick Sixto' }],
      files: [],
      customer_action_needed: false,
      blocked_reason: '',
      sort_order: 99,
    },
  ],
  'project-bluegate-retainer': [
    {
      id: 'task-5',
      name: 'Confirm support queue SLAs',
      project: ['project-bluegate-retainer'],
      status: 'In progress',
      priority: 'Medium',
      due_date: { start: '2026-04-14', end: null },
      phase: 'Getting Started',
      client_visible: true,
      tag: 'Support',
      notes: 'Define triage categories, escalation path, and response expectations.',
      client_facing_notes: 'We are finalizing the support motion so your team knows what to expect on response times and escalation.',
      assignee: [{ name: 'Erick Sixto' }],
      files: [],
      customer_action_needed: false,
      blocked_reason: '',
      sort_order: 1,
    },
  ],
  'project-northstar-migration': [
    {
      id: 'task-6',
      name: 'Audit current CRM schema',
      project: ['project-northstar-migration'],
      status: 'Research',
      priority: 'High',
      due_date: { start: '2026-04-20', end: null },
      phase: 'Planning',
      client_visible: true,
      tag: 'Schema',
      notes: 'Admin-only sample project for the management dashboard.',
      client_facing_notes: 'Admin-only sample project for the management dashboard.',
      assignee: [{ name: 'Erick Sixto' }],
      files: [],
      customer_action_needed: false,
      blocked_reason: '',
      sort_order: 1,
    },
  ],
};

const deliverablesByProject = {
  'project-bluegate-revops': [
    {
      id: 'deliverable-1',
      name: 'Discovery and Recommendations',
      project: ['project-bluegate-revops'],
      status: 'Delivered',
      due_date: { start: '2026-03-12', end: null },
      delivered_date: { start: '2026-03-11', end: null },
      description: 'Initial audit, priority matrix, and 90-day implementation plan.',
      files: [{ name: 'Recommendations Deck.pdf', url: 'https://example.com/recommendations.pdf' }],
      client_visible: true,
    },
    {
      id: 'deliverable-2',
      name: 'Phase 1 Automation Build',
      project: ['project-bluegate-revops'],
      status: 'In Progress',
      due_date: { start: '2026-04-25', end: null },
      delivered_date: null,
      description: 'Lead routing automation, ownership assignment, and notification rules.',
      files: [],
      client_visible: true,
    },
    {
      id: 'deliverable-4',
      name: 'Internal QA Notes',
      project: ['project-bluegate-revops'],
      status: 'Pending',
      due_date: { start: '2026-04-23', end: null },
      delivered_date: null,
      description: 'Internal validation notes for release readiness.',
      files: [],
      client_visible: false,
    },
  ],
  'project-bluegate-retainer': [
    {
      id: 'deliverable-3',
      name: 'Retainer Kickoff Notes',
      project: ['project-bluegate-retainer'],
      status: 'Accepted',
      due_date: { start: '2026-04-05', end: null },
      delivered_date: { start: '2026-04-05', end: null },
      description: 'Operating cadence and intake workflow for ongoing support.',
      files: [{ name: 'Kickoff Notes.pdf', url: 'https://example.com/kickoff-notes.pdf' }],
      client_visible: true,
    },
  ],
  'project-northstar-migration': [],
};

const portalDocumentsByProject = {
  'project-bluegate-revops': [
    {
      id: 'document-bluegate-plan',
      name: 'Delivery Plan',
      title: 'Bluegate Delivery Plan',
      project: ['project-bluegate-revops'],
      client: ['client-bluegate'],
      category: 'Guide',
      client_facing_title: 'Bluegate Delivery Plan',
      summary: 'Implementation sequence, owners, and key decision points for the current delivery phase.',
      files: [{ name: 'Delivery Plan.pdf', url: 'https://example.com/delivery-plan.pdf' }],
      external_url: '',
      client_visible: true,
      sort_order: 1,
      status: 'Published',
      published_at: { start: '2026-04-08', end: null },
      source_system: 'Native',
      external_id: 'doc-delivery-plan',
      owner: [{ name: 'Erick Sixto' }],
      source_last_synced_at: { start: '2026-04-08', end: null },
      last_reviewed_at: { start: '2026-04-08', end: null },
      needs_review: false,
      primary_url: 'https://example.com/delivery-plan.pdf',
    },
    {
      id: 'document-bluegate-contract',
      name: 'Master Services Agreement',
      title: 'Signed MSA',
      project: ['project-bluegate-revops'],
      client: ['client-bluegate'],
      category: 'Contract',
      summary: 'Executed commercial agreement for the current engagement.',
      files: [{ name: 'Signed Contract.pdf', url: 'https://example.com/contract.pdf' }],
      external_url: '',
      client_visible: true,
      sort_order: 2,
      status: 'Published',
      published_at: { start: '2026-03-03', end: null },
      source_system: 'Contract',
      external_id: 'contract-bluegate-001',
      owner: [{ name: 'Erick Sixto' }],
      source_last_synced_at: { start: '2026-04-09', end: null },
      last_reviewed_at: { start: '2026-04-09', end: null },
      needs_review: false,
      primary_url: 'https://example.com/contract.pdf',
    },
    {
      id: 'document-bluegate-report',
      name: 'Executive Dashboard Notes',
      title: 'Executive Dashboard Notes',
      project: ['project-bluegate-revops'],
      client: ['client-bluegate'],
      category: 'Report',
      summary: 'Working notes for the dashboard review session.',
      files: [{ name: 'Dashboard Notes.pdf', url: 'https://example.com/dashboard-notes.pdf' }],
      external_url: '',
      client_visible: true,
      sort_order: 3,
      status: 'Draft',
      published_at: null,
      source_system: 'Deliverable',
      external_id: 'deliverable-dashboard-notes',
      owner: [{ name: 'Erick Sixto' }],
      source_last_synced_at: { start: '2026-04-10', end: null },
      last_reviewed_at: null,
      needs_review: true,
      primary_url: 'https://example.com/dashboard-notes.pdf',
    },
  ],
  'project-bluegate-retainer': [
    {
      id: 'document-support-playbook',
      name: 'Support Playbook',
      title: 'Support Playbook',
      project: ['project-bluegate-retainer'],
      client: ['client-bluegate'],
      category: 'Guide',
      summary: 'How requests are triaged, prioritized, and escalated inside the retainer.',
      files: [{ name: 'Support Playbook.pdf', url: 'https://example.com/support-playbook.pdf' }],
      external_url: '',
      client_visible: true,
      sort_order: 1,
      status: 'Published',
      published_at: { start: '2026-04-09', end: null },
      source_system: 'Native',
      external_id: 'support-playbook',
      owner: [{ name: 'Erick Sixto' }],
      source_last_synced_at: { start: '2026-04-09', end: null },
      last_reviewed_at: { start: '2026-04-09', end: null },
      needs_review: false,
      primary_url: 'https://example.com/support-playbook.pdf',
    },
  ],
  'project-northstar-migration': [],
};

const milestonesByProject = {
  'project-bluegate-revops': [
    {
      id: 'milestone-discovery',
      name: 'Discovery sign-off',
      project: ['project-bluegate-revops'],
      client: ['client-bluegate'],
      status: 'Completed',
      milestone_type: 'Approval',
      target_date: { start: '2026-03-14', end: null },
      completed_date: { start: '2026-03-14', end: null },
      summary: 'Discovery findings and recommendations approved for execution.',
      owner: [{ name: 'Erick Sixto' }],
      client_visible: true,
      sort_order: 1,
      customer_action_needed: false,
      cta_label: '',
      cta_url: '',
    },
    {
      id: 'milestone-automation-review',
      name: 'Automation review',
      project: ['project-bluegate-revops'],
      client: ['client-bluegate'],
      status: 'Upcoming',
      milestone_type: 'Delivery',
      target_date: { start: '2026-04-18', end: null },
      completed_date: null,
      summary: 'Review the first automation release together and confirm the rollout checklist.',
      owner: [{ name: 'Erick Sixto' }],
      client_visible: true,
      sort_order: 2,
      customer_action_needed: true,
      cta_label: 'Review notes',
      cta_url: 'https://example.com/automation-review',
    },
    {
      id: 'milestone-dashboard-signoff',
      name: 'Executive dashboard sign-off',
      project: ['project-bluegate-revops'],
      client: ['client-bluegate'],
      status: 'At Risk',
      milestone_type: 'Approval',
      target_date: { start: '2026-04-25', end: null },
      completed_date: null,
      summary: 'Pending final segmentation definitions before dashboard approval can happen.',
      owner: [{ name: 'Erick Sixto' }],
      client_visible: true,
      sort_order: 3,
      customer_action_needed: true,
      cta_label: 'Share final definitions',
      cta_url: 'https://example.com/dashboard-definitions',
    },
  ],
  'project-bluegate-retainer': [
    {
      id: 'milestone-retainer-kickoff',
      name: 'Retainer kickoff',
      project: ['project-bluegate-retainer'],
      client: ['client-bluegate'],
      status: 'Upcoming',
      milestone_type: 'Kickoff',
      target_date: { start: '2026-04-11', end: null },
      completed_date: null,
      summary: 'Confirm scope boundaries, intake cadence, and escalation expectations.',
      owner: [{ name: 'Erick Sixto' }],
      client_visible: true,
      sort_order: 1,
      customer_action_needed: false,
      cta_label: 'Join kickoff',
      cta_url: 'https://meet.google.com/example-kickoff',
    },
  ],
  'project-northstar-migration': [],
};

const updatesByProject = {
  'project-bluegate-revops': [
    {
      id: 'update-1',
      name: 'Phase 1 build started',
      project: ['project-bluegate-revops'],
      date: { start: '2026-04-08', end: null },
      content: 'We started building the first automation set and aligned on the revised handoff logic.',
      type: 'Status Update',
      client_visible: true,
      pinned: true,
      excerpt: 'Automation build is underway and the handoff logic has been aligned.',
      cta_label: 'Review plan',
      cta_url: 'https://example.com/delivery-plan',
    },
    {
      id: 'update-2',
      name: 'Recommendations approved',
      project: ['project-bluegate-revops'],
      date: { start: '2026-03-14', end: null },
      content: 'The recommendations package was reviewed and approved with one follow-up on dashboard segmentation.',
      type: 'Milestone',
      client_visible: true,
      pinned: false,
      excerpt: 'Recommendations were approved and the project moved into execution.',
      cta_label: '',
      cta_url: '',
    },
  ],
  'project-bluegate-retainer': [
    {
      id: 'update-3',
      name: 'Support intake channels defined',
      project: ['project-bluegate-retainer'],
      date: { start: '2026-04-09', end: null },
      content: 'Email and case intake are in scope for the first support sprint.',
      type: 'Announcement',
      client_visible: true,
      pinned: true,
      excerpt: 'Support intake channels are confirmed for the first sprint.',
      cta_label: 'Open support intake',
      cta_url: 'https://example.com/support-intake',
    },
  ],
  'project-northstar-migration': [],
};

const meetingsByProject = {
  'project-bluegate-revops': [
    {
      id: 'meeting-1',
      name: 'Weekly delivery sync',
      project: ['project-bluegate-revops'],
      date_time: { start: '2026-04-15T16:00:00Z', end: '2026-04-15T16:45:00Z' },
      meeting_link: 'https://meet.google.com/example-sync',
      status: 'Scheduled',
      client_visible: true,
      meeting_summary: '',
      notes: '',
      participant: 'Arman Diaz, Erick Sixto',
    },
    {
      id: 'meeting-2',
      name: 'Discovery readout',
      project: ['project-bluegate-revops'],
      date_time: { start: '2026-03-11T17:00:00Z', end: '2026-03-11T18:00:00Z' },
      meeting_link: 'https://meet.google.com/example-readout',
      status: 'Completed',
      client_visible: true,
      meeting_summary: 'Reviewed the current funnel bottlenecks and agreed to prioritize routing and dashboards first.',
      notes: '',
      participant: 'Bluegate leadership team',
    },
  ],
  'project-bluegate-retainer': [
    {
      id: 'meeting-3',
      name: 'Retainer kickoff',
      project: ['project-bluegate-retainer'],
      date_time: { start: '2026-04-11T18:00:00Z', end: '2026-04-11T18:30:00Z' },
      meeting_link: 'https://meet.google.com/example-kickoff',
      status: 'Invite Sent',
      client_visible: true,
      meeting_summary: '',
      notes: '',
      participant: 'Operations team',
    },
  ],
  'project-northstar-migration': [],
};

const invoicesByProject = {
  'project-bluegate-revops': [
    {
      id: 'invoice-1',
      no: 'INV-2026-041',
      project: ['project-bluegate-revops'],
      amount: 12000,
      paid: true,
      payment_status: 'Paid',
      due_date: { start: '2026-03-20', end: null },
      issued_on: { start: '2026-03-06', end: null },
      stripe_invoice_id: 'in_001',
      stripe_invoice_url: 'https://dashboard.stripe.com/invoices/in_001',
      type: 'Project',
      issued_to: 'Bluegate Inc.',
      source: 'Stripe',
      files: [],
    },
    {
      id: 'invoice-2',
      no: 'INV-2026-058',
      project: ['project-bluegate-revops'],
      amount: 8000,
      paid: false,
      payment_status: 'Sent',
      due_date: { start: '2026-04-18', end: null },
      issued_on: { start: '2026-04-04', end: null },
      stripe_invoice_id: 'in_002',
      stripe_invoice_url: 'https://dashboard.stripe.com/invoices/in_002',
      type: 'Milestone',
      issued_to: 'Bluegate Inc.',
      source: 'Stripe',
      files: [],
    },
  ],
  'project-bluegate-retainer': [
    {
      id: 'invoice-3',
      no: 'INV-2026-061',
      project: ['project-bluegate-retainer'],
      amount: 4000,
      paid: false,
      payment_status: 'Draft',
      due_date: { start: '2026-04-30', end: null },
      issued_on: { start: '2026-04-09', end: null },
      stripe_invoice_id: 'in_003',
      stripe_invoice_url: 'https://dashboard.stripe.com/invoices/in_003',
      type: 'Retainer',
      issued_to: 'Bluegate Inc.',
      source: 'Stripe',
      files: [],
    },
  ],
  'project-northstar-migration': [
    {
      id: 'invoice-4',
      no: 'INV-2026-050',
      project: ['project-northstar-migration'],
      amount: 16000,
      paid: false,
      payment_status: 'Overdue',
      due_date: { start: '2026-03-28', end: null },
      issued_on: { start: '2026-03-01', end: null },
      stripe_invoice_id: 'in_004',
      stripe_invoice_url: 'https://dashboard.stripe.com/invoices/in_004',
      type: 'Discovery',
      issued_to: 'Northstar Health',
      source: 'Stripe',
      files: [],
    },
  ],
};

const portalConfigs = {
  'project-bluegate-revops': {
    id: 'portal-bluegate-revops',
    name: 'Bluegate RevOps Portal',
    project: ['project-bluegate-revops'],
    client: ['client-bluegate'],
    portal_title: 'Bluegate RevOps Portal',
    portal_intro: 'Track the current build, check upcoming milestones, and use the request form when new needs come up.',
    contact_email: 'sixto.developer@gmail.com',
    show_tasks: true,
    show_meetings: true,
    show_invoices: true,
    show_deliverables: true,
    show_roadmap: true,
    show_documents: true,
    show_feedback: true,
    cta_label: 'Review Delivery Plan',
    cta_url: 'https://example.com/delivery-plan',
    support_contact: 'Erick Sixto',
    default_landing_tab: 'Overview',
    support_sla_text: 'Questions and standard requests are usually reviewed within 1 business day.',
    escalation_contact: 'sixto.developer@gmail.com',
    welcome_checklist_enabled: true,
    status: 'Active',
  },
  'project-bluegate-retainer': {
    id: 'portal-bluegate-retainer',
    name: 'Bluegate Support Portal',
    project: ['project-bluegate-retainer'],
    client: ['client-bluegate'],
    portal_title: 'Bluegate Support Portal',
    portal_intro: 'Use this workspace to keep up with support intake, milestones, and kickoff prep.',
    contact_email: 'sixto.developer@gmail.com',
    show_tasks: true,
    show_meetings: true,
    show_invoices: false,
    show_deliverables: true,
    show_roadmap: false,
    show_documents: true,
    show_feedback: true,
    cta_label: 'Submit Support Need',
    cta_url: 'https://example.com/support-intake',
    support_contact: 'Erick Sixto',
    default_landing_tab: 'Request',
    support_sla_text: 'Retainer requests are triaged during business hours and urgent blockers are prioritized first.',
    escalation_contact: 'sixto.developer@gmail.com',
    welcome_checklist_enabled: true,
    status: 'Draft',
  },
  'project-northstar-migration': {
    id: 'portal-northstar',
    name: 'Northstar Migration Portal',
    project: ['project-northstar-migration'],
    client: ['client-northstar'],
    portal_title: 'Northstar Migration Portal',
    portal_intro: 'Internal sample project for admin verification.',
    contact_email: 'sixto.developer@gmail.com',
    show_tasks: true,
    show_meetings: false,
    show_invoices: true,
    show_deliverables: true,
    show_roadmap: true,
    show_documents: false,
    show_feedback: false,
    cta_label: 'Open Workspace',
    cta_url: 'https://example.com/workspace',
    support_contact: 'Erick Sixto',
    default_landing_tab: 'Overview',
    support_sla_text: 'Internal sample portal for admin verification.',
    escalation_contact: 'sixto.developer@gmail.com',
    welcome_checklist_enabled: false,
    status: 'Active',
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getCurrentUser() {
  const rawUser = localStorage.getItem(MOCK_USER_KEY);
  const token = localStorage.getItem(MOCK_TOKEN_KEY);
  if (!rawUser || !token) return null;
  return JSON.parse(rawUser);
}

function setCurrentUser(user) {
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  localStorage.setItem(MOCK_TOKEN_KEY, `mock-token-${user.role}`);
}

function clearCurrentUser() {
  localStorage.removeItem(MOCK_USER_KEY);
  localStorage.removeItem(MOCK_TOKEN_KEY);
}

function getProjectById(projectId) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) {
    throw new Error('Project not found');
  }
  return clone(project);
}

function getAccessibleProjects(user) {
  if (!user) return [];
  if (user.role === 'admin') return clone(projects);
  return clone(projects.filter((project) => (user.project_ids || []).includes(project.id)));
}

function getVisibleRecords(records, user) {
  if (user.role === 'admin') return clone(records);
  return clone((records || []).filter((record) => record.client_visible !== false));
}

function isOpenTask(task) {
  return !['Done', "Won't Do"].includes(task.status);
}

function getMockUserForEmail(email) {
  const portalUser = portalUsers.find((user) => user.email === email);
  if (portalUser) {
    return {
      id: portalUser.id,
      email: portalUser.email,
      role: portalUser.role === 'Client' ? 'client' : 'admin',
      name: portalUser.name,
      client_notion_id: portalUser.client_notion_id,
      project_ids: portalUser.project_ids,
      default_project_id: portalUser.default_project_id,
      access_scope: portalUser.access_scope,
      portal_user_notion_id: portalUser.portal_user_notion_id,
      notion_role: portalUser.notion_role,
    };
  }

  throw new Error('No account found with this email address');
}

function getDashboard(projectId, user) {
  const project = getProjectById(projectId);
  const tasks = getVisibleRecords(tasksByProject[projectId] || [], user);
  const deliverables = getVisibleRecords(deliverablesByProject[projectId] || [], user);
  const milestones = getVisibleRecords(milestonesByProject[projectId] || [], user);
  const updates = getVisibleRecords(updatesByProject[projectId] || [], user).sort((a, b) => (b.date?.start || '').localeCompare(a.date?.start || ''));
  const meetings = getVisibleRecords(meetingsByProject[projectId] || [], user);
  const now = new Date().toISOString();
  const upcomingMeetings = meetings
    .filter((meeting) => meeting.date_time?.start && meeting.date_time.start >= now && !['Cancelled', 'Completed'].includes(meeting.status))
    .sort((a, b) => (a.date_time?.start || '').localeCompare(b.date_time?.start || ''))
    .slice(0, 3);
  const openTasks = tasks.filter(isOpenTask);
  const today = new Date().toISOString().slice(0, 10);
  const overdueTasks = openTasks.filter((task) => task.due_date?.start && task.due_date.start.slice(0, 10) < today);
  const nextDueTask = openTasks.find((task) => task.due_date?.start && task.due_date.start.slice(0, 10) >= today) || null;
  const nextMilestone = milestones.find((milestone) => milestone.status !== 'Completed') || null;

  return {
    project,
    recent_updates: updates.slice(0, 5),
    upcoming_meetings: upcomingMeetings,
    metrics: {
      tasks_completed: tasks.filter((task) => task.status === 'Done').length,
      tasks_total: tasks.length,
      deliverables_delivered: deliverables.filter((item) => ['Delivered', 'Accepted'].includes(item.status)).length,
      deliverables_total: deliverables.length,
      milestones_completed: milestones.filter((milestone) => milestone.status === 'Completed').length,
      milestones_total: milestones.length,
    },
    attention: {
      open_tasks: openTasks.length,
      blocked_tasks: openTasks.filter((task) => task.status === 'Blocked').length,
      overdue_tasks: overdueTasks.length,
      at_risk_milestones: milestones.filter((milestone) => milestone.status === 'At Risk').length,
      client_action_items: openTasks.filter((task) => task.customer_action_needed).length + milestones.filter((milestone) => milestone.customer_action_needed && milestone.status !== 'Completed').length,
    },
    highlights: {
      next_due_task: nextDueTask,
      next_meeting: upcomingMeetings[0] || null,
      latest_update: updates[0] || null,
      next_milestone: nextMilestone,
    },
  };
}

function getBillingSummary(invoices) {
  const totalBilled = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  const totalPaid = invoices
    .filter((invoice) => invoice.payment_status === 'Paid' || (invoice.paid && !invoice.payment_status))
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  return {
    total_billed: totalBilled,
    total_paid: totalPaid,
    outstanding: totalBilled - totalPaid,
  };
}

function requireUser() {
  const user = getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  return user;
}

function requireAdmin(user) {
  if (user.role !== 'admin') throw new Error('Admin access required');
}

function ensureProjectAccess(projectId, user) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) throw new Error('Project not found');
  if (user.role === 'admin') return clone(project);
  if (!(user.project_ids || []).includes(projectId)) throw new Error('Project not found');
  return clone(project);
}

function parseJsonBody(options = {}) {
  if (!options.body) return {};
  try {
    return JSON.parse(options.body);
  } catch {
    return {};
  }
}

function createResponse(data) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(clone(data)), 150);
  });
}

function createError(detail, status = 400) {
  const error = new Error(detail);
  error.status = status;
  return error;
}

function getRequestLog() {
  const raw = localStorage.getItem('sixto_mock_requests');
  return raw ? JSON.parse(raw) : [];
}

function saveRequestLog(entries) {
  localStorage.setItem('sixto_mock_requests', JSON.stringify(entries));
}

export const isMockApiEnabled = process.env.REACT_APP_USE_MOCK_API === 'true';

export async function mockApi(path, options = {}) {
  try {
    if (path === '/api/auth/me') {
      const user = getCurrentUser();
      if (!user) throw createError('Not authenticated', 401);
      return createResponse(user);
    }

    if (path === '/api/auth/request-magic-link' && options.method === 'POST') {
      const { email = '' } = parseJsonBody(options);
      const normalizedEmail = email.trim().toLowerCase();
      getMockUserForEmail(normalizedEmail);
      return createResponse({
        success: true,
        message: 'Magic link code generated. Check your email.',
        mock_code: normalizedEmail === ADMIN_EMAIL ? 'ADMIN1' : 'CLIENT',
      });
    }

    if (path === '/api/auth/verify-magic-link' && options.method === 'POST') {
      const { email = '', code = '' } = parseJsonBody(options);
      const normalizedEmail = email.trim().toLowerCase();
      const user = getMockUserForEmail(normalizedEmail);
      const expectedCode = normalizedEmail === ADMIN_EMAIL ? 'ADMIN1' : 'CLIENT';
      if (code.trim().toUpperCase() !== expectedCode) {
        throw createError('Invalid or expired code', 400);
      }
      setCurrentUser(user);
      return createResponse({
        success: true,
        user,
        token: `mock-token-${user.role}`,
      });
    }

    if (path === '/api/auth/logout' && options.method === 'POST') {
      clearCurrentUser();
      return createResponse({ success: true });
    }

    const user = requireUser();

    if (path === '/api/portal/projects') {
      const scopedProjects = getAccessibleProjects(user)
        .map(({ estimated_amount, client_name, ...project }) => project)
        .sort((a, b) => {
          if (user.default_project_id) {
            const aIsDefault = a.id === user.default_project_id;
            const bIsDefault = b.id === user.default_project_id;
            if (aIsDefault !== bIsDefault) return aIsDefault ? -1 : 1;
          }
          return (a.name || '').localeCompare(b.name || '');
        });
      return createResponse(scopedProjects);
    }

    const projectMatch = path.match(/^\/api\/portal\/project\/([^/]+)\/([^/]+)$/);
    if (projectMatch) {
      const [, projectId, section] = projectMatch;
      ensureProjectAccess(projectId, user);

      if (section === 'dashboard') return createResponse(getDashboard(projectId, user));
      if (section === 'config') return createResponse(portalConfigs[projectId] || null);
      if (section === 'tasks') return createResponse(getVisibleRecords(tasksByProject[projectId] || [], user));
      if (section === 'deliverables') return createResponse(getVisibleRecords(deliverablesByProject[projectId] || [], user));
      if (section === 'roadmap') return createResponse(getVisibleRecords(milestonesByProject[projectId] || [], user));
      if (section === 'documents') {
        const documents = (portalDocumentsByProject[projectId] || []).filter((document) => {
          if (user.role === 'admin') return true;
          return document.client_visible !== false && document.status === 'Published';
        });
        return createResponse({ documents });
      }
      if (section === 'meetings') return createResponse(getVisibleRecords(meetingsByProject[projectId] || [], user));
      if (section === 'updates') return createResponse(getVisibleRecords(updatesByProject[projectId] || [], user));
      if (section === 'billing') {
        if (user.role !== 'admin') throw createError('Billing is only available in the admin dashboard', 403);
        const invoices = clone(invoicesByProject[projectId] || []);
        return createResponse({
          invoices,
          summary: getBillingSummary(invoices),
        });
      }
      if (section === 'requests' && options.method === 'POST') {
        const entries = getRequestLog();
        const body = parseJsonBody(options);
        entries.push({
          id: `request-${entries.length + 1}`,
          project_id: projectId,
          ...body,
        });
        saveRequestLog(entries);
        return createResponse({ success: true, message: 'Request submitted successfully' });
      }
    }

    if (path === '/api/admin/projects') {
      requireAdmin(user);
      return createResponse(projects);
    }

    if (path === '/api/admin/clients') {
      requireAdmin(user);
      return createResponse(clients);
    }

    if (path === '/api/admin/billing') {
      requireAdmin(user);
      const invoices = clone(Object.values(invoicesByProject).flat());
      const outstanding = invoices.filter((invoice) => ['Sent', 'Overdue'].includes(invoice.payment_status));
      const recentPaid = invoices.filter((invoice) => invoice.payment_status === 'Paid');
      const summary = {
        total_revenue: invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0),
        total_paid: recentPaid.reduce((sum, invoice) => sum + (invoice.amount || 0), 0),
        outstanding: outstanding.reduce((sum, invoice) => sum + (invoice.amount || 0), 0),
      };
      return createResponse({
        invoices,
        outstanding,
        recent_paid: recentPaid,
        summary,
      });
    }

    if (path === '/api/admin/portals') {
      requireAdmin(user);
      return createResponse(Object.values(portalConfigs));
    }

    if (path === '/api/admin/access') {
      requireAdmin(user);
      return createResponse([
        { email: ADMIN_EMAIL, role: 'admin', name: 'Primary Admin', protected: true },
        { email: 'ops@bluegateinc.com', role: 'admin', name: 'Ops Delegate' },
      ]);
    }

    throw createError(`Mock route not implemented for ${path}`, 404);
  } catch (error) {
    if (error.status) throw error;
    throw createError(error.message || 'Something went wrong', 400);
  }
}
