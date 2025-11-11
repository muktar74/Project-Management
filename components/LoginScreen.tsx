import React, { useState } from 'react';
import { User } from '../types.ts';
import { ExclamationIcon, EnvelopeIcon, LockClosedIcon, GoogleIcon, MicrosoftIcon } from './icons.tsx';

type LoginScreenProps = {
  users: User[];
  onLogin: (user: User) => void;
};

const BankLogo = ({ className }: { className?: string }) => (
    <div className={`flex items-center justify-center text-white ${className}`}>
        <svg className="w-10 h-10 lg:w-12 lg:h-12 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.724 8.761l.142-.284a1 1 0 011.664 0l.142.284a1 1 0 00.707.707l.284.142a1 1 0 010 1.664l-.284.142a1 1 0 00-.707.707l-.142.284a1 1 0 01-1.664 0l-.142-.284a1 1 0 00-.707-.707l-.284-.142a1 1 0 010-1.664l.284-.142a1 1 0 00.707.707z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21V11m0 0V6a2 2 0 012-2h2a2 2 0 012 2v5m-8 0V6a2 2 0 00-2-2H8a2 2 0 00-2 2v5" />
        </svg>
        <h1 className="ml-3 text-3xl lg:text-4xl font-bold tracking-wider">
          <span className="text-white">Zamzam</span><span className="text-neutral-300">Bank</span>
        </h1>
    </div>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
        setError('Email and password are required.');
        return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // NOTE: In a real app, we'd also check the password.
    // For this simulation, we'll just check for user existence.
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-neutral-50">
      {/* Left Branding Panel */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-brand-primary to-brand-secondary text-white flex flex-col justify-between p-8 lg:p-12">
        <BankLogo className="self-start"/>
        <div className="text-center my-10 lg:my-0 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">Project Management and Technical Support Office Hub</h2>
            <p className="mt-4 text-base lg:text-lg text-neutral-300 max-w-sm mx-auto">Your central command for tracking, managing, and delivering projects with precision The first full-fledged interest-free bank in Ethiopia.</p>
        </div>
        <p className="hidden lg:block text-center text-sm text-neutral-400">&copy; 2025 Zamzam Bank. All rights reserved.</p>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 grow">
        <div className="w-full max-w-md animate-slide-in-up">
            <h2 className="text-3xl font-bold text-neutral-800">Sign In</h2>
            <p className="text-neutral-500 mt-2 mb-8">Welcome back! Please enter your details.</p>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-center" role="alert">
                    <ExclamationIcon className="w-5 h-5 mr-3"/>
                    <p>{error}</p>
                </div>
            )}
            
            <form onSubmit={handleLoginAttempt} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email Address</label>
                    <div className="mt-1 relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                           <EnvelopeIcon className="h-5 w-5 text-neutral-400" />
                        </span>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full px-3 py-2 pl-10 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                            placeholder="you@zamzambank.com"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-neutral-700">Password</label>
                    <div className="mt-1 relative">
                         <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                           <LockClosedIcon className="h-5 w-5 text-neutral-400" />
                        </span>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-3 py-2 pl-10 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-brand-primary border-neutral-300 rounded focus:ring-brand-accent" />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-900">Remember me</label>
                    </div>
                    <div className="text-sm">
                        <a href="#" className="font-medium text-brand-primary hover:text-brand-secondary">Forgot your password?</a>
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-brand-primary bg-brand-accent hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all duration-200"
                    >
                        Sign In
                    </button>
                </div>
            </form>

            <div className="mt-8">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-neutral-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-neutral-50 text-neutral-500">Or continue with</span>
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                    <div>
                        <button className="w-full inline-flex justify-center py-2 px-4 border border-neutral-300 rounded-md shadow-sm bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50">
                           <GoogleIcon className="w-5 h-5" />
                        </button>
                    </div>
                     <div>
                        <button className="w-full inline-flex justify-center py-2 px-4 border border-neutral-300 rounded-md shadow-sm bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50">
                           <MicrosoftIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default LoginScreen;