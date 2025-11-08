import React, { useState, useEffect } from 'react';
import { Project, Log } from '../types';
import { CloseIcon } from './icons';

type LogSubmissionModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: (logData: Omit<Log, 'id' | 'userId'>) => void;
  projects: Project[];
};

const LogSubmissionModal: React.FC<LogSubmissionModalProps> = ({ show, onClose, onSubmit, projects }) => {
  const [projectId, setProjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [task, setTask] = useState('');
  const [blockers, setBlockers] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [projects]);

  const resetForm = () => {
    if (projects.length > 0) {
      setProjectId(projects[0].id);
    }
    setDate(new Date().toISOString().split('T')[0]);
    setHours('');
    setTask('');
    setBlockers('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !date || !hours || !task) {
      setError('Please fill out all required fields.');
      return;
    }
    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      setError('Please enter a valid number of hours.');
      return;
    }

    onSubmit({
      projectId,
      date,
      hours: hoursNum,
      task,
      blockers,
    });
    resetForm();
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 m-4 relative" onClick={e => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-neutral-800 mb-6">Submit Daily Log</h2>
        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-neutral-700 mb-1">Project *</label>
              <select
                id="project"
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <div>
                    <label htmlFor="hours" className="block text-sm font-medium text-neutral-700 mb-1">Hours Worked *</label>
                    <input
                        type="number"
                        id="hours"
                        value={hours}
                        onChange={e => setHours(e.target.value)}
                        placeholder="e.g., 7.5"
                        step="0.1"
                        min="0"
                        className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                    />
                </div>
            </div>
            <div>
              <label htmlFor="task" className="block text-sm font-medium text-neutral-700 mb-1">Task Description *</label>
              <textarea
                id="task"
                rows={4}
                value={task}
                onChange={e => setTask(e.target.value)}
                placeholder="What did you accomplish today?"
                className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
              ></textarea>
            </div>
            <div>
              <label htmlFor="blockers" className="block text-sm font-medium text-neutral-700 mb-1">Blockers (Optional)</label>
              <textarea
                id="blockers"
                rows={2}
                value={blockers}
                onChange={e => setBlockers(e.target.value)}
                placeholder="Are there any issues impeding your progress?"
                className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
              ></textarea>
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-brand-primary bg-brand-accent border border-transparent rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
            >
              Submit Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogSubmissionModal;