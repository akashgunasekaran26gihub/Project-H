import React, { useState } from 'react';
import { Check, X, Sparkles, Shield, Zap, Crown, ArrowRight, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const PricingModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' or 'annual'
  const [processingTier, setProcessingTier] = useState(null);

  if (!isOpen) return null;

  const handleSimulateUpgrade = async (tierName, planId) => {
    setProcessingTier(tierName);
    try {
      // Call backend checkout session or activate plan
      await api.createCheckoutSession(planId, billingCycle);
      
      // Fire confetti celebratory burst
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
      });

      toast.success(
        `You are now upgraded to the ${tierName} plan (${billingCycle === 'annual' ? 'Annual Billing' : 'Monthly Billing'}). All limits removed!`,
        'Upgrade Successful! 🎉'
      );

      setTimeout(() => {
        setProcessingTier(null);
        onClose();
      }, 1200);
    } catch (err) {
      toast.error('Unable to initiate upgrade. Please try again.');
      setProcessingTier(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
    >
      <div className="bg-surface rounded-2xl sm:rounded-3xl border border-border shadow-2xl max-w-4xl w-full p-4 sm:p-8 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Heading */}
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-spin" />
            <span>PROJECT H PRO SUBSCRIPTION</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Elevate Your Behavioral Consistency
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
            Choose the plan that matches your goals. Unlimited habits, live AI coaching, trend analytics, and cross-device sync.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center gap-2 bg-surface-muted p-1 rounded-2xl border border-border mt-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                billingCycle === 'monthly' ? 'bg-surface text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual' ? 'bg-surface text-text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          {/* Tier 1: Starter */}
          <div className="p-5 rounded-2xl border border-border bg-surface flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-extrabold text-base text-text-primary">Starter</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Basic
                </span>
              </div>
              <p className="text-xs text-text-secondary mb-4">For casual personal habit building</p>
              
              <div className="text-3xl font-black text-text-primary mb-4">
                $0 <span className="text-xs font-normal text-text-secondary">/ forever</span>
              </div>

              <ul className="text-xs space-y-2.5 text-text-secondary">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Up to 3 active habits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Monthly spreadsheet grid</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Basic streak counting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Light / Dark mode support</span>
                </li>
              </ul>
            </div>

            <button
              disabled
              className="mt-6 w-full py-2.5 bg-surface-muted text-text-secondary text-xs font-bold rounded-xl border border-border opacity-70 cursor-not-allowed text-center"
            >
              Current Active Plan
            </button>
          </div>

          {/* Tier 2: Pro (Featured / Most Popular) */}
          <div className="p-5 rounded-2xl border-2 border-indigo-600 dark:border-indigo-500 bg-gradient-to-b from-indigo-50/50 to-surface dark:from-indigo-950/20 dark:to-surface flex flex-col justify-between relative shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-xs">
              MOST POPULAR
            </div>

            <div>
              <div className="flex items-center justify-between mb-1 mt-1">
                <h4 className="font-extrabold text-base text-text-primary flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>Pro Member</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                  Full Suite
                </span>
              </div>
              <p className="text-xs text-text-secondary mb-4">Complete behavioral operating system</p>
              
              <div className="text-3xl font-black text-text-primary mb-4">
                {billingCycle === 'annual' ? '$7' : '$9'}
                <span className="text-xs font-normal text-text-secondary">
                  / mo {billingCycle === 'annual' ? '(billed $84/yr)' : ''}
                </span>
              </div>

              <ul className="text-xs space-y-2.5 text-text-primary font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>Unlimited</strong> active habits & categories</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>AI Habit Coach</strong> (24/7 behavioral insights)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>Zen Zone</strong> (Box breathing, binaural sound)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>Productivity Expense Tracker</strong> & trends</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Data backup (JSON & CSV 1-click export)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSimulateUpgrade('Pro Member', 'pro')}
              disabled={processingTier === 'Pro Member'}
              className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {processingTier === 'Pro Member' ? (
                <span>Activating Pro Plan...</span>
              ) : (
                <>
                  <span>Upgrade to Pro</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Tier 3: Team / Enterprise */}
          <div className="p-5 rounded-2xl border border-border bg-surface flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-extrabold text-base text-text-primary">Atomic Team</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  Organizations
                </span>
              </div>
              <p className="text-xs text-text-secondary mb-4">For corporate teams and accountability squads</p>
              
              <div className="text-3xl font-black text-text-primary mb-4">
                {billingCycle === 'annual' ? '$15' : '$19'}
                <span className="text-xs font-normal text-text-secondary">/ user / mo</span>
              </div>

              <ul className="text-xs space-y-2.5 text-text-secondary">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Everything in Pro for up to 25 members</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Team accountability leaderboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Custom department habit templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Priority 24/7 SLA & dedicated support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSimulateUpgrade('Atomic Team', 'team')}
              disabled={processingTier === 'Atomic Team'}
              className="mt-6 w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {processingTier === 'Atomic Team' ? (
                <span>Setting up Team...</span>
              ) : (
                <>
                  <span>Get Team Access</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </div>

        {/* Client Guarantee & Security Banner */}
        <div className="p-4 rounded-2xl bg-surface-muted/60 border border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>30-Day Money-Back Guarantee • Cancel anytime with 1-click in settings</span>
          </div>
          <div className="flex items-center gap-3 font-semibold text-text-primary">
            <span>Stripe Secured</span>
            <span>•</span>
            <span>Instant Activation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
