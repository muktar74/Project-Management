import React, { useState } from 'react';
import { User } from '../types.ts';
import { CloseIcon } from './icons.tsx';

type SendNotificationModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: (message: string, recipientIds: string[]) => void;
  teamMembers: User[];
};

const SendNotificationModal: React.FC<SendNotificationModalProps> = ({ show, onClose, onSubmit, teamMembers }) => {
  const [message, setMessage] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedMembers.length === teamMembers.length) {
        setSelectedMembers([]);
    } else {
        setSelectedMembers(teamMembers.map(m => m.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!message.trim() && selectedMembers.length === 0) {
        setError('Please write a message and select at least one recipient.');
        return;
    }
    if (!message.trim()) {
      setError('Please write a message.');
      return;
    }
    if (selectedMembers.length === 0) {
        setError('Please select at least one recipient.');
        return;
    }

    onSubmit(message.trim(), selectedMembers);
    setMessage('');
    setSelectedMembers([]);
    setError('');
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 m-4 relative max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-800">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex-shrink-0">Send Notification</h2>
        {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex-shrink-0" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2">
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1">Message *</label>
                <textarea
                    id="message"
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your announcement or update here..."
                    className="block w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                ></textarea>
            </div>
            <div className="mt-4">
                 <label className="block text-sm font-medium text-neutral-700 mb-2">Recipients *</label>
                 <div className="flex items-center mb-3 border-b pb-3">
                    <input
                        type="checkbox"
                        id="select-all"
                        checked={selectedMembers.length === teamMembers.length && teamMembers.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-brand-primary border-neutral-300 rounded focus:ring-brand-accent"
                    />
                    <label htmlFor="select-all" className="ml-2 text-sm font-semibold text-neutral-700">
                        Select All Members
                    </label>
                </div>
                 <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2">
                    {teamMembers.map(member => (
                        <div key={member.id} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`member-${member.id}`}
                                checked={selectedMembers.includes(member.id)}
                                onChange={() => handleMemberSelection(member.id)}
                                className="h-4 w-4 text-brand-primary border-neutral-300 rounded focus:ring-brand-accent"
                            />
                            <label htmlFor={`member-${member.id}`} className="ml-2 text-sm text-neutral-700 flex items-center">
                                <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full mr-2"/>
                                {member.name}
                            </label>
                        </div>
                    ))}
                 </div>
            </div>
        </form>

        <div className="mt-8 flex justify-end space-x-3 flex-shrink-0 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-brand-primary bg-brand-accent border border-transparent rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent">
            Send Notification
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendNotificationModal;