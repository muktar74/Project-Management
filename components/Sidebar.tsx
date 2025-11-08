import React, { useState, useMemo } from 'react';
import { DashboardIcon, BriefcaseIcon, CheckSquareIcon, SettingsIcon, ChartPieIcon, PencilAltIcon, LogoutIcon, CloseIcon } from './icons';
import { User, UserRole } from '../types';

type SidebarProps = {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  setSelectedProject: (id: string | null) => void;
  currentUser: User;
  onOpenLogModal: () => void;
  onLogout: () => void;
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
    {React.cloneElement(icon, { className: 'w-5 h-5' })}
    <span className="ml-2 font-medium text-sm">{label}</span>
  </li>
);

const MobileNavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
    <li
      onClick={onClick}
      className={`flex items-center p-4 text-lg rounded-lg transition-all duration-200 cursor-pointer ${isActive ? 'bg-brand-secondary text-white' : 'text-neutral-200 hover:bg-brand-secondary hover:text-white'}`}
    >
      {React.cloneElement(icon, { className: 'w-6 h-6' })}
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


const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, setSelectedProject, currentUser, onOpenLogModal, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      { page: 'reporting', label: 'Reporting', icon: <ChartPieIcon />, roles: [UserRole.Manager, UserRole.Executive] },
    ];
    return allItems.filter(item => item.roles.includes(currentUser.role));
  }, [currentUser.role]);


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