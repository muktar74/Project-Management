import React, { useState, useMemo } from 'react';
import { Log, User, Project } from '../types';
import { CalendarIcon, ExclamationIcon, UsersIcon } from './icons';

type DailyLogsViewProps = {
  logs: Log[];
  users: User[];
  projects: Project[];
};

const LogDetailSection: React.FC<{ title: string, content: string }> = ({ title, content }) => (
    <div className="mt-3">
        <h4 className="font-semibold text-neutral-600 text-sm">{title}</h4>
        <p className="text-neutral-800 mt-1 text-sm whitespace-pre-wrap">{content}</p>
    </div>
);

const LogItem: React.FC<{ log: Log, user?: User, project?: Project, userMap: Map<string, User> }> = ({ log, user, project, userMap }) => {
    const collaborators = useMemo(() => {
        return (log.collaboratorIds || []).map(id => userMap.get(id)).filter(Boolean) as User[];
    }, [log.collaboratorIds, userMap]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 flex flex-col sm:flex-row sm:space-x-4 animate-slide-in-up">
            <div className="flex items-center mb-3 sm:mb-0 sm:items-start">
              <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="sm:hidden ml-3">
                  <p className="font-bold text-neutral-800">{user?.name}</p>
                  <p className="text-sm text-brand-primary font-semibold">{project?.name}</p>
              </div>
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="hidden sm:block">
                        <span className="font-bold text-neutral-800">{user?.name}</span>
                        <span className="text-sm text-neutral-500 mx-2">•</span>
                        <span className="text-sm text-brand-primary font-semibold">{project?.name}</span>
                    </div>
                    <div className="text-sm text-neutral-500 flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1.5 text-neutral-400" />
                        {new Date(log.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                <LogDetailSection title="Yesterday's Accomplishments" content={log.yesterdaysTasks} />
                <LogDetailSection title="Today's Plan" content={log.todaysPlan} />

                {log.challenges && (
                    <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-md flex items-start">
                        <ExclamationIcon className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-yellow-800 text-sm">Challenges / Blockers</h4>
                            <p className="text-yellow-700 text-sm whitespace-pre-wrap">{log.challenges}</p>
                        </div>
                    </div>
                )}

                {collaborators.length > 0 && (
                     <div className="mt-3 flex items-center">
                        <UsersIcon className="w-5 h-5 text-neutral-400 mr-2"/>
                        <span className="text-sm font-medium text-neutral-600 mr-2">Collaborators:</span>
                        <div className="flex -space-x-2">
                            {collaborators.map(c => (
                                <img key={c.id} src={c.avatar} alt={c.name} title={c.name} className="w-7 h-7 rounded-full border-2 border-white"/>
                            ))}
                        </div>
                     </div>
                )}
            </div>
        </div>
    );
}

const DailyLogsView: React.FC<DailyLogsViewProps> = ({ logs, users, projects }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedProject, setSelectedProject] = useState('all');
    const [selectedUser, setSelectedUser] = useState('all');

    const sortedLogs = useMemo(() => {
        return [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [logs]);

    const filteredLogs = useMemo(() => {
        return sortedLogs.filter(log => {
            const dateMatch = !selectedDate || log.date === selectedDate;
            const projectMatch = selectedProject === 'all' || log.projectId === selectedProject;
            const userMatch = selectedUser === 'all' || log.userId === selectedUser;
            return dateMatch && projectMatch && userMatch;
        });
    }, [sortedLogs, selectedDate, selectedProject, selectedUser]);
    
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);

    return (
        <div className="p-4 sm:p-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-neutral-800 mb-8">Daily Activity Logs</h2>
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-neutral-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <h3 className="text-lg font-semibold text-neutral-800 md:col-span-1 self-center">Filter Logs</h3>
                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="project-filter" className="block text-sm font-medium text-neutral-600 mb-1">Project</label>
                            <select id="project-filter" value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="block w-full bg-white border border-neutral-300 rounded-md py-2 px-3 text-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent">
                                <option value="all">All Projects</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="user-filter" className="block text-sm font-medium text-neutral-600 mb-1">Team Member</label>
                            <select id="user-filter" value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="block w-full bg-white border border-neutral-300 rounded-md py-2 px-3 text-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent">
                                <option value="all">All Members</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="date-filter" className="block text-sm font-medium text-neutral-600 mb-1">Date</label>
                            <input type="date" id="date-filter" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="block w-full bg-white border border-neutral-300 rounded-md py-1.5 px-3 text-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent" />
                        </div>
                    </div>
                </div>
                 {(selectedDate || selectedProject !== 'all' || selectedUser !== 'all') && (
                    <button 
                        onClick={() => {
                            setSelectedDate('');
                            setSelectedProject('all');
                            setSelectedUser('all');
                        }}
                        className="text-sm text-brand-primary hover:underline mt-3"
                    >
                        Clear filters
                    </button>
                 )}
            </div>
            
            <div className="space-y-4">
                {filteredLogs.length > 0 ? (
                    filteredLogs.map(log => (
                        <LogItem 
                            key={log.id} 
                            log={log} 
                            user={userMap.get(log.userId)} 
                            project={projectMap.get(log.projectId)}
                            userMap={userMap}
                        />
                    ))
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-neutral-200">
                        <h3 className="text-lg font-semibold text-neutral-700">No Logs Found</h3>
                        <p className="text-neutral-500 mt-2">Try adjusting your filters or check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyLogsView;
