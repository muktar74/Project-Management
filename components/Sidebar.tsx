import React, { useState, useMemo } from 'react';
import { DashboardIcon, BriefcaseIcon, CheckSquareIcon, SettingsIcon, ChartPieIcon, PencilAltIcon, LogoutIcon, CloseIcon, UsersIcon, BellIcon } from './icons.tsx';
import { User, UserRole, Notification } from '../types.ts';
import { formatRelativeTime } from '../utils/helpers.ts';

type SidebarProps = {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  setSelectedProject: (id: string | null) => void;
  currentUser: User;
  notifications: Notification[];
  users: User[];
  onOpenLogModal: () => void;
  onLogout: () => void;
  onMarkNotificationAsRead: (id: string | 'all') => void;
};

type NavItemProps = {
  icon: React.ReactElement;
  label: string;
  isActive: boolean;
  onClick: () => void;
};

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-center px-3 border-b-2 transition-all duration-200 h-full cursor-pointer ${isActive ? 'text-white border-brand-accent' : 'text-neutral-300 hover:text-white border-transparent hover:border-white'}`}
  >
    {/* Fix: Cast icon to React.ReactElement<any> to resolve TypeScript error with React.cloneElement. */}
    {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
    <span className="ml-2 font-medium text-sm">{label}</span>
  </li>
);

const MobileNavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
    <li
      onClick={onClick}
      className={`flex items-center p-4 text-lg rounded-lg transition-all duration-200 cursor-pointer ${isActive ? 'bg-brand-secondary text-white' : 'text-neutral-200 hover:bg-brand-secondary hover:text-white'}`}
    >
      {/* Fix: Cast icon to React.ReactElement<any> to resolve TypeScript error with React.cloneElement. */}
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
      <span className="ml-4 font-medium">{label}</span>
    </li>
);

const BankLogo = () => (
    <div className="flex items-center">
        <svg className="w-8 h-8 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.724 8.761l.142-.284a1 1 0 011.664 0l.142.284a1 1 0 00.707.707l.284.142a1 1 0 010 1.664l-.284.142a1 1 0 00-.707.707l-.142.284a1 1 0 01-1.664 0l-.142-.284a1 1 0 00-.707-.707l-.284-.142a1 1 0 010-1.664l.284-.142a1 1 0 00.707.707z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21V11m0 0V6a2 2 0 012-2h2a2 2 0 012 2v5m-8 0V6a2 2 0 00-2-2H8a2 2 0 00-2 2v5" />
        </svg>
        <h1 className="ml-2 text-xl font-bold tracking-wider hidden sm:block">
          <span className="text-white">Zamzam</span><span className="text-neutral-300">Bank</span>
        </h1>
    </div>
);


const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, setSelectedProject, currentUser, notifications, users, onOpenLogModal, onLogout, onMarkNotificationAsRead }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleNav = (page: string) => {
    setCurrentPage(page);
    setSelectedProject(null);
    setIsMobileMenuOpen(false);
  };

  const navItems = useMemo(() => {
    const allItems = [
      { page: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, roles: [UserRole.Manager, UserRole.Member, UserRole.Executive] },
      { page: 'projects', label: 'Projects', icon: <BriefcaseIcon />, roles: [UserRole.Manager, UserRole.Member, UserRole.Executive] },
      { page: 'my-tasks', label: 'My Tasks', icon: <CheckSquareIcon />, roles: [UserRole.Manager, UserRole.Member] },
      { page: 'daily-logs', label: 'Daily Logs', icon: <PencilAltIcon />, roles: [UserRole.Manager, UserRole.Member] },
      { page: 'team', label: 'Team', icon: <UsersIcon />, roles: [UserRole.Manager, UserRole.Executive] },
      { page: 'reporting', label: 'Reporting', icon: <ChartPieIcon />, roles: [UserRole.Manager, UserRole.Executive] },
      { page: 'settings', label: 'Settings', icon: <SettingsIcon />, roles: [UserRole.Manager, UserRole.Member, UserRole.Executive] },
    ];
    return allItems.filter(item => item.roles.includes(currentUser.role));
  }, [currentUser.role]);

  const userNotifications = useMemo(() => {
    return notifications
      .filter(n => n.recipientId === currentUser.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, currentUser.id]);

  const unreadCount = useMemo(() => userNotifications.filter(n => !n.isRead).length, [userNotifications]);
  const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

  return (
    <>
      <nav className="bg-brand-primary text-white w-full shadow-md h-16 sticky top-0 z-40">
        <div className="mx-auto px-4 sm:px-6 flex items-center justify-between h-full">
          <div className="flex items-center">
             <BankLogo />
          </div>
          
          <ul className="hidden lg:flex items-center space-x-2 h-full">
            {navItems.map(item => (
                <NavItem
                    key={item.page}
                    icon={item.icon}
                    label={item.label}
                    isActive={currentPage === item.page}
                    onClick={() => handleNav(item.page)}
                />
            ))}
          </ul>
          
          <div className="hidden lg:flex items-center space-x-4">
              {currentUser.role !== UserRole.Executive && (
                 <button 
                    onClick={onOpenLogModal}
                    className="flex items-center bg-brand-accent text-brand-primary px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all duration-200 hover:scale-105"
                  >
                    <PencilAltIcon className="w-4 h-4 mr-2" />
                    Add Log
                  </button>
              )}
               <div className="relative">
                <button onClick={() => setIsNotificationsOpen(prev => !prev)} title="Notifications" className="p-2 rounded-full text-neutral-300 hover:bg-brand-secondary hover:text-white transition-colors">
                  <BellIcon className="w-5 h-5" />
                  {unreadCount > 0 && <span className="absolute top-1 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-brand-primary"></span>}
                </button>
                {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl z-50 text-neutral-800 animate-fade-in">
                        <div className="p-3 border-b flex justify-between items-center">
                            <h4 className="font-semibold text-sm">Notifications</h4>
                            {unreadCount > 0 && <button onClick={() => onMarkNotificationAsRead('all')} className="text-xs text-brand-primary hover:underline">Mark all as read</button>}
                        </div>
                        <ul className="max-h-96 overflow-y-auto">
                            {userNotifications.length > 0 ? userNotifications.map(n => {
                                const sender = userMap.get(n.senderId);
                                return (
                                    <li key={n.id} onClick={() => onMarkNotificationAsRead(n.id)} className={`border-b p-3 hover:bg-neutral-50 cursor-pointer ${!n.isRead ? 'bg-brand-light' : ''}`}>
                                        <div className="flex items-start space-x-3">
                                            <img src={sender?.avatar} alt={sender?.name} className="w-8 h-8 rounded-full mt-0.5"/>
                                            <div className="flex-1">
                                                <p className="text-sm">
                                                    <span className="font-semibold">{sender?.name}</span>
                                                    <span className="text-neutral-600"> {n.message}</span>
                                                </p>
                                                <p className="text-xs text-neutral-400 mt-1">{formatRelativeTime(n.timestamp)}</p>
                                            </div>
                                            {!n.isRead && <div className="w-2.5 h-2.5 bg-brand-primary rounded-full mt-1 flex-shrink-0"></div>}
                                        </div>
                                    </li>
                                );
                            }) : <li className="p-4 text-center text-sm text-neutral-500">No new notifications</li>}
                        </ul>
                    </div>
                )}
               </div>

              <div className="flex items-center space-x-3">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full" />
                 <div>
                    <p className="font-semibold text-white text-sm leading-tight">{currentUser.name}</p>
                    <p className="text-xs text-neutral-300 leading-tight">{currentUser.role}</p>
                </div>
              </div>
              <button onClick={onLogout} title="Logout" className="p-2 rounded-full text-neutral-300 hover:bg-brand-secondary hover:text-white transition-colors">
                <LogoutIcon className="w-5 h-5" />
              </button>
          </div>

          <div className="lg:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-neutral-200 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-brand-primary bg-opacity-95 z-50 flex flex-col p-6 animate-fade-in lg:hidden">
            <div className="flex justify-between items-center mb-8">
                <BankLogo />
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-neutral-200 hover:text-white">
                    <CloseIcon className="w-8 h-8"/>
                </button>
            </div>
            <ul className="space-y-4">
               {navItems.map(item => (
                <MobileNavItem
                    key={item.page}
                    icon={item.icon}
                    label={item.label}
                    isActive={currentPage === item.page}
                    onClick={() => handleNav(item.page)}
                />
            ))}
            </ul>
             <div className="mt-auto border-t border-brand-secondary pt-6 space-y-4">
                {currentUser.role !== UserRole.Executive && (
                    <button 
                        onClick={() => { onOpenLogModal(); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center justify-center bg-brand-accent text-brand-primary px-4 py-3 rounded-lg text-base font-semibold hover:bg-opacity-90 transition-colors"
                    >
                        <PencilAltIcon className="w-5 h-5 mr-2" />
                        Add Log
                    </button>
                )}
                <button onClick={onLogout} className="w-full flex items-center justify-center bg-brand-secondary text-white px-4 py-3 rounded-lg text-base font-semibold hover:bg-opacity-80 transition-colors">
                    <LogoutIcon className="w-5 h-5 mr-2" />
                    Logout
                </button>
             </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;