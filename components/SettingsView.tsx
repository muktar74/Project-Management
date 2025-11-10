import React, { useState, useEffect } from 'react';
import { User, UserSettings, UserRole } from '../types';
import { PencilAltIcon } from './icons';

type SettingsViewProps = {
  currentUser: User;
  onUpdateUserSettings: (settings: UserSettings) => void;
  onUpdateUserProfile: (profileData: { name: string; email: string; avatar: string }) => void;
};

const SettingsView: React.FC<SettingsViewProps> = ({ currentUser, onUpdateUserSettings, onUpdateUserProfile }) => {
  // State for notification settings
  const [settings, setSettings] = useState<UserSettings>(currentUser.settings);
  const [notifError, setNotifError] = useState('');

  // State for profile information
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [profileError, setProfileError] = useState('');
  
  // Sync state with props
  useEffect(() => {
    setSettings(currentUser.settings);
    setName(currentUser.name);
    setEmail(currentUser.email);
    setAvatar(currentUser.avatar);
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleNotifSave = () => {
    setNotifError('');
    const { telegram, telegramUsername } = settings.notifications.logReminder;
    if (telegram && telegramUsername && !telegramUsername.startsWith('@')) {
        setNotifError('Telegram username must start with @.');
        return;
    }
    
    onUpdateUserSettings(settings);
  };

  const handleProfileSave = () => {
    setProfileError('');
    if (!name.trim() || !email.trim()) {
        setProfileError('Name and email cannot be empty.');
        return;
    }
     if (!/\S+@\S+\.\S+/.test(email)) {
        setProfileError('Please enter a valid email address.');
        return;
    }
    
    onUpdateUserProfile({ name, email, avatar });
  };

  const canSetLogReminders = currentUser.role === UserRole.Member || currentUser.role === UserRole.Manager;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-neutral-800 mb-8">Settings</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-md border border-neutral-200 mb-8">
        <h3 className="text-xl font-semibold text-neutral-800 border-b pb-4 mb-6">Profile Information</h3>
        {profileError && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{profileError}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-600 mb-1">Full Name</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="block w-full bg-white border border-neutral-300 rounded-md py-2 px-3 text-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"/>
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-600 mb-1">Email Address</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full bg-white border border-neutral-300 rounded-md py-2 px-3 text-sm text-neutral-900 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"/>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center">
                <div className="relative">
                    <img src={avatar || 'https://i.pravatar.cc/150'} alt="Avatar Preview" className="w-24 h-24 rounded-full mb-2 object-cover bg-neutral-200" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://i.pravatar.cc/150?u=error'; }} />
                    <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full border shadow-sm cursor-pointer hover:bg-neutral-100 transition-colors">
                        <PencilAltIcon className="w-4 h-4 text-neutral-600"/>
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                </div>
                 <p className="text-xs text-neutral-500 text-center mt-3">Click the pencil to upload a new photo</p>
            </div>
        </div>

        <div className="mt-6 pt-6 border-t">
             <h4 className="font-semibold text-neutral-700 mb-4">Change Password</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <input type="password" placeholder="Current Password" disabled className="block w-full bg-neutral-100 border border-neutral-300 rounded-md py-2 px-3 text-sm text-neutral-500 cursor-not-allowed"/>
                 <input type="password" placeholder="New Password" disabled className="block w-full bg-neutral-100 border border-neutral-300 rounded-md py-2 px-3 text-sm text-neutral-500 cursor-not-allowed"/>
                 <input type="password" placeholder="Confirm New Password" disabled className="block w-full bg-neutral-100 border border-neutral-300 rounded-md py-2 px-3 text-sm text-neutral-500 cursor-not-allowed"/>
             </div>
             <p className="text-xs text-neutral-500 mt-2">Password changes are disabled in this demo.</p>
        </div>

        <div className="mt-8 pt-6 border-t flex justify-end">
            <button
                onClick={handleProfileSave}
                className="px-6 py-2 text-sm font-medium text-brand-primary bg-brand-accent border border-transparent rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all"
            >
                Save Profile
            </button>
        </div>
      </div>

      {canSetLogReminders && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-neutral-200">
            <h3 className="text-xl font-semibold text-neutral-800 border-b pb-4 mb-6">Notifications</h3>
            
            {notifError && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{notifError}</div>}

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
                    onClick={handleNotifSave}
                    className="px-6 py-2 text-sm font-medium text-brand-primary bg-brand-accent border border-transparent rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all"
                >
                    Save Changes
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
