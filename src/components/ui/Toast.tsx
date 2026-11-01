import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { NotificationType } from '../../hooks/useNotification';

interface ToastProps {
  type: NotificationType;
  title: string;
  message?: string;
  onDismiss: () => void;
}

const icons: Record<NotificationType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles: Record<NotificationType, string> = {
  success: 'border-l-green-500 bg-green-50',
  error: 'border-l-red-500 bg-red-50',
  warning: 'border-l-yellow-500 bg-yellow-50',
  info: 'border-l-blue-500 bg-blue-50',
};

const iconColors: Record<NotificationType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export function Toast({ type, title, message, onDismiss }: ToastProps) {
  const Icon = icons[type];
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg ${styles[type]}`}>
      <Icon size={20} className={`mt-0.5 ${iconColors[type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {message && <p className="text-sm text-gray-600 mt-0.5">{message}</p>}
      </div>
      <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
        <X size={16} />
      </button>
    </div>
  );
}
