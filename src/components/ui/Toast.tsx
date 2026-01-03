
import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-dismiss after 4 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const isSuccess = type === 'success';

  const baseClasses = 'fixed bottom-5 right-5 z-50 flex items-center p-4 w-full max-w-xs rounded-lg shadow-lg';
  const typeClasses = isSuccess 
    ? 'bg-matrix/20 border border-matrix text-matrix' 
    : 'bg-alert/20 border border-alert text-alert';
  
  const Icon = isSuccess ? CheckCircle : AlertTriangle;

  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
        <Icon className="w-5 h-5" />
      </div>
      <div className="ms-3 text-sm font-normal">{message}</div>
      <button 
        type="button" 
        className="ms-auto -mx-1.5 -my-1.5 p-1.5 inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-300" 
        onClick={onClose} 
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
