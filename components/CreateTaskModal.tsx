import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Task, Project } from '../types';
import { CloseIcon } from './icons';

type CreateTaskModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: (taskData: Omit<Task, 'id' | 'status' | 'order'>) => void;
  projects: Project[];
  users: User[];
  defaultProjectId?: string;
};

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ show, onClose, onSubmit, projects, users, defaultProjectId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || '');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const activeProjects = useMemo(() => projects.filter(p => p.status !== 'Completed'), [projects]);

  const teamMembers = useMemo(() => {
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return [];
    return users.filter(user => project.team.includes(user.id));
  }, [selectedProjectId, projects, users]);

  const resetAndInitializeForm = useCallback(() => {
    setTitle('');
    setDescription('');
    const initialProjectId = defaultProjectId || (activeProjects.length > 0 ? activeProjects[0].id : '');
    setSelectedProjectId(initialProjectId);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setDueDate(nextWeek.toISOString().split('T')[0]);
    setError('');
  }, [defaultProjectId, activeProjects]);

  useEffect(() => {
    if (show) {
      resetAndInitializeForm();
    }
  }, [show, resetAndInitializeForm]);

  useEffect(() => {
    if (show) {
      const currentAssigneeIsInTeam = teamMembers.some(member => member.id === assigneeId);
      if (teamMembers.length > 0 && !currentAssigneeIsInTeam) {
        setAssigneeId(teamMembers[0].id);
      } else if (teamMembers.length === 0) {
        setAssigneeId('');
      }
    }
  }, [show, teamMembers, assigneeId]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assigneeId || !dueDate || !selectedProjectId) {
      setError('Please fill out all required fields (Project, Title, Assignee, Due Date).');
      return;
    }

    onSubmit({
      projectId: selectedProjectId,
      title,
      description,
      assigneeId,
      dueDate,
    });
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 m-4 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-neutral-800 mb-6">Create New Task</h2>
        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-project" className="block text-sm font-medium text-neutral-700 mb-1">Project *</label>
            <select
              id="task-project"
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
            >
              {activeProjects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-neutral-700 mb-1">Title *</label>
            <input
              type="text"
              id="task-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Design the new dashboard"
              className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-neutral-700 mb-1">Description (Optional)</label>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add more details about the task..."
              className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-assignee" className="block text-sm font-medium text-neutral-700 mb-1">Assignee *</label>
              <select
                id="task-assignee"
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                disabled={teamMembers.length === 0}
                className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm disabled:bg-neutral-100"
              >
                {teamMembers.length > 0 ? teamMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                )) : <option>No members in project</option>}
              </select>
            </div>
            <div>
              <label htmlFor="task-duedate" className="block text-sm font-medium text-neutral-700 mb-1">Due Date *</label>
              <input
                type="date"
                id="task-duedate"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-brand-primary bg-brand-accent border border-transparent rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;