import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2, ShieldCheck, Zap, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AuthScreen = () => {
  const { login, register } = useAuth();
  const toast = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        await register(name.trim(), email.trim(), password);
        toast.success(`Welcome to Project H, ${name}! Your workspace is ready.`);
      } else {
        await login(email.trim(), password);
        toast.success('Welcome back! Loading your dashboard.');
      }
    } catch (err) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Ambient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white shadow-soft mb-3">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
            Project H
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-sm mx-auto leading-relaxed">
            High-Performance Habit Tracking & Cognitive Behavioral Operating System
          </p>

          {/* Quick Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-[11px] font-semibold text-text-secondary">
            <span className="px-2 py-0.5 rounded-full bg-surface border border-border flex items-center gap-1">
              <BarChart2 className="w-3 h-3 text-emerald-600" />
              <span>Spreadsheet Grid</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface border border-border flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>AI Habit Coach</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface border border-border flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-600" />
              <span>Zen Suite</span>
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-surface rounded-3xl border border-border shadow-xl p-6 sm:p-8">
          
          {/* Segmented Control (Sign In / Register) */}
          <div className="grid grid-cols-2 p-1 bg-surface-muted rounded-2xl border border-border mb-5">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                !isRegister
                  ? 'bg-surface text-text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isRegister
                  ? 'bg-surface text-text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2">
              <span className="font-bold flex-shrink-0">✕</span>
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-text-secondary/50"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-text-secondary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-surface-muted border border-border text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-text-secondary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1 focus:outline-none transition-colors"
                  title={showPassword ? 'Hide password' : 'View password'}
                  aria-label={showPassword ? 'Hide password' : 'View password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-1.5 mt-4 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Create My Account' : 'Sign In with Email'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-text-secondary hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold cursor-pointer"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>

        {/* Security / Enterprise trust footer */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-text-secondary font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Encrypted</span>
          </span>
          <span>•</span>
          <span>Zero Third-Party Trackers</span>
          <span>•</span>
          <span>PWA Ready</span>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
