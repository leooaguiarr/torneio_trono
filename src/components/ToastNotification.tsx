import React, { useEffect } from 'react';
import { Check, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'info' | 'warning';
  title: string;
  message?: string;
  emoji?: string;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100%-2rem)] pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white border-2 border-stone-900 rounded-2xl p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-3 animate-in slide-in-from-top-3 duration-200"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl shrink-0">{toast.emoji || '🎉'}</span>
            <div className="min-w-0">
              <p className="font-['Outfit',sans-serif] font-black text-xs sm:text-sm text-stone-950 truncate">
                {toast.title}
              </p>
              {toast.message && (
                <p className="text-[11px] font-bold text-stone-600 truncate mt-0.5">
                  {toast.message}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 rounded-lg text-stone-500 hover:text-stone-950 hover:bg-stone-100 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      ))}
    </div>
  );
};
