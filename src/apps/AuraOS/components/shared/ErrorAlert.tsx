import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  severity?: 'error' | 'warning' | 'info';
  onDismiss?: () => void;
  retryable?: boolean;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  severity = 'error',
  onDismiss,
  retryable = false,
  onRetry,
}) => {
  const colors = {
    error: 'bg-red-900/30 border-red-700 text-red-200',
    warning: 'bg-yellow-900/30 border-yellow-700 text-yellow-200',
    info: 'bg-teal-900/30 border-teal-700 text-teal-200',
  };

  return (
    <div className={`${colors[severity]} border rounded-md p-3 text-sm flex items-start gap-2`}>
      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p>{message}</p>
        {retryable && onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Try again
          </button>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="flex-shrink-0">
          <X size={16} />
        </button>
      )}
    </div>
  );
};
