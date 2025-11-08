import React, { useState, useEffect } from 'react';
import { User, UserSettings, UserRole } from '../types';

type SettingsViewProps = {
  currentUser: User;
  onUpdateUserSettings: (settings: UserSettings) => void;
};

const SettingsView: React.FC<SettingsViewProps> = ({ currentUser, onUpdateUserSettings }) => {
  const [settings, setSettings] = useState<UserSettings>(currentUser.settings);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSettings(currentUser.settings);
  }, [currentUser]);

  const handleSettingChange = (field: keyof UserSettings['notifications']['logReminder'], value: any) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        logReminder: {
          ...prev.notifications.logReminder,
          [field]: value,
        },
      },
    }));
  };

  const handleSave = () => {
    setError('');
    const { telegram, telegramUsername } = settings.notifications.logReminder;
    if (telegram && telegramUsername && !telegramUsername.startsWith('@')) {
        setError('Telegram username must start with @.');
        setIsSaved(false);
        return;
    }
    
    onUpdateUserSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const isTeamMember = currentUser.role === UserRole.Member;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-neutral-800 mb-8">Settings</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-neutral-200 mb-8">
        <h3 className="text-xl font-semibold text-neutral-800 border-b pb-4 mb-4">Profile</h3>
        <div className="flex items-center space-x-4">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-20 h-20 rounded-full" />
            <div>
                <p className="text-2xl font-bold text-neutral-900">{currentUser.name}</p>
                <p className="text-neutral-600">{currentUser.email}</p>
                <p className="text-sm text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full inline-block mt-2">{currentUser.role}</p>
            </div>
        </div>
      </div>

      {isTeamMember && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-neutral-200">
            <h3 className="text-xl font-semibold text-neutral-800 border-b pb-4 mb-6">Notifications</h3>
            
            {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}

            <div className="space-y-6">
                <div>
                    <h4 className="font-semibold text-neutral-700">Daily Log Reminder</h4>
                    <p className="text-sm text-neutral-500 mt-1">Get a notification if you haven't submitted your daily log by a certain time.</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <label htmlFor="email-notif" className="font-medium text-neutral-800">Email Notification</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="email-notif" className="sr-only peer" checked={settings.notifications.logReminder.email} onChange={e => handleSettingChange('email', e.target.checked)} />
                        <div className="w-11 h-6 bg-neutral-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-accent/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                    </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <label htmlFor="telegram-notif" className="font-medium text-neutral-800">Telegram Notification</label>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="telegram-notif" className="sr-only peer" checked={settings.notifications.logReminder.telegram} onChange={e => handleSettingChange('telegram', e.target.checked)} />
                        <div className="w-11 h-6 bg-neutral-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-accent/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                    </label>
                </div>

                {settings.notifications.logReminder.telegram && (
                    <div className="pl-4 animate-fade-in">
                        <label htmlFor="telegram-user" className="block text-sm font-medium text-neutral-600 mb-1">Telegram Username</label>
                        <input 
                            type="text" 
                            id="telegram-user" 
                            value={settings.notifications.logReminder.telegramUsername || ''} 
                            onChange={e => handleSettingChange('telegramUsername', e.target.value)}
                            placeholder="@username"
                            className="block w-full max-w-xs bg-white border border-neutral-300 rounded-md py-2 px-3 text-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                        />
                    </div>
                )}
                
                <div className="pl-4">
                    <label htmlFor="notif-time" className="block text-sm font-medium text-neutral-600 mb-1">Notify me at</label>
                    <input 
                        type="time" 
                        id="notif-time" 
                        value={settings.notifications.logReminder.time}
                        onChange={e => handleSettingChange('time', e.target.value)}
                        className="block w-full max-w-xs bg-white border border-neutral-300 rounded-md py-2 px-3 text-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                    />
                </div>
            </div>

             <div className="mt-8 pt-6 border-t flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 text-sm font-medium text-brand-primary bg-brand-accent border border-transparent rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all"
                >
                    {isSaved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;