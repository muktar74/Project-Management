import { User, Project, Log, UserRole, ProjectStatus, Task, TaskStatus, Comment, Notification, TaskPriority } from './types';

export const USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Aisha Ahmed', 
    email: 'aisha.ahmed@zamzambank.com', 
    avatar: 'https://i.pravatar.cc/150?u=aisha', 
    role: UserRole.Manager,
    settings: { notifications: { logReminder: { email: true, telegram: false, time: '17:00' } } }
  },
  { 
    id: 'u2', 
    name: 'Bilal Khan', 
    email: 'bilal.khan@zamzambank.com', 
    avatar: 'https://i.pravatar.cc/150?u=bilal', 
    role: UserRole.Member,
    settings: { notifications: { logReminder: { email: true, telegram: true, telegramUsername: '@bilal_k', time: '16:30' } } }
  },
  { 
    id: 'u3', 
    name: 'Fatima Ali', 
    email: 'fatima.ali@zamzambank.com', 
    avatar: 'https://i.pravatar.cc/150?u=fatima', 
    role: UserRole.Member,
    settings: { notifications: { logReminder: { email: true, telegram: false, time: '17:00' } } }
  },
  { 
    id: 'u4', 
    name: 'Omar Hassan', 
    email: 'omar.hassan@zamzambank.com', 
    avatar: 'https://i.pravatar.cc/150?u=omar', 
    role: UserRole.Member,
    settings: { notifications: { logReminder: { email: false, telegram: true, telegramUsername: '@omar_h', time: '18:00' } } }
  },
  { 
    id: 'u5', 
    name: 'Layla Ibrahim', 
    email: 'layla.ibrahim@zamzambank.com', 
    avatar: 'https://i.pravatar.cc/150?u=layla', 
    role: UserRole.Member,
    settings: { notifications: { logReminder: { email: true, telegram: false, time: '17:00' } } }
  },
  { 
    id: 'u6', 
    name: 'Samira Yusuf', 
    email: 'samira.yusuf@zamzambank.com', 
    avatar: 'https://i.pravatar.cc/150?u=samira', 
    role: UserRole.Executive,
    settings: { notifications: { logReminder: { email: false, telegram: false, time: '17:00' } } }
  },
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
    { id: 'l1', projectId: 'p1', userId: 'u2', date: '2024-07-28', yesterdaysTasks: 'Developed the funds transfer API endpoint.', todaysPlan: 'Integrate API with the mobile app frontend.', challenges: 'Waiting for final security review from the compliance team.', collaboratorIds: ['u3'] },
    { id: 'l2', projectId: 'p1', userId: 'u3', date: '2024-07-28', yesterdaysTasks: 'Finalized UI mockups for the account summary page.', todaysPlan: 'Create reusable UI components based on mockups.', challenges: '' },
    { id: 'l3', projectId: 'p2', userId: 'u4', date: '2024-07-28', yesterdaysTasks: 'Analyzed data migration scripts for customer accounts.', todaysPlan: 'Begin optimizing the migration scripts.', challenges: 'Source database performance is slower than expected.', collaboratorIds: ['u5'] },
    { id: 'l4', projectId: 'p2', userId: 'u5', date: '2024-07-28', yesterdaysTasks: 'Configured the test environment for the new CBS.', todaysPlan: 'Run initial configuration tests and benchmarks.', challenges: '', collaboratorIds: ['u4'] },
    { id: 'l5', projectId: 'p3', userId: 'u2', date: '2024-07-28', yesterdaysTasks: 'Integrated the third-party ID verification SDK.', todaysPlan: 'Test the SDK with various ID types.', challenges: '' },
    { id: 'l6', projectId: 'p1', userId: 'u2', date: '2024-07-29', yesterdaysTasks: 'Refactored authentication module based on code review feedback.', todaysPlan: 'Deploy updated module to staging for QA.', challenges: '', collaboratorIds: ['u3'] },
    { id: 'l7', projectId: 'p1', userId: 'u3', date: '2024-07-29', yesterdaysTasks: 'Conducted usability testing session for the new mobile app prototype.', todaysPlan: 'Synthesize feedback and create a report of findings.', challenges: 'Recruitment of test participants is slightly behind schedule.' },
    { id: 'l8', projectId: 'p2', userId: 'u4', date: '2024-07-29', yesterdaysTasks: 'Optimized data migration scripts, improving performance by 15%.', todaysPlan: 'Prepare for a full test migration run over the weekend.', challenges: '', collaboratorIds: ['u5'] },
];

export const TASKS: Task[] = [
    // Project p1
    { id: 't1', title: 'Design account summary UI', projectId: 'p1', assigneeId: 'u3', status: TaskStatus.Done, dueDate: '2024-08-05', order: 10, dependencies: [], priority: TaskPriority.High },
    { id: 't2', title: 'Develop funds transfer API', projectId: 'p1', assigneeId: 'u2', status: TaskStatus.Review, dueDate: '2024-08-10', order: 10, dependencies: ['t1'], reminder: '1_day_before', priority: TaskPriority.High },
    { id: 't3', title: 'Set up staging environment', projectId: 'p1', assigneeId: 'u2', status: TaskStatus.InProgress, dueDate: '2024-08-12', order: 10, dependencies: [], priority: TaskPriority.Medium },
    { id: 't4', title: 'User acceptance testing', projectId: 'p1', assigneeId: 'u3', status: TaskStatus.ToDo, dueDate: '2024-08-20', order: 10, dependencies: ['t2', 't3'], priority: TaskPriority.Medium },
    { id: 't13', title: 'Deploy to production', projectId: 'p1', assigneeId: 'u1', status: TaskStatus.ToDo, dueDate: '2024-09-01', order: 20, dependencies: ['t4'], priority: TaskPriority.Low },

    // Project p2
    { id: 't5', title: 'Analyze data migration scripts', projectId: 'p2', assigneeId: 'u4', status: TaskStatus.InProgress, dueDate: '2024-08-15', order: 20, dependencies: [], reminder: '2_days_before', priority: TaskPriority.High },
    { id: 't6', title: 'Configure test environment for CBS', projectId: 'p2', assigneeId: 'u5', status: TaskStatus.InProgress, dueDate: '2024-08-18', order: 30, dependencies: ['t7'], priority: TaskPriority.Medium },
    { id: 't7', title: 'Procure new server hardware', projectId: 'p2', assigneeId: 'u1', status: TaskStatus.Done, dueDate: '2024-07-30', order: 20, dependencies: [], priority: TaskPriority.Medium },
    { id: 't8', title: 'Initial data migration test run', projectId: 'p2', assigneeId: 'u4', status: TaskStatus.ToDo, dueDate: '2024-08-25', order: 30, dependencies: ['t5', 't6'], priority: TaskPriority.Low },

    // Project p3
    { id: 't9', title: 'Integrate third-party ID verification SDK', projectId: 'p3', assigneeId: 'u2', status: TaskStatus.Done, dueDate: '2024-08-01', order: 30, dependencies: [], priority: TaskPriority.Medium },
    { id: 't10', title: 'Build admin verification portal', projectId: 'p3', assigneeId: 'u4', status: TaskStatus.InProgress, dueDate: '2024-08-22', order: 40, dependencies: ['t9'], priority: TaskPriority.Medium },
    { id: 't11', title: 'Draft compliance report', projectId: 'p3', assigneeId: 'u1', status: TaskStatus.ToDo, dueDate: '2024-08-28', order: 40, dependencies: ['t10'], priority: TaskPriority.Low },
    { id: 't12', title: 'Perform security audit', projectId: 'p3', assigneeId: 'u2', status: TaskStatus.ToDo, dueDate: '2024-09-05', order: 50, dependencies: ['t11'], priority: TaskPriority.High },
];

export const COMMENTS: Comment[] = [
  { id: 'c1', taskId: 't2', userId: 'u1', text: "Looks good, just need the final security review before we can move this to 'Done'.", timestamp: '2024-07-29T10:00:00Z' },
  { id: 'c2', taskId: 't2', userId: 'u2', text: "Compliance team has been notified. They said they'll get back to us by EOD tomorrow.", timestamp: '2024-07-29T11:30:00Z' },
  { id: 'c3', taskId: 't3', userId: 'u1', text: "Any blockers on setting this up?", timestamp: '2024-07-28T14:00:00Z' },
  { id: 'c4', taskId: 't5', userId: 'u4', text: "The performance is still a bit slow. I'm working on optimizing the queries.", timestamp: '2024-07-29T09:15:00Z' },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', recipientId: 'u2', senderId: 'u1', message: 'Please remember to update the JIRA tickets for the Digital Banking project.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isRead: false },
  { id: 'n2', recipientId: 'u3', senderId: 'u1', message: 'Great work on the UI mockups for the account summary page!', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), isRead: true },
  { id: 'n3', recipientId: 'u4', senderId: 'u1', message: 'The Core Banking migration is a top priority. Let\'s sync up tomorrow at 10 AM.', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), isRead: true },
];