import React, { useMemo } from 'react';
import { User, Task, Log, TaskStatus, UserRole } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { CheckSquareIcon, ExclamationIcon, UsersIcon, UserAddIcon } from './icons';

type TeamViewProps = {
  teamMembers: User[];
  tasks: Task[];
  logs: Log[];
  currentUser: User;
  onOpenNotificationModal: () => void;
  onOpenRegisterModal: () => void;
};

const MemberCard: React.FC<{ member: User, tasks: Task[], logs: Log[] }> = ({ member, tasks, logs }) => {
    const memberTasks = useMemo(() => tasks.filter(t => t.assigneeId === member.id), [tasks, member.id]);
    const openTasks = useMemo(() => memberTasks.filter(t => t.status !== TaskStatus.Done), [memberTasks]);
    const overdueTasks = useMemo(() => openTasks.filter(t => new Date(t.dueDate) < new Date()), [openTasks]);

    const last7DaysActivity = useMemo(() => {
        const activity = new Map<string, number>();
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            activity.set(dateString, 0);
        }

        logs.forEach(log => {
            if (log.userId === member.id && activity.has(log.date)) {
                activity.set(log.date, (activity.get(log.date) || 0) + log.hours);
            }
        });

        return Array.from(activity.entries()).map(([date, hours]) => ({
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            hours,
        }));
    }, [logs, member.id]);

    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-neutral-200 animate-slide-in-up">
            <div className="flex items-center space-x-4 mb-4">
                <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-full" />
                <div>
                    <h3 className="text-lg font-bold text-neutral-800">{member.name}</h3>
                    <p className="text-sm text-neutral-500">{member.role}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-neutral-50 p-3 rounded-lg">
                    <div className="flex items-center text-sm text-neutral-500">
                        <CheckSquareIcon className="w-4 h-4 mr-2" />
                        Open Tasks
                    </div>
                    <p className="text-2xl font-bold text-neutral-800 mt-1">{openTasks.length}</p>
                </div>
                <div className={`p-3 rounded-lg ${overdueTasks.length > 0 ? 'bg-red-50' : 'bg-neutral-50'}`}>
                    <div className={`flex items-center text-sm ${overdueTasks.length > 0 ? 'text-red-600' : 'text-neutral-500'}`}>
                        <ExclamationIcon className="w-4 h-4 mr-2" />
                        Overdue
                    </div>
                    <p className={`text-2xl font-bold mt-1 ${overdueTasks.length > 0 ? 'text-red-700' : 'text-neutral-800'}`}>{overdueTasks.length}</p>
                </div>
            </div>
            
            <div>
                <h4 className="text-sm font-medium text-neutral-600 mb-2">Activity (Last 7 Days)</h4>
                <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={last7DaysActivity}>
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ background: '#fff', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}
                            labelStyle={{ fontWeight: 'bold' }}
                            formatter={(value) => [`${value} hours`, 'Logged']}
                        />
                        <Bar dataKey="hours" fill="#00D98B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const TeamView: React.FC<TeamViewProps> = ({ teamMembers, tasks, logs, currentUser, onOpenNotificationModal, onOpenRegisterModal }) => {
  const isManager = currentUser.role === UserRole.Manager;

  return (
    <div className="p-4 sm:p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-800">{isManager ? 'My Team' : 'Company Directory'}</h2>
         {isManager && (
            <div className="flex items-center space-x-2">
                <button 
                    onClick={onOpenRegisterModal}
                    className="flex items-center bg-brand-accent text-brand-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-transform duration-200 hover:scale-105"
                >
                    <UserAddIcon className="w-5 h-5 mr-2" />
                    Register Member
                </button>
                <button 
                    onClick={onOpenNotificationModal}
                    className="flex items-center bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-secondary transition-colors"
                >
                    <UsersIcon className="w-5 h-5 mr-2" />
                    Broadcast Message
                </button>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map(member => (
            <MemberCard key={member.id} member={member} tasks={tasks} logs={logs} />
        ))}
      </div>
      {teamMembers.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-700">No Team Members Found</h3>
            <p className="text-neutral-500 mt-2">
                {isManager ? "Team members are populated from the projects you manage. You can also register new members." : "There are no other members in the directory."}
            </p>
        </div>
      )}
    </div>
  );
};

export default TeamView;