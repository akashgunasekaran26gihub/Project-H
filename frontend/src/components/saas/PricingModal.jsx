import React, { useState } from 'react';
import { Check, X, Sparkles, Shield, Zap, Crown } from 'lucide-react';

export const PricingModal = ({ isOpen, onClose }) => {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' or 'annual'
  const [subscribed, setSubscribed] = useState(false);

  if (!isOpen) return null;

  const handleSimulateUpgrade = (tierName) => {
    setSubscribed(true);
    setTimeout(() => {
      alert(`Success! You have activated the ${tierName} plan.`);
      setSubscribed(false);
      onClose();
    }, 1000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
    >
      <div className="bg-surface rounded-2xl sm:rounded-3xl border border-border shadow-2xl max-w-3xl w-full p-4 sm:p-8 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-muted"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Heading */}
        <div className="text-center max-w-md mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SaaS PRO SUBSCRIPTION</span>
          </div>
          <h3 className="text-2xl font-black text-text-primary tracking-tight">
            Unlock Your Full Consistency Potential
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Supercharge your personal systems with unlimited habits, advanced AI coaching, and deep trend analytics.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center gap-2 bg-surface-muted p-1 rounded-xl border border-border mt-4 text-xs font-bold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                billingCycle === 'monthly' ? 'bg-surface text-text-primary shadow-xs' : 'text-text-secondary'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual' ? 'bg-surface text-text-primary shadow-xs' : 'text-text-secondary'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Tier 1: Free Starter */}
          <div className="p-5 rounded-2xl border border-border bg-surface flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold text-sm text-text-primary">Starter</h4>
              <p className="text-[11px] text-text-secondary mb-3">For casual personal habit building</p>
              <div className="text-2xl font-black text-text-primary mb-4">$0 <span className="text-xs font-normal text-text-secondary">/ forever</span></div>

              <ul className="text-xs space-y-2 text-text-secondary">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Up to 3 active habits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Monthly spreadsheet grid</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Basic streak counting</span>
                </li>
              </ul>
            </div>

            <button
              disabled
              className="mt-6 w-full py-2 bg-surface-muted text-text-secondary text-xs font-bold rounded-xl border border-border opacity-70"
            >
              Current Basic Plan
            </button>
          </div>

          {/* Tier 2: Pro (Executive Highlighted) */}
          <div className="p-5 rounded-2xl border-2 border-slate-900 bg-surface relative shadow-2xs flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
              Most Popular
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-text-primary flex items-center gap-1.5">
                <span>Pro Member</span>
                <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
              </h4>
              <p className="text-[11px] text-text-secondary mb-3">Complete behavioral operating system</p>
              <div className="text-2xl font-black text-slate-900 mb-4">
                {billingCycle === 'annual' ? '$7' : '$9'}{' '}
                <span className="text-xs font-normal text-text-secondary">/ month</span>
              </div>

              <ul className="text-xs space-y-2 text-text-primary">
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />
                  <span>Unlimited active habits</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />
                  <span>AI Habit Coach & NLP Creator</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />
                  <span>Advanced Recharts trend series</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />
                  <span>Offline sync & PWA local cache</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <Check className="w-3.5 h-3.5 text-slate-900 flex-shrink-0" />
                  <span>Full Zen Zone relaxing tools & audio</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSimulateUpgrade('Pro Member')}
              disabled={subscribed}
              className="mt-6 w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-2xs"
            >
              {subscribed ? 'Upgrading...' : 'Activate Pro Membership'}
            </button>
          </div>

          {/* Tier 3: Lifetime Founder */}
          <div className="p-5 rounded-2xl border border-border bg-surface flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold text-sm text-text-primary">Lifetime Founder</h4>
              <p className="text-[11px] text-text-secondary mb-3">One-time payment, lifetime access</p>
              <div className="text-2xl font-black text-text-primary mb-4">$149 <span className="text-xs font-normal text-text-secondary">/ one-time</span></div>

              <ul className="text-xs space-y-2 text-text-secondary">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Everything in Pro for life</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>VIP Founder badge & flair</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Priority roadmap feature voting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Direct founder support channel</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSimulateUpgrade('Lifetime Founder')}
              disabled={subscribed}
              className="mt-6 w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              {subscribed ? 'Processing...' : 'Get Lifetime Access'}
            </button>
          </div>

        </div>

        {/* Guarantee footer */}
        <div className="mt-6 text-center text-[11px] text-text-secondary flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>14-day 100% money-back guarantee • Cancel or switch anytime</span>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
