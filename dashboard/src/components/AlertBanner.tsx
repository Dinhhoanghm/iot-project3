import React from 'react';

interface AlertBannerProps {
  type: 'warning' | 'error' | 'info';
  message: string;
  onDismiss?: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ type, message, onDismiss }) => {
  const colors = {
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    error: 'bg-red-100 border-red-400 text-red-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800',
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[type]} flex items-center justify-between`}>
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-4 font-bold hover:opacity-70"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
