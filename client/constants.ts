import { Employee, HR, Manager, Task } from './types';

// Common tasks for everyone
const COMMON_TASKS: Task[] = [
  {
    id: 'c1',
    title: 'Laptop & Equipment Request',
    description: 'Select your preferred hardware configuration for delivery.',
    isCompleted: true,
    dueDate: '2023-10-20',
    category: 'Pre-boarding',
  },
  {
    id: 'c2',
    title: 'Background Check Consent',
    description: 'Sign the consent form to initiate background verification.',
    isCompleted: true,
    dueDate: '2023-10-21',
    category: 'Pre-boarding',
  },
  {
    id: 'c3',
    title: 'Company Mission & Culture',
    description: 'Attend the welcome workshop with the founders.',
    isCompleted: false,
    dueDate: '2023-10-24',
    category: 'Orientation',
  },
  {
    id: 'c4',
    title: 'HR Policies & Benefits',
    description: 'Review the handbook and enroll in health insurance.',
    isCompleted: false,
    dueDate: '2023-10-25',
    category: 'Orientation',
  },
  {
    id: 'c5',
    title: 'IT Security Awareness',
    description: 'Complete the mandatory cybersecurity training module.',
    isCompleted: false,
    dueDate: '2023-10-26',
    category: 'Orientation',
  },
];

// Tech-specific tasks
const TECH_TASKS: Task[] = [
  {
    id: 't1',
    title: 'GitHub Access & 2FA',
    description: 'Accept invitation to the organization and set up 2FA.',
    isCompleted: false,
    dueDate: '2023-10-27',
    category: 'Role Specific',
    type: 'TECH',
  },
  {
    id: 't2',
    title: 'Local Dev Environment Setup',
    description: 'Install Docker, Node.js, and clone the main repository.',
    isCompleted: false,
    dueDate: '2023-10-28',
    category: 'Role Specific',
    type: 'TECH',
  },
  {
    id: 't3',
    title: 'First Code Commit',
    description: 'Push a minor change or documentation update to verify access.',
    isCompleted: false,
    dueDate: '2023-11-01',
    category: 'Role Specific',
    type: 'TECH',
  },
];

// Non-Tech specific tasks (e.g., Sales/Marketing)
const NON_TECH_TASKS: Task[] = [
  {
    id: 'nt1',
    title: 'CRM Access (Salesforce)',
    description: 'Log in to Salesforce and complete your profile.',
    isCompleted: false,
    dueDate: '2023-10-27',
    category: 'Role Specific',
    type: 'GENERAL',
  },
  {
    id: 'nt2',
    title: 'Product Demo Certification',
    description: 'Watch the core product demo recording and pass the quiz.',
    isCompleted: false,
    dueDate: '2023-10-29',
    category: 'Role Specific',
    type: 'GENERAL',
  },
  {
    id: 'nt3',
    title: 'Shadow Sales Call',
    description: 'Join a senior AE on a client call and take notes.',
    isCompleted: false,
    dueDate: '2023-11-02',
    category: 'Role Specific',
    type: 'GENERAL',
  },
];

export const MOCK_HR: HR = {
  id: 'hr1',
  name: 'HR Admin',
  email: 'hr@topboardai.com',
  role: 'HR',
  avatarUrl: '',
};

export const MOCK_MANAGER: Manager = {
  id: 'm1',
  name: 'Manager',
  email: 'manager@topboardai.com',
  role: 'MANAGER',
  department: 'Engineering',
  avatarUrl: '',
};

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'e1',
    name: 'Neo Thomas',
    email: 'neo@topboardai.com',
    role: 'EMPLOYEE',
    managerId: 'm1',
    department: 'Engineering',
    roleType: 'TECH',
    startDate: '2023-10-24',
    status: 'ON_TRACK',
    progress: 35,
    avatarUrl: 'https://picsum.photos/200/200?random=3',
    tokenExpiry: '2023-11-01T10:00:00Z',
    tasks: [...COMMON_TASKS, ...TECH_TASKS],
    syncStatus: {
      emailCreated: true,
      slackInvited: true,
      hrisRecord: true,
      equipmentOrdered: true
    }
  },
  {
    id: 'e2',
    name: 'Trinity Moss',
    email: 'trinity@topboardai.com',
    role: 'EMPLOYEE',
    managerId: 'm1',
    department: 'Sales',
    roleType: 'NON_TECH',
    startDate: '2023-10-20',
    status: 'COMPLETED',
    progress: 100,
    avatarUrl: 'https://picsum.photos/200/200?random=4',
    tokenExpiry: '2023-10-30T10:00:00Z',
    tasks: [...COMMON_TASKS, ...NON_TECH_TASKS].map(t => ({...t, isCompleted: true})),
    syncStatus: {
      emailCreated: true,
      slackInvited: true,
      hrisRecord: true,
      equipmentOrdered: true
    }
  },
  {
    id: 'e3',
    name: 'Morpheus Lawrence',
    email: 'morpheus@topboardai.com',
    role: 'EMPLOYEE',
    managerId: 'm1',
    department: 'Marketing',
    roleType: 'NON_TECH',
    startDate: '2023-10-22',
    status: 'STUCK',
    progress: 15,
    avatarUrl: 'https://picsum.photos/200/200?random=5',
    tokenExpiry: '2023-10-29T10:00:00Z',
    tasks: [...COMMON_TASKS, ...NON_TECH_TASKS].map(t => ({...t, isCompleted: false})),
    syncStatus: {
      emailCreated: true,
      slackInvited: false,
      hrisRecord: true,
      equipmentOrdered: true
    }
  },
];

export const TOPBOARDAI_KNOWLEDGE_BASE = [
  { keywords: ['wifi', 'internet', 'password'], response: "The office WiFi network is 'TopboardAI_Secure'. The password is 'WelcomeToTopboard2024!'." },
  { keywords: ['salary', 'pay', 'payroll'], response: "Salaries are processed on the 25th of every month. Payslips are available in the HR portal." },
  { keywords: ['leave', 'vacation', 'holiday'], response: "You are entitled to 20 days of paid leave per year. Requests should be submitted via the HR portal." },
  { keywords: ['manager', 'contact'], response: "Your manager's contact details are listed in your dashboard header." },
  { keywords: ['github', 'repo', 'access'], response: "For GitHub access, please complete the 'IT Security Awareness' task first, then an invite will be sent automatically." },
];

export { COMMON_TASKS, TECH_TASKS, NON_TECH_TASKS };
