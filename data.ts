import { User, Project, Log, UserRole, ProjectStatus, Task, TaskStatus, Comment } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'Aisha Ahmed', email: 'aisha.ahmed@zamzambank.com', avatar: 'https://i.pravatar.cc/150?u=aisha', role: UserRole.Manager },
  { id: 'u2', name: 'Bilal Khan', email: 'bilal.khan@zamzambank.com', avatar: 'https://i.pravatar.cc/150?u=bilal', role: UserRole.Member },
  { id: 'u3', name: 'Fatima Ali', email: 'fatima.ali@zamzambank.com', avatar: 'https://i.pravatar.cc/150?u=fatima', role: UserRole.Member },
  { id: 'u4', name: 'Omar Hassan', email: 'omar.hassan@zamzambank.com', avatar: 'https://i.pravatar.cc/150?u=omar', role: UserRole.Member },
  { id: 'u5', name: 'Layla Ibrahim', email: 'layla.ibrahim@zamzambank.com', avatar: 'https://i.pravatar.cc/150?u=layla', role: UserRole.Member },
  { id: 'u6', name: 'Samira Yusuf', email: 'samira.yusuf@zamzambank.com', avatar: 'https://i.pravatar.cc/150?u=samira', role: UserRole.Executive },
];

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Digital Banking Platform',
    description: 'Launch of the new online and mobile banking platform for retail customers.',
    startDate: '2024-01-15',
    endDate: '2024-12-20',
    status: ProjectStatus.OnTrack,
    progress: 75,
    team: ['u1', 'u2', 'u3'],
  },
  {
    id: 'p2',
    name: 'Core Banking System Upgrade',
    description: 'Migration to a new-generation core banking system to improve efficiency and scalability.',
    startDate: '2024-03-01',
    endDate: '2025-06-30',
    status: ProjectStatus.AtRisk,
    progress: 40,
    team: ['u1', 'u4', 'u5'],
  },
  {
    id: 'p3',
    name: 'Customer KYC Automation',
    description: 'Implementing an AI-powered solution to automate the Know Your Customer (KYC) process.',
    startDate: '2024-05-10',
    endDate: '2024-11-30',
    status: ProjectStatus.OnTrack,
    progress: 25,
    team: ['u2', 'u4'],
  },
   {
    id: 'p4',
    name: 'Branch Network Modernization',
    description: 'Renovating and upgrading technology in 20 key branches nationwide.',
    startDate: '2023-11-01',
    endDate: '2024-10-15',
    status: ProjectStatus.Completed,
    progress: 100,
    team: ['u3', 'u5'],
  },
];

export const LOGS: Log[] = [
    { id: 'l1', projectId: 'p1', userId: 'u2', date: '2024-07-28', hours: 7, task: 'Developed the funds transfer API endpoint.', blockers: 'Waiting for final security review from the compliance team.' },
    { id: 'l2', projectId: 'p1', userId: 'u3', date: '2024-07-28', hours: 8, task: 'Finalized UI mockups for the account summary page.', blockers: '' },
    { id: 'l3', projectId: 'p2', userId: 'u4', date: '2024-07-28', hours: 6, task: 'Analyzed data migration scripts for customer accounts.', blockers: 'Source database performance is slower than expected.' },
    { id: 'l4', projectId: 'p2', userId: 'u5', date: '2024-07-28', hours: 7.5, task: 'Configured the test environment for the new CBS.', blockers: '' },
    { id: 'l5', projectId: 'p3', userId: 'u2', date: '2024-07-28', hours: 8, task: 'Integrated the third-party ID verification SDK.', blockers: '' },
    { id: 'l6', projectId: 'p1', userId: 'u2', date: '2024-07-29', hours: 8, task: 'Refactored authentication module based on code review feedback.', blockers: '' },
    { id: 'l7', projectId: 'p1', userId: 'u3', date: '2024-07-29', hours: 6, task: 'Conducted usability testing session for the new mobile app prototype.', blockers: 'Recruitment of test participants is slightly behind schedule.' },
    { id: 'l8', projectId: 'p2', userId: 'u4', date: '2024-07-29', hours: 8, task: 'Optimized data migration scripts, improving performance by 15%.', blockers: '' },
];

export const TASKS: Task[] = [
    // Project p1
    { id: 't1', title: 'Design account summary UI', projectId: 'p1', assigneeId: 'u3', status: TaskStatus.Done, dueDate: '2024-08-05', order: 10 },
    { id: 't2', title: 'Develop funds transfer API', projectId: 'p1', assigneeId: 'u2', status: TaskStatus.Review, dueDate: '2024-08-10', order: 10 },
    { id: 't3', title: 'Set up staging environment', projectId: 'p1', assigneeId: 'u2', status: TaskStatus.InProgress, dueDate: '2024-08-12', order: 10 },
    { id: 't4', title: 'User acceptance testing', projectId: 'p1', assigneeId: 'u3', status: TaskStatus.ToDo, dueDate: '2024-08-20', order: 10 },
    { id: 't13', title: 'Deploy to production', projectId: 'p1', assigneeId: 'u1', status: TaskStatus.ToDo, dueDate: '2024-09-01', order: 20 },

    // Project p2
    { id: 't5', title: 'Analyze data migration scripts', projectId: 'p2', assigneeId: 'u4', status: TaskStatus.InProgress, dueDate: '2024-08-15', order: 20 },
    { id: 't6', title: 'Configure test environment for CBS', projectId: 'p2', assigneeId: 'u5', status: TaskStatus.InProgress, dueDate: '2024-08-18', order: 30 },
    { id: 't7', title: 'Procure new server hardware', projectId: 'p2', assigneeId: 'u1', status: TaskStatus.Done, dueDate: '2024-07-30', order: 20 },
    { id: 't8', title: 'Initial data migration test run', projectId: 'p2', assigneeId: 'u4', status: TaskStatus.ToDo, dueDate: '2024-08-25', order: 30 },

    // Project p3
    { id: 't9', title: 'Integrate third-party ID verification SDK', projectId: 'p3', assigneeId: 'u2', status: TaskStatus.Done, dueDate: '2024-08-01', order: 30 },
    { id: 't10', title: 'Build admin verification portal', projectId: 'p3', assigneeId: 'u4', status: TaskStatus.InProgress, dueDate: '2024-08-22', order: 40 },
    { id: 't11', title: 'Draft compliance report', projectId: 'p3', assigneeId: 'u1', status: TaskStatus.ToDo, dueDate: '2024-08-28', order: 40 },
    { id: 't12', title: 'Perform security audit', projectId: 'p3', assigneeId: 'u2', status: TaskStatus.ToDo, dueDate: '2024-09-05', order: 50 },
];

export const COMMENTS: Comment[] = [
  { id: 'c1', taskId: 't2', userId: 'u1', text: "Looks good, just need the final security review before we can move this to 'Done'.", timestamp: '2024-07-29T10:00:00Z' },
  { id: 'c2', taskId: 't2', userId: 'u2', text: "Compliance team has been notified. They said they'll get back to us by EOD tomorrow.", timestamp: '2024-07-29T11:30:00Z' },
  { id: 'c3', taskId: 't3', userId: 'u1', text: "Any blockers on setting this up?", timestamp: '2024-07-28T14:00:00Z' },
  { id: 'c4', taskId: 't5', userId: 'u4', text: "The performance is still a bit slow. I'm working on optimizing the queries.", timestamp: '2024-07-29T09:15:00Z' },
];