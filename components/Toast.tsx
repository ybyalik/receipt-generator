import { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertCircle, FiX } from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <FiCheckCircle className="text-green-500" size={20} />,
    error: <FiXCircle className="text-red-500" size={20} />,
    info: <FiInfo className="text-teal-500" size={20} />,
    warning: <FiAlertCircle className="text-yellow-500" size={20} />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-teal-50 border-teal-200',
    warning: 'bg-yellow-50 border-yellow-200',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgColors[type]} animate-slide-in`}
      role="alert"
    >
      {icons[type]}
      <p className="flex-1 text-sm font-medium text-gray-900">{message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        aria-label="Close"
      >
        <FiX size={16} />
      </button>
    </div>
  );
}
