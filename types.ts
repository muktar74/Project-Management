export enum UserRole {
  Manager = 'Manager',
  Member = 'Team Member',
  Executive = 'Executive',
}

export interface UserSettings {
  notifications: {
    logReminder: {
      email: boolean;
      telegram: boolean;
      telegramUsername?: string;
      time: string; // e.g., "17:00"
    };
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  settings: UserSettings;
}

export enum ProjectStatus {
  OnTrack = 'On Track',
  AtRisk = 'At Risk',
  OffTrack = 'Off Track',
  OnHold = 'On Hold',
  Completed = 'Completed',
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  progress: number;
  team: string[]; // Array of User IDs
}

export interface Log {
  id:string;
  projectId: string;
  userId: string;
  date: string;
  hours: number;
  task: string;
  blockers?: string;
}

export enum TaskStatus {
  ToDo = 'ToDo',
  InProgress = 'InProgress',
  Review = 'Review',
  Done = 'Done',
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    projectId: string;
    assigneeId: string;
    status: TaskStatus;
    dueDate: string;
    order: number;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  timestamp: string; // ISO string
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  message: string;
  timestamp: string; // ISO string
  isRead: boolean;
}