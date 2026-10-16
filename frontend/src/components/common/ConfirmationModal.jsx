import React from 'react';
import { AlertTriangle, Trash2, HelpCircle, X } from 'lucide-react';

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-surface rounded-2xl sm:rounded-3xl border border-border shadow-2xl max-w-sm w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
              isDanger
                ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-400'
                : isWarning
                ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-900 dark:text-amber-400'
                : 'bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-900 dark:text-indigo-400'
            }`}
          >
            {isDanger ? (
              <Trash2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <h3 className="font-extrabold text-base text-text-primary">
            {title}
          </h3>
          <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="py-2.5 px-4 rounded-xl border border-border bg-surface hover:bg-surface-muted text-text-primary text-xs font-bold transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`py-2.5 px-4 rounded-xl text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-xs ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
