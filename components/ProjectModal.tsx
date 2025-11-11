import React, { useState, useEffect } from 'react';
import { Project, User, UserRole, ProjectStatus } from '../types.ts';
import { CloseIcon } from './icons.tsx';

type ProjectModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: (projectData: Omit<Project, 'id' | 'progress'> & { id?: string }) => void;
  users: User[];
  projectToEdit: Project | null;
};

const ProjectModal: React.FC<ProjectModalProps> = ({ show, onClose, onSubmit, users, projectToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.OnTrack);
  const [team, setTeam] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setStartDate(projectToEdit.startDate);
      setEndDate(projectToEdit.endDate);
      setStatus(projectToEdit.status);
      setTeam(projectToEdit.team);
    } else {
      // Reset form for creation
      setName('');
      setDescription('');
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setEndDate('');
      setStatus(ProjectStatus.OnTrack);
      setTeam([]);
    }
    setError('');
  }, [projectToEdit, show]);

  const handleTeamChange = (userId: string) => {
    setTeam(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationErrors: string[] = [];
    if (!name.trim()) validationErrors.push('Project Name');
    if (!startDate) validationErrors.push('Start Date');
    if (!endDate) validationErrors.push('End Date');
    
    if (validationErrors.length > 0) {
        setError(`Please fill out required fields: ${validationErrors.join(', ')}.`);
        return;
    }

    if (name.trim().length < 3) {
        setError('Project Name must be at least 3 characters long.');
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        setError('End Date cannot be before Start Date.');
        return;
    }

    const projectData = {
      name,
      description,
      startDate,
      endDate,
      status,
      team,
    };
    
    if (projectToEdit) {
      onSubmit({ ...projectData, id: projectToEdit.id });
    } else {
      onSubmit(projectData);
    }
  };

  if (!show) {
    return null;
  }
  
  const potentialMembers = users.filter(u => u.role === UserRole.Member || u.role === UserRole.Manager);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 m-4 relative max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex-shrink-0">{projectToEdit ? 'Edit Project' : 'Create New Project'}</h2>
        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex-shrink-0" role="alert">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2">
          <div className="space-y-4">
            <div>
              <label htmlFor="proj-name" className="block text-sm font-medium text-neutral-700 mb-1">Project Name *</label>
              <input type="text" id="proj-name" value={name} onChange={e => setName(e.target.value)} className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm" />
            </div>
            <div>
              <label htmlFor="proj-desc" className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
              <textarea id="proj-desc" rows={3} value={description} onChange={e => setDescription(e.target.value)} className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="proj-start" className="block text-sm font-medium text-neutral-700 mb-1">Start Date *</label>
                <input type="date" id="proj-start" value={startDate} onChange={e => setStartDate(e.target.value)} className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm" />
              </div>
              <div>
                <label htmlFor="proj-end" className="block text-sm font-medium text-neutral-700 mb-1">End Date *</label>
                <input type="date" id="proj-end" value={endDate} onChange={e => setEndDate(e.target.value)} className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm" />
              </div>
            </div>
            <div>
              <label htmlFor="proj-status" className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
              <select id="proj-status" value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm">
                {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Assign Team Members</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-3 bg-neutral-50 rounded-md border">
                    {potentialMembers.map(user => (
                        <div key={user.id} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`user-${user.id}`}
                                checked={team.includes(user.id)}
                                onChange={() => handleTeamChange(user.id)}
                                className="h-4 w-4 text-brand-primary border-neutral-300 rounded focus:ring-brand-accent"
                            />
                            <label htmlFor={`user-${user.id}`} className="ml-2 text-sm text-neutral-700 flex items-center">
                                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full mr-2"/>
                                {user.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </form>

        <div className="mt-8 flex justify-end space-x-3 flex-shrink-0 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-brand-primary bg-brand-accent border border-transparent rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent">
            {projectToEdit ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;