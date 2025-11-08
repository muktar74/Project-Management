import React, { useState, useEffect, useCallback } from 'react';
import App from './App';
import LoginScreen from './components/LoginScreen';
import { User } from './types';
import { USERS } from './data';

const AuthGate: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for a logged-in user in localStorage on initial load
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
      const user = USERS.find(u => u.id === loggedInUserId);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, []);

  const handleLogin = useCallback((user: User) => {
    localStorage.setItem('loggedInUserId', user.id);
    setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('loggedInUserId');
    setCurrentUser(null);
  }, []);

  if (!currentUser) {
    return <LoginScreen users={USERS} onLogin={handleLogin} />;
  }

  return <App currentUser={currentUser} onLogout={handleLogout} />;
};

export default AuthGate;
