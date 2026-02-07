export type Role = 'HR' | 'MANAGER' | 'EMPLOYEE' | 'GUEST';

export type OnboardingStatus = 'ON_TRACK' | 'STUCK' | 'COMPLETED' | 'NOT_STARTED';

export type TaskCategory = 'Pre-boarding' | 'Orientation' | 'Role Specific';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate: string; // ISO date string
  category: TaskCategory;
  link?: string;
  type?: 'TECH' | 'GENERAL';
}

export interface Employee extends User {
  role: 'EMPLOYEE';
  managerId: string;
  department: string;
  roleType: 'TECH' | 'NON_TECH';
  startDate: string;
  status: OnboardingStatus;
  progress: number; // 0-100
  tasks: Task[];
  tokenExpiry: string;
  syncStatus: {
    emailCreated: boolean;
    slackInvited: boolean;
    hrisRecord: boolean;
    equipmentOrdered: boolean;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export interface Manager extends User {
  role: 'MANAGER';
  department: string;
}

export interface HR extends User {
  role: 'HR';
}
