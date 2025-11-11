import React from 'react';
import Toast from './Toast.tsx';
import { ToastMessage } from '../contexts/ToastContext.tsx';

type ToastContainerProps = {
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;