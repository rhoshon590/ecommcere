import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div id="toast-container" className="fixed bottom-20 right-4 sm:bottom-5 sm:right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map(toast => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto rounded-xl border p-4 shadow-xl flex items-start gap-3 backdrop-blur-md transition-all ${
                isSuccess
                  ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
                  : isWarning
                  ? 'bg-amber-950/90 border-amber-500/40 text-amber-100'
                  : isError
                  ? 'bg-rose-950/90 border-rose-500/40 text-rose-100'
                  : 'bg-zinc-900/95 border-zinc-700 text-zinc-100'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isWarning && <AlertCircle className="w-5 h-5 text-amber-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-sky-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold tracking-tight">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.description}</p>
                )}
              </div>

              <button
                id={`dismiss-toast-${toast.id}`}
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 text-zinc-400 hover:text-zinc-200 transition-colors p-1"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
