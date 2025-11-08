import React, { useState, useMemo } from 'react';
import { Task, User, Project, TaskStatus } from '../types';
import { suggestNextTask } from '../services/geminiService';
import { SparklesIcon, CloseIcon } from './icons';

type MyTasksViewProps = {
  tasks: Task[];
  projects: Project[];
  currentUser: User;
};

const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.ToDo: return 'bg-gray-100 text-gray-800';
        case TaskStatus.InProgress: return 'bg-blue-100 text-blue-800';
        case TaskStatus.Review: return 'bg-yellow-100 text-yellow-800';
        case TaskStatus.Done: return 'bg-green-100 text-green-800';
        default: return '';
    }
};

const formatTaskStatus = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.ToDo: return 'To Do';
        case TaskStatus.InProgress: return 'In Progress';
        case TaskStatus.Review: return 'Review';
        case TaskStatus.Done: return 'Done';
        default: return status;
    }
};

const MyTasksView: React.FC<MyTasksViewProps> = ({ tasks, projects, currentUser }) => {
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDueDate, setSelectedDueDate] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [error, setError] = useState('');

  const userProjectsWithTasks = useMemo(() => {
    const projectIds = new Set(tasks.filter(t => t.assigneeId === currentUser.id).map(t => t.projectId));
    return projects.filter(p => projectIds.has(p.id));
  }, [tasks, projects, currentUser.id]);

  const myTasks = useMemo(() => {
    return tasks
        .filter(task => {
            const isAssignee = task.assigneeId === currentUser.id;
            const projectMatch = selectedProject === 'all' || task.projectId === selectedProject;
            const statusMatch = selectedStatus === 'all' || task.status === selectedStatus;
            const dueDateMatch = !selectedDueDate || task.dueDate === selectedDueDate;
            return isAssignee && projectMatch && statusMatch && dueDateMatch;
        })
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks, currentUser.id, selectedProject, selectedStatus, selectedDueDate]);

  const openTasks = useMemo(() => myTasks.filter(t => t.status !== TaskStatus.Done), [myTasks]);

  const getProject = (projectId: string) => projects.find(p => p.id === projectId);

  const handleClearFilters = () => {
    setSelectedProject('all');
    setSelectedStatus('all');
    setSelectedDueDate('');
  };

  const handleGetSuggestion = async () => {
    setIsLoadingSuggestion(true);
    setError('');
    setAiSuggestion('');
    try {
        const suggestion = await suggestNextTask(openTasks, projects);
        setAiSuggestion(suggestion);
    } catch (err) {
        setError('Could not get suggestion. Please try again.');
    } finally {
        setIsLoadingSuggestion(false);
    }
  };


  const filtersAreActive = selectedProject !== 'all' || selectedStatus !== 'all' || selectedDueDate !== '';

  return (
    <div className="p-8">
       <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-800">My Tasks</h2>
         <button 
            onClick={handleGetSuggestion}
            disabled={isLoadingSuggestion || openTasks.length === 0}
            className="flex items-center bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-secondary transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            {isLoadingSuggestion ? 'Thinking...' : 'Suggest Next Task'}
          </button>
       </div>

       {error && <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p>{error}</p></div>}
       {aiSuggestion && (
         <div className="mb-6 bg-brand-light bg-opacity-40 border-l-4 border-brand-accent p-4 rounded-r-lg relative">
            <button onClick={() => setAiSuggestion('')} className="absolute top-2 right-2 p-1 text-neutral-500 hover:text-neutral-800">
                <CloseIcon className="w-5 h-5"/>
            </button>
            <h4 className="font-bold text-brand-primary mb-2">✨ AI Suggestion</h4>
            <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: aiSuggestion.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
         </div>
       )}

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <h3 className="text-lg font-semibold text-neutral-800 md:col-span-1 self-center">Filter My Tasks</h3>
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="project-filter-tasks" className="block text-sm font-medium text-neutral-600 mb-1">Project</label>
                    <select id="project-filter-tasks" value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="block w-full bg-white border border-neutral-300 rounded-md py-2 px-3 text-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent">
                        <option value="all">All Projects</option>
                        {userProjectsWithTasks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="status-filter-tasks" className="block text-sm font-medium text-neutral-600 mb-1">Status</label>
                    <select id="status-filter-tasks" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="block w-full bg-white border border-neutral-300 rounded-md py-2 px-3 text-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent">
                        <option value="all">All Statuses</option>
                        {Object.values(TaskStatus).map(status => <option key={status} value={status}>{formatTaskStatus(status)}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="date-filter-tasks" className="block text-sm font-medium text-neutral-600 mb-1">Due Date</label>
                    <input type="date" id="date-filter-tasks" value={selectedDueDate} onChange={e => setSelectedDueDate(e.target.value)} className="block w-full bg-white border border-neutral-300 rounded-md py-1.5 px-3 text-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent" />
                </div>
            </div>
        </div>
         {filtersAreActive && (
            <button 
                onClick={handleClearFilters}
                className="text-sm text-brand-primary hover:underline mt-4"
            >
                Clear filters
            </button>
         )}
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Task</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Project</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Due Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {myTasks.map(task => {
              const project = getProject(task.projectId);
              const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Done;
              return (
                <tr key={task.id} className={`hover:bg-neutral-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{task.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{project?.name}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-neutral-500'}`}>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(task.status)}`}>
                        {formatTaskStatus(task.status)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {myTasks.length === 0 && (
            <div className="text-center py-12">
                <p className="text-neutral-500">{filtersAreActive ? 'No tasks match your current filters.' : 'You have no tasks assigned.'}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default MyTasksView;