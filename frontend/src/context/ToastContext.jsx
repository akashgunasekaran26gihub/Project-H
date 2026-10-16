import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', title = '', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = useMemo(
    () => ({
      success: (msg, title) => addToast(msg, 'success', title),
      error: (msg, title) => addToast(msg, 'error', title),
      info: (msg, title) => addToast(msg, 'info', title),
      warning: (msg, title) => addToast(msg, 'warning', title),
      remove: removeToast,
    }),
    [addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Toast Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((item) => {
          const isSuccess = item.type === 'success';
          const isError = item.type === 'error';
          const isWarning = item.type === 'warning';

          return (
            <div
              key={item.id}
              className={`pointer-events-auto rounded-2xl p-4 shadow-xl border flex items-start gap-3 backdrop-blur-md transition-all transform translate-y-0 opacity-100 ${
                isSuccess
                  ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                  : isError
                  ? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-100'
                  : isWarning
                  ? 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                  : 'bg-slate-900/95 dark:bg-slate-800/95 border-slate-700 text-white'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-indigo-400" />}
              </div>

              <div className="flex-1 min-w-0">
                {item.title && (
                  <h4 className="font-extrabold text-xs tracking-tight mb-0.5">
                    {item.title}
                  </h4>
                )}
                <p className="text-xs leading-relaxed opacity-95">
                  {item.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(item.id)}
                className="flex-shrink-0 p-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
