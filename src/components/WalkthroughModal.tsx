import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Zap } from 'lucide-react';
import { GUIDE_STEPS } from '../guideSteps';

export const WALKTHROUGH_SEEN_KEY = 'autocash_walkthrough_seen_v1';

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
}

export const markWalkthroughSeen = () => {
  try {
    localStorage.setItem(WALKTHROUGH_SEEN_KEY, '1');
  } catch {}
};

export const hasSeenWalkthrough = (): boolean => {
  try {
    return localStorage.getItem(WALKTHROUGH_SEEN_KEY) === '1';
  } catch {
    return true; // If storage is unavailable, don't nag on every load.
  }
};

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  if (!isOpen) return null;

  const step = GUIDE_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === GUIDE_STEPS.length - 1;

  const finish = () => {
    markWalkthroughSeen();
    setStepIndex(0);
    onClose();
  };

  const handleAction = (tab: string) => {
    finish();
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl shadow-cyan-950/40 overflow-hidden flex max-h-[92dvh] flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span className="uppercase tracking-wider font-semibold text-cyan-400">
              Getting Started
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Step {stepIndex + 1} of {GUIDE_STEPS.length}
            </span>
          </div>
          <button
            onClick={finish}
            className="text-neutral-500 hover:text-white transition-colors"
            aria-label="Close walkthrough"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4 overflow-y-auto">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {step.title}
          </h2>
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
              onClick={() => handleAction(step.action!.tab)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-cyan-400 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-900/60 rounded-lg transition-colors"
            >
              {step.action.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Footer: progress + navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-950/60 shrink-0">
          <div className="flex items-center gap-1.5">
            {GUIDE_STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStepIndex(i)}
                aria-label={`Go to step ${i + 1}: ${s.title}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex
                    ? 'w-6 bg-cyan-400'
                    : i < stepIndex
                    ? 'w-3 bg-cyan-800'
                    : 'w-3 bg-neutral-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isFirst ? (
              <button
                onClick={finish}
                className="px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Skip tour
              </button>
            ) : (
              <button
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            )}
            {isLast ? (
              <button
                onClick={finish}
                className="px-4 py-2 text-xs font-bold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
              >
                Done
              </button>
            ) : (
              <button
                onClick={() => setStepIndex((i) => Math.min(GUIDE_STEPS.length - 1, i + 1))}
                className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
