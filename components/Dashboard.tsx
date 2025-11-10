import React, { useMemo } from 'react';
import { Project, Log, User, ProjectStatus, Task, TaskStatus, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ProjectCard from './ProjectCard';
import { EnvelopeIcon } from './icons';

type DashboardProps = {
  projects: Project[];
  logs: Log[];
  tasks: Task[];
  users: User[];
  currentUser: User;
  onProjectSelect: (id: string) => void;
  onOpenEditModal: (project: Project) => void;
  membersForDailyStatus: User[];
  onSendReminder: (recipientId: string) => void;
};

const StatCard = ({ title, value, subtext }: { title: string, value: string | number, subtext: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between animate-slide-in-up">
        <div>
            <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
            <p className="text-3xl font-bold text-neutral-800 mt-1">{value}</p>
        </div>
        <p className="text-xs text-neutral-400 mt-4">{subtext}</p>
    </div>
);

const DailyLogStatus: React.FC<{
    logs: Log[],
    members: User[],
    onSendReminder: (recipientId: string) => void,
}> = ({ logs, members, onSendReminder }) => {
    const todayStr = new Date().toISOString().split('T')[0];

    const submittedUserIds = new Set(
        logs.filter(log => log.date === todayStr).map(log => log.userId)
    );

    const submitted = members.filter(m => submittedUserIds.has(m.id));
    const pending = members.filter(m => !submittedUserIds.has(m.id));

    return (
        <div className="bg-white p-6 rounded-xl shadow-md animate-slide-in-up">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Daily Log Status (Today)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold text-green-600 mb-2">Submitted ({submitted.length})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {submitted.map(user => (
                            <div key={user.id} className="flex items-center">
                                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full mr-2"/>
                                <span className="text-sm text-neutral-700">{user.name}</span>
                            </div>
                        ))}
                        {submitted.length === 0 && <p className="text-xs text-neutral-400">No submissions yet.</p>}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-yellow-600 mb-2">Pending ({pending.length})</h4>
                     <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {pending.map(user => (
                            <div key={user.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full mr-2"/>
                                    <span className="text-sm text-neutral-700">{user.name}</span>
                                </div>
                                <button 
                                    onClick={() => onSendReminder(user.id)}
                                    title={`Send reminder to ${user.name}`}
                                    className="p-1.5 rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-brand-primary transition-colors"
                                >
                                    <EnvelopeIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {pending.length === 0 && <p className="text-xs text-neutral-400">Everyone has submitted!</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ projects, logs, tasks, users, currentUser, onProjectSelect, onOpenEditModal, membersForDailyStatus, onSendReminder }) => {
    const totalProjects = projects.length;
    const onTrackProjects = projects.filter(p => p.status === ProjectStatus.OnTrack).length;
    const atRiskProjects = projects.filter(p => p.status === ProjectStatus.AtRisk).length;
    
    const { overdueTasks, dueTodayTasks } = useMemo(() => {
        const myTasks = tasks.filter(t => t.assigneeId === currentUser.id && t.status !== TaskStatus.Done);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = new Date().toISOString().split('T')[0];

        const overdue = myTasks.filter(t => new Date(t.dueDate) < today);
        const dueToday = myTasks.filter(t => t.dueDate === todayStr);

        return { overdueTasks: overdue.length, dueTodayTasks: dueToday.length };
    }, [tasks, currentUser.id]);

    const userProjects = projects.filter(p => p.team.includes(currentUser.id));
    const upcomingTasks = tasks
        .filter(t => t.assigneeId === currentUser.id && t.status !== TaskStatus.Done)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);
        
    const projectHoursData = useMemo(() => {
        const projectLogHours = projects.map(project => {
            const logCount = logs.filter(log => log.projectId === project.id).length;
            return { name: project.name, "logs": logCount };
        });
        return projectLogHours;
    }, [projects, logs]);


    const getProjectById = (id: string) => projects.find(p => p.id === id);

    const isManagerOrExec = currentUser.role === UserRole.Manager || currentUser.role === UserRole.Executive;

    return (
        <div className="p-4 sm:p-8 space-y-8 animate-fade-in">
            <header>
              <h2 className="text-3xl font-bold text-neutral-800">Dashboard Overview</h2>
              <p className="text-neutral-500 mt-1">Welcome back, {currentUser.name.split(' ')[0]}! Here's a look at what's happening.</p>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="My Focus" value={`${overdueTasks} / ${dueTodayTasks}`} subtext="Overdue / Due Today" />
                <StatCard title="Total Projects" value={totalProjects} subtext="All active and completed" />
                <StatCard title="On Track" value={onTrackProjects} subtext="Proceeding as planned" />
                <StatCard title="At Risk" value={atRiskProjects} subtext="Require attention" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md animate-slide-in-up">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">Project Log Activity</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={projectHoursData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip wrapperClassName="rounded-md shadow-lg bg-white" />
                            <Legend />
                            <Bar dataKey="logs" fill="#00D98B" name="Number of Logs" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md animate-slide-in-up">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">My Upcoming Tasks</h3>
                    <ul className="space-y-4">
                        {upcomingTasks.map(task => {
                            const project = getProjectById(task.projectId);
                            return (
                                <li key={task.id} className="flex items-start space-x-3">
                                    <div className={`mt-1.5 w-2 h-2 rounded-full ${new Date(task.dueDate) < new Date() ? 'bg-red-500' : 'bg-brand-accent'}`}></div>
                                    <div>
                                        <p className="text-sm text-neutral-700 font-semibold">{task.title}</p>
                                        <p className="text-xs text-neutral-500">Project: <span className="font-medium text-brand-primary">{project?.name}</span></p>
                                        {/* Fix: Corrected typo from toLocaleDate's'ring to toLocaleDateString */}
                                        <p className="text-xs text-neutral-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                    </div>
                                </li>
                            );
                        })}
                         {upcomingTasks.length === 0 && <p className="text-sm text-neutral-500">You're all caught up!</p>}
                    </ul>
                </div>
            </div>
            
            {isManagerOrExec && membersForDailyStatus.length > 0 && (
                <DailyLogStatus logs={logs} members={membersForDailyStatus} onSendReminder={onSendReminder} />
            )}
            
            <div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-4">Your Projects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProjects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    users={users} 
                    tasks={tasks} 
                    currentUser={currentUser}
                    onProjectSelect={onProjectSelect}
                    onEdit={onOpenEditModal}
                  />
                ))}
              </div>
            </div>
        </div>
    );
};

export default Dashboard;
