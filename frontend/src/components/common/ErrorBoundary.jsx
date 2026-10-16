import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Project H Uncaught Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-surface p-8 rounded-3xl border border-border shadow-xl">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/60 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-900">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
              Something went wrong
            </h2>
            <p className="text-xs text-text-secondary mt-2 mb-6 leading-relaxed">
              An unexpected error occurred in the dashboard interface. Your habit tracking data is safely persisted in the cloud database.
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-xs font-bold hover:opacity-90 flex items-center justify-center gap-2 transition-opacity shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Dashboard</span>
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('habit_tracker_token');
                  window.location.reload();
                }}
                className="w-full py-2.5 bg-surface-muted text-text-secondary rounded-xl text-xs font-medium hover:text-text-primary border border-border transition-colors"
              >
                Reset Session & Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
