import React, { useMemo, useState } from 'react';
import { Project, Task, User, ProjectStatus, TaskStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type ReportingViewProps = {
  projects: Project[];
  tasks: Task[];
  users: User[];
};

const StatCard = ({ title, value, subtext }: { title: string, value: string | number, subtext: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-md animate-slide-in-up">
        <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
        <p className="text-3xl font-bold text-neutral-800 mt-1">{value}</p>
        <p className="text-xs text-neutral-400 mt-2">{subtext}</p>
    </div>
);

const ReportingView: React.FC<ReportingViewProps> = ({ projects, tasks, users }) => {
  const [selectedUserId, setSelectedUserId] = useState('all');

  const selectedUser = useMemo(() => {
    if (selectedUserId === 'all') return null;
    return users.find(u => u.id === selectedUserId);
  }, [users, selectedUserId]);

  const projectStatusData = useMemo(() => {
    const statusCounts = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {} as Record<ProjectStatus, number>);

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const tasksByProjectData = useMemo(() => {
    return projects.map(project => {
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        const statusCounts = projectTasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {} as Record<TaskStatus, number>);
        return {
            name: project.name,
            [TaskStatus.ToDo]: statusCounts[TaskStatus.ToDo] || 0,
            [TaskStatus.InProgress]: statusCounts[TaskStatus.InProgress] || 0,
            [TaskStatus.Review]: statusCounts[TaskStatus.Review] || 0,
            [TaskStatus.Done]: statusCounts[TaskStatus.Done] || 0,
        };
    });
  }, [projects, tasks]);
  
  const teamWorkloadData = useMemo(() => {
    const userTaskCounts = users.map(user => {
      const openTasks = tasks.filter(task => task.assigneeId === user.id && task.status !== TaskStatus.Done).length;
      return { name: user.name, openTasks, id: user.id };
    });
    return userTaskCounts.sort((a,b) => b.openTasks - a.openTasks);
  }, [users, tasks]);

  const displayedStats = useMemo(() => {
    if (selectedUser) {
        const userTasks = tasks.filter(t => t.assigneeId === selectedUser.id);
        const openTasks = userTasks.filter(t => t.status !== TaskStatus.Done).length;
        const overdueTasks = userTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== TaskStatus.Done).length;
        const completedTasks = userTasks.filter(t => t.status === TaskStatus.Done).length;
        
        const userProjectIds = new Set(userTasks.map(t => t.projectId));
        const activeProjectsCount = projects.filter(p => userProjectIds.has(p.id) && p.status !== ProjectStatus.Completed).length;
        
        return {
            stat1: { title: "Assigned Projects (Active)", value: activeProjectsCount, subtext: `For ${selectedUser.name}`},
            stat2: { title: "Open Tasks", value: openTasks, subtext: "Tasks not yet completed" },
            stat3: { title: "Overdue Tasks", value: overdueTasks, subtext: "Tasks past their due date" },
            stat4: { title: "Completed Tasks", value: completedTasks, subtext: "Total tasks marked as Done" }
        }
    } else {
        const totalOpenTasks = tasks.filter(t => t.status !== TaskStatus.Done).length;
        const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== TaskStatus.Done).length;
        return {
            stat1: { title: "Total Projects", value: projects.length, subtext: "All projects in the portfolio" },
            stat2: { title: "Active Projects", value: projects.filter(p => p.status !== ProjectStatus.Completed).length, subtext: "Currently in-flight" },
            stat3: { title: "Total Open Tasks", value: totalOpenTasks, subtext: "Tasks not yet completed" },
            stat4: { title: "Overdue Tasks", value: overdueTasks, subtext: "Tasks past their due date" }
        };
    }
  }, [projects, tasks, selectedUser]);
  
  const PIE_COLORS = {
    [ProjectStatus.OnTrack]: '#00D98B', // brand-accent
    [ProjectStatus.AtRisk]: '#F59E0B',
    [ProjectStatus.OffTrack]: '#EF4444',
    [ProjectStatus.OnHold]: '#6B7280',
    [ProjectStatus.Completed]: '#006F6F', // brand-secondary
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-fade-in">
       <h2 className="text-3xl font-bold text-neutral-800 mb-8">Project Reports</h2>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-neutral-600 text-sm sm:text-base">
            {selectedUser ? `Showing personalized report for ${selectedUser.name}.` : 'Showing an overview for all team members.'}
        </p>
        <div className="flex items-center w-full sm:w-auto">
          <label htmlFor="user-filter-reports" className="text-sm font-medium text-neutral-600 mr-2 whitespace-nowrap">View for:</label>
          <select 
            id="user-filter-reports" 
            value={selectedUserId} 
            onChange={e => setSelectedUserId(e.target.value)} 
            className="w-full bg-white border border-neutral-300 rounded-md py-2 px-3 pr-8 text-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent appearance-none"
          >
            <option value="all">All Team Members</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={displayedStats.stat1.title} value={displayedStats.stat1.value} subtext={displayedStats.stat1.subtext} />
        <StatCard title={displayedStats.stat2.title} value={displayedStats.stat2.value} subtext={displayedStats.stat2.subtext} />
        <StatCard title={displayedStats.stat3.title} value={displayedStats.stat3.value} subtext={displayedStats.stat3.subtext} />
        <StatCard title={displayedStats.stat4.title} value={displayedStats.stat4.value} subtext={displayedStats.stat4.subtext} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md animate-slide-in-up">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Project Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={projectStatusData} cx="50%" cy="50%" labelLine={false} outerRadius={100} innerRadius={60} dataKey="value" nameKey="name">
                        {projectStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as ProjectStatus]} />
                        ))}
                    </Pie>
                    <Tooltip wrapperClassName="rounded-md shadow-lg bg-white" />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>

        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md animate-slide-in-up">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Team Workload (Open Tasks)</h3>
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamWorkloadData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip wrapperClassName="rounded-md shadow-lg bg-white" />
                    <Bar dataKey="openTasks" name="Open Tasks">
                      {teamWorkloadData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.id === selectedUserId ? '#004C4C' : '#006F6F'} />
                      ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md animate-slide-in-up">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Task Status by Project</h3>
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={tasksByProjectData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip wrapperClassName="rounded-md shadow-lg bg-white" />
                <Legend />
                <Bar dataKey={TaskStatus.ToDo} stackId="a" fill="#9CA3AF" name="To Do" />
                <Bar dataKey={TaskStatus.InProgress} stackId="a" fill="#3B82F6" name="In Progress" />
                <Bar dataKey={TaskStatus.Review} stackId="a" fill="#F59E0B" name="Review" />
                <Bar dataKey={TaskStatus.Done} stackId="a" fill="#00D98B" name="Done" />
            </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default ReportingView;