import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../contexts/ToastContext';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, CloseIcon } from './icons';

type ToastProps = {
  toast: ToastMessage;
  removeToast: (id: number) => void;
};

const icons = {
  success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
  error: <XCircleIcon className="w-6 h-6 text-red-500" />,
  info: <InformationCircleIcon className="w-6 h-6 text-blue-500" />,
};

const borderColors = {
  success: 'border-green-500',
  error: 'border-red-500',
  info: 'border-blue-500',
};

const Toast: React.FC<ToastProps> = ({ toast, removeToast }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      // Wait for animation to finish before removing
      setTimeout(() => removeToast(toast.id), 300);
    }, 4700);

    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const handleClose = () => {
    setIsFadingOut(true);
    setTimeout(() => removeToast(toast.id), 300);
  };

  return (
    <div
      className={`
        w-full max-w-sm bg-white rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden
        border-l-4 ${borderColors[toast.type]}
        transform transition-all duration-300 ease-in-out
        ${isFadingOut ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      style={{ animation: 'slide-in-right 0.3s ease-out forwards' }}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{icons[toast.type]}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">{toast.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
            >
              <span className="sr-only">Close</span>
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
