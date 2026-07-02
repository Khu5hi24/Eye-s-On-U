'use client';

import React from 'react';
import { X, CheckCircle, Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useToastStore, ToastMessage } from '../store/toastStore';
import { cn } from '../utils';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none p-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    error: <AlertOctagon className="h-5 w-5 text-rose-500" />,
  };

  const bgStyles = {
    success: 'bg-emerald-50/95 border-emerald-500/30 dark:bg-emerald-950/90 dark:border-emerald-500/30',
    info: 'bg-blue-50/95 border-blue-500/30 dark:bg-blue-950/90 dark:border-blue-500/30',
    warning: 'bg-amber-50/95 border-amber-500/30 dark:bg-amber-950/90 dark:border-amber-500/30',
    error: 'bg-rose-50/95 border-rose-500/30 dark:bg-rose-950/90 dark:border-rose-500/30',
  };

  const textStyles = {
    success: 'text-emerald-900 dark:text-emerald-50',
    info: 'text-blue-900 dark:text-blue-50',
    warning: 'text-amber-900 dark:text-amber-50',
    error: 'text-rose-900 dark:text-rose-50',
  };

  return (
    <div
      className={cn(
        "glass border p-4 rounded-xl flex items-start gap-3 shadow-lg pointer-events-auto transition-all duration-300 animate-slide-in-right",
        bgStyles[toast.type]
      )}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className={cn("flex-1 text-sm font-medium leading-relaxed", textStyles[toast.type])}>
        {toast.message}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 ml-2 text-muted-foreground hover:text-foreground hover:bg-secondary/40 rounded p-1 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
