import React from 'react';
import { Project, Log, User, ProjectStatus, Task, TaskStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ProjectCard from './ProjectCard';

type DashboardProps = {
  projects: Project[];
  logs: Log[];
  tasks: Task[];
  users: User[];
  currentUser: User;
  onProjectSelect: (id: string) => void;
  onOpenEditModal: (project: Project) => void;
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

const Dashboard: React.FC<DashboardProps> = ({ projects, logs, tasks, users, currentUser, onProjectSelect, onOpenEditModal }) => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === ProjectStatus.Completed).length;
    const onTrackProjects = projects.filter(p => p.status === ProjectStatus.OnTrack).length;
    const atRiskProjects = projects.filter(p => p.status === ProjectStatus.AtRisk).length;
    
    const userProjects = projects.filter(p => p.team.includes(currentUser.id));
    const upcomingTasks = tasks
        .filter(t => t.assigneeId === currentUser.id && t.status !== TaskStatus.Done)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);
        
    const projectHoursData = projects.map(project => {
        const projectLogs = logs.filter(log => log.projectId === project.id);
        const totalHours = projectLogs.reduce((acc, log) => acc + log.hours, 0);
        return { name: project.name, hours: totalHours };
    });

    const getProjectById = (id: string) => projects.find(p => p.id === id);

    return (
        <div className="p-4 sm:p-8 space-y-8 animate-fade-in">
            <header>
              <h2 className="text-3xl font-bold text-neutral-800">Dashboard Overview</h2>
              <p className="text-neutral-500 mt-1">Welcome back, {currentUser.name.split(' ')[0]}! Here's a look at what's happening.</p>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Projects" value={totalProjects} subtext="All active and completed" />
                <StatCard title="Completed" value={completedProjects} subtext="Successfully delivered" />
                <StatCard title="On Track" value={onTrackProjects} subtext="Proceeding as planned" />
                <StatCard title="At Risk" value={atRiskProjects} subtext="Require attention" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md animate-slide-in-up">
                    <h3 className="text-lg font-semibold text-neutral-800 mb-4">Project Hours Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={projectHoursData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip wrapperClassName="rounded-md shadow-lg bg-white" />
                            <Legend />
                            <Bar dataKey="hours" fill="#00D98B" name="Total Hours Logged" />
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