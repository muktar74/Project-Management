import React, { useState, useEffect, useMemo } from 'react';
import { Project, Log, User } from '../types';
import { CloseIcon } from './icons';

type LogSubmissionModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: (logData: Omit<Log, 'id' | 'userId'>) => void;
  projects: Project[];
  users: User[]; // All users to find collaborators
  currentUserId: string;
};

const LogSubmissionModal: React.FC<LogSubmissionModalProps> = ({ show, onClose, onSubmit, projects, users, currentUserId }) => {
  const [projectId, setProjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [yesterdaysTasks, setYesterdaysTasks] = useState('');
  const [todaysPlan, setTodaysPlan] = useState('');
  const [challenges, setChallenges] = useState('');
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  const projectTeamMembers = useMemo(() => {
    const selectedProject = projects.find(p => p.id === projectId);
    if (!selectedProject) return [];
    // Return other members of the team, not the current user
    return users.filter(u => selectedProject.team.includes(u.id) && u.id !== currentUserId);
  }, [projectId, projects, users, currentUserId]);

  useEffect(() => {
    if (projects.length > 0 && show) {
      // Only set initial project when modal opens
      if (!projectId) {
         setProjectId(projects[0].id);
      }
    }
  }, [projects, show, projectId]);

  const resetForm = () => {
    if (projects.length > 0) {
      setProjectId(projects[0].id);
    }
    setDate(new Date().toISOString().split('T')[0]);
    setYesterdaysTasks('');
    setTodaysPlan('');
    setChallenges('');
    setCollaboratorIds([]);
    setError('');
  };

  const handleClose = () => {
    // Don't reset form fully on close, just close the modal
    onClose();
  };
  
  const handleCollaboratorChange = (userId: string) => {
    setCollaboratorIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validationErrors: string[] = [];
    if (!projectId) validationErrors.push('Project');
    if (!date) validationErrors.push('Date');
    if (!yesterdaysTasks.trim()) validationErrors.push("Yesterday's Accomplishments");
    if (!todaysPlan.trim()) validationErrors.push("Today's Plan");

    if (validationErrors.length > 0) {
      setError(`Please fill out all required fields: ${validationErrors.join(', ')}.`);
      return;
    }

    onSubmit({
      projectId,
      date,
      yesterdaysTasks,
      todaysPlan,
      challenges,
      collaboratorIds,
    });
    resetForm();
    onClose();
  };
  
  // Use effect to reset the form only when the modal is opened
  useEffect(() => {
    if (show) {
      resetForm();
    }
  }, [show]);


  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 m-4 relative max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex-shrink-0">Submit Daily Log</h2>
        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex-shrink-0" role="alert">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="project" className="block text-sm font-medium text-neutral-700 mb-1">Project *</label>
                <select
                  id="project"
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                  <label htmlFor="date" className="block text-sm font-medium text-neutral-700 mb-1">Date *</label>
                  <input
                      type="date"
                      id="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                  />
              </div>
            </div>
            
            <div>
              <label htmlFor="yesterday" className="block text-sm font-medium text-neutral-700 mb-1">Yesterday's Accomplishments *</label>
              <textarea
                id="yesterday"
                rows={3}
                value={yesterdaysTasks}
                onChange={e => setYesterdaysTasks(e.target.value)}
                placeholder="What did you complete yesterday?"
                className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
              ></textarea>
            </div>
             <div>
              <label htmlFor="today" className="block text-sm font-medium text-neutral-700 mb-1">Today's Plan *</label>
              <textarea
                id="today"
                rows={3}
                value={todaysPlan}
                onChange={e => setTodaysPlan(e.target.value)}
                placeholder="What are you planning to work on today?"
                className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
              ></textarea>
            </div>
            <div>
              <label htmlFor="challenges" className="block text-sm font-medium text-neutral-700 mb-1">Challenges / Blockers (Optional)</label>
              <textarea
                id="challenges"
                rows={2}
                value={challenges}
                onChange={e => setChallenges(e.target.value)}
                placeholder="Are there any issues impeding your progress?"
                className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
              ></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Collaborators (Optional)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-32 overflow-y-auto p-3 bg-neutral-50 rounded-md border">
                    {projectTeamMembers.length > 0 ? projectTeamMembers.map(user => (
                        <div key={user.id} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`collab-${user.id}`}
                                checked={collaboratorIds.includes(user.id)}
                                onChange={() => handleCollaboratorChange(user.id)}
                                className="h-4 w-4 text-brand-primary border-neutral-300 rounded focus:ring-brand-accent"
                            />
                            <label htmlFor={`collab-${user.id}`} className="ml-2 text-sm text-neutral-700 flex items-center">
                                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full mr-2"/>
                                {user.name}
                            </label>
                        </div>
                    )) : <p className="text-xs text-neutral-500 col-span-full">No other team members in this project.</p>}
                </div>
            </div>
        </form>

        <div className="mt-8 flex justify-end space-x-3 flex-shrink-0 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-brand-primary bg-brand-accent border border-transparent rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
          >
            Submit Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogSubmissionModal;