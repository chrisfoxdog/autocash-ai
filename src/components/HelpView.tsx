import React, { useEffect, useState } from 'react';
import { UserAccount, WhopConfig } from '../types';
import { GUIDE_STEPS } from '../guideSteps';
import {
  BookOpen,
  Check,
  PlayCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface HelpViewProps {
  user: UserAccount | null;
  setActiveTab: (tab: string) => void;
  onOpenWalkthrough: () => void;
}

const PLAN_ORDER = ['free', 'starter', 'pro', 'founders'] as const;

export const HelpView: React.FC<HelpViewProps> = ({
  user,
  setActiveTab,
  onOpenWalkthrough,
}) => {
  const [tierFeatures, setTierFeatures] = useState<WhopConfig['tierFeatures'] | null>(null);

  useEffect(() => {
    fetch('/api/whop/config')
      .then((res) => res.json())
      .then((data) => {
        if (data?.tierFeatures) setTierFeatures(data.tierFeatures);
      })
      .catch(console.error);
  }, []);

  const resetLabel = (() => {
    if (!user?.creditsResetAt) return null;
    const d = new Date(user.creditsResetAt);
    return isNaN(d.getTime())
      ? null
      : d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  })();

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>How to Use AutoCash AI</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          The short guide to getting real work out of the app
        </h1>
        <p className="text-sm text-neutral-400 leading-relaxed max-w-2xl">
          Five short sections: what the app does, how credits work, how to generate
          content step by step, where your work is saved, and what to do next.
        </p>
        <button
          onClick={onOpenWalkthrough}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs rounded-lg transition-colors shadow-lg shadow-cyan-950/50"
        >
          <PlayCircle className="h-4 w-4" />
          Replay the guided tour
        </button>
      </div>

      {/* Your balance right now */}
      {user && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 rounded-xl border border-cyan-900/60 bg-cyan-950/20 text-sm">
          <span className="flex items-center gap-1.5 text-neutral-200">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span className="font-mono font-bold text-white">{user.credits}</span>
            credits remaining
          </span>
          <span className="text-neutral-400 capitalize">
            Plan: <span className="text-white font-medium">{user.plan === 'free' ? 'Free Trial' : user.plan}</span>
          </span>
          {resetLabel && (
            <span className="text-neutral-400">
              Credits refresh: <span className="text-white font-medium">{resetLabel}</span>
            </span>
          )}
        </div>
      )}

      {/* Guide sections */}
      {GUIDE_STEPS.map((step, i) => (
        <section
          key={step.id}
          className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-3"
        >
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
            <span>Section {i + 1}</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">{step.title}</h2>
          <p className="text-sm text-neutral-300 leading-relaxed">{step.intro}</p>
          <ul className="space-y-2">
            {step.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2.5 text-sm text-neutral-400 leading-relaxed">
                <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          {step.action && (
            <button
              onClick={() => setActiveTab(step.action!.tab)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:underline"
            >
              {step.action.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </section>
      ))}

      {/* Credits by plan — live values from the server config */}
      {tierFeatures && (
        <section className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Credits by plan</h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Every generation costs 1 credit on every plan. Plans and billing are
            handled by your Whop membership — AutoCash AI never charges your card itself.
          </p>
          <div className="border border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800 text-xs">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Plan</th>
                  <th className="py-2.5 px-4 font-medium">Price</th>
                  <th className="py-2.5 px-4 font-medium text-right">Credits per period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {PLAN_ORDER.map((key) => {
                  const tier = tierFeatures[key];
                  if (!tier) return null;
                  const isCurrent = user?.plan === key;
                  return (
                    <tr key={key} className={isCurrent ? 'bg-cyan-950/20' : ''}>
                      <td className="py-3 px-4 font-medium text-white">
                        {tier.name}
                        {isCurrent && (
                          <span className="ml-2 text-[10px] font-mono font-bold text-cyan-400 uppercase">
                            Your plan
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-neutral-300 font-mono tabular-nums">
                        {tier.price === 0 ? 'Free' : `$${tier.price}`}
                      </td>
                      <td className="py-3 px-4 text-right text-neutral-200 font-mono tabular-nums">
                        {tier.credits}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Honest note */}
      <div className="flex gap-3 p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40">
        <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-xs text-neutral-400 leading-relaxed">
          <span className="font-semibold text-neutral-200">A straight note on what this app is: </span>
          AutoCash AI drafts content and organizes your workflow so routine writing
          takes minutes instead of an afternoon. It does not run your store, post
          for you, or guarantee sales or income — what you earn depends on your
          offer, your audience, and the work you put in after the draft.
        </p>
      </div>
    </div>
  );
};
