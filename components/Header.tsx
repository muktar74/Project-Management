

import React from 'react';
import { User, UserRole } from '../types';
import { LogoutIcon, PencilAltIcon } from './icons';

type HeaderProps = {
  currentUser: User;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  pageTitle: string;
  onOpenLogModal: () => void;
};

const Header: React.FC<HeaderProps> = ({ currentUser, allUsers, setCurrentUser, pageTitle, onOpenLogModal }) => {

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = allUsers.find(u => u.id === event.target.value);
    if (selectedUser) {
        setCurrentUser(selectedUser);
    }
  };

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-neutral-800">{pageTitle}</h1>
      <div className="flex items-center space-x-4">
        <button 
          onClick={onOpenLogModal}
          className="flex items-center bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-secondary transition-colors"
        >
          <PencilAltIcon className="w-5 h-5 mr-2" />
          Add Log
        </button>
        <div className="flex items-center">
            <label htmlFor="user-select" className="text-sm font-medium text-neutral-600 mr-2">View as:</label>
            <select
                id="user-select"
                value={currentUser.id}
                onChange={handleUserChange}
                className="block appearance-none w-full bg-white border border-neutral-200 text-neutral-700 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-brand-accent text-sm"
            >
                {allUsers.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                    </option>
                ))}
            </select>
        </div>
        <div className="flex items-center space-x-3">
          <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-semibold text-neutral-800 text-sm">{currentUser.name}</p>
            <p className="text-xs text-neutral-500">{currentUser.role}</p>
          </div>
        </div>
        <button className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-brand-primary transition-colors">
          <LogoutIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;