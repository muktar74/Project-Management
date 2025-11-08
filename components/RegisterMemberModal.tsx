import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { CloseIcon } from './icons';

type RegisterMemberModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: (userData: { name: string; email: string; role: UserRole }) => void;
  users: User[];
};

const RegisterMemberModal: React.FC<RegisterMemberModalProps> = ({ show, onClose, onSubmit, users }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Member);
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole(UserRole.Member);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Please fill out all required fields.');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }

    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        setError('A user with this email address already exists.');
        return;
    }

    onSubmit({ name, email, role });
    handleClose();
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
        <h2 className="text-2xl font-bold text-neutral-800 mb-6">Register New Member</h2>
        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="member-name" className="block text-sm font-medium text-neutral-700 mb-1">Full Name *</label>
            <input
              type="text"
              id="member-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., John Doe"
              className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="member-email" className="block text-sm font-medium text-neutral-700 mb-1">Email Address *</label>
            <input
              type="email"
              id="member-email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g., john.doe@zamzambank.com"
              className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="member-role" className="block text-sm font-medium text-neutral-700 mb-1">Role *</label>
            <select
              id="member-role"
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
            >
              <option value={UserRole.Member}>Team Member</option>
              <option value={UserRole.Executive}>Executive</option>
            </select>
          </div>
          <p className="text-xs text-neutral-500 pt-2">
            An invitation will be sent to the user's email address to set up their account and password.
          </p>
          <div className="mt-8 flex justify-end space-x-3 pt-4">
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
              Register Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterMemberModal;