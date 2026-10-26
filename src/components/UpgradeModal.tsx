import React, { useState } from 'react';
import { UserAccount } from '../types';
import {
  X,
  Check,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onPlanUpdated?: (user: UserAccount) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [proLink, setProLink] = useState('');
  const [empireLink, setEmpireLink] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setCheckoutError(null);
      fetch('/api/whop/config')
        .then((res) => res.json())
        .then((data) => {
          if (data.checkoutLinks?.proMonthly) setProLink(data.checkoutLinks.proMonthly);
          if (data.checkoutLinks?.empireMonthly) setEmpireLink(data.checkoutLinks.empireMonthly);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isValidWhopUrl = (targetUrl: string) => {
    try {
      const parsed = new URL(targetUrl.trim());
      return parsed.protocol === 'https:' && (parsed.hostname === 'whop.com' || parsed.hostname.endsWith('.whop.com'));
    } catch {
      return false;
    }
  };

  const handleOpenCheckout = (url: string, tierName: string) => {
    if (!url || url.trim() === '' || !isValidWhopUrl(url) || url.includes('plan_pro_growth_29')) {
      setCheckoutError(
        `Live Whop checkout URL for ${tierName} is not yet configured or is not an official https://whop.com checkout link. Please configure your live Whop checkout link in Settings or supply WHOP_${tierName === 'Pro Growth' ? 'PRO' : 'EMPIRE'}_CHECKOUT_URL in your server environment.`
      );
      return;
    }
    setCheckoutError(null);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const tiers = [
    {
      id: 'free',
      name: 'Starter Hustle',
      price: '$0',
      period: 'forever',
      description: 'Test the waters and create your first basic digital asset.',
      credits: '5 credits / day',
      features: [
        'Basic Digital Playbook generator',
        'Standard organic viral scripts',
        'Markdown copy-paste export',
        'Community access',
      ],
      cta: 'Current Active Tier',
      isCurrent: user?.plan === 'free',
      highlight: false,
    },
    {
      id: 'pro',
      name: 'Pro Growth',
      price: '$29',
      period: 'per month',
      description: 'For creators ready to generate reliable monthly passive income.',
      credits: '100 AI generation credits/mo',
      features: [
        '100 Fast AI Generation Credits',
        'Full 3-Module Playbooks + SOP Bundles',
        'Viral TikTok & Instagram Reels Scripts',
        'High-Yield Recurring Affiliate Bridge Pages',
        '1-Click Downloadable Markdown & Print PDF',
        'Whop Store sales copy & FAQ generator',
      ],
      cta: 'Checkout with Whop ($29/mo)',
      whopCheckoutUrl: proLink,
      isCurrent: user?.plan === 'pro',
      highlight: true,
    },
    {
      id: 'empire',
      name: 'Autopilot Empire',
      price: '$79',
      period: 'per month',
      description: 'High-volume generation and automated Whop store scaling.',
      credits: '500 credits / mo',
      features: [
        '500 High-Volume AI Generation Credits/mo',
        'Priority Gemini Flash High-Speed Pipeline',
        'Reseller Rights on all generated digital products',
        'Real-time Whop Webhook sync & automation',
        'Priority feature requests & VIP mastermind',
      ],
      cta: 'Checkout with Whop ($79/mo)',
      whopCheckoutUrl: empireLink,
      isCurrent: user?.plan === 'empire',
      highlight: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Official Whop Memberships</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Unlock Unlimited Autopilot Income Assets
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Select your plan. All subscriptions and payments are handled securely through Whop.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {checkoutError && (
          <div className="p-3 rounded-lg border border-amber-800/80 bg-amber-950/40 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">{checkoutError}</div>
          </div>
        )}

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {tiers.map((tier) => {
            const isSelected = tier.isCurrent;
            return (
              <div
                key={tier.id}
                className={`p-6 rounded-xl border flex flex-col justify-between transition-all ${
                  tier.highlight
                    ? 'border-cyan-500/80 bg-cyan-950/20 shadow-lg shadow-cyan-950/40 relative'
                    : 'border-neutral-800 bg-neutral-950/50'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-950 bg-cyan-400 rounded-full">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-neutral-400 mt-1 min-h-[32px]">
                    {tier.description}
                  </p>

                  <div className="my-4 pb-4 border-b border-neutral-800">
                    <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                      {tier.price}
                    </span>
                    <span className="text-xs text-neutral-400 ml-1">/{tier.period}</span>
                    <div className="text-xs text-cyan-400 font-mono mt-1">
                      {tier.credits}
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-neutral-300 mb-6">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {isSelected ? (
                    <div className="w-full py-2.5 text-xs font-semibold text-center text-neutral-400 bg-neutral-800/80 rounded-lg border border-neutral-700">
                      Current Active Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenCheckout(tier.whopCheckoutUrl || '', tier.name)}
                      className={`w-full py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                        tier.highlight
                          ? 'bg-cyan-400 hover:bg-cyan-300 text-neutral-950 shadow-md'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                      }`}
                    >
                      <span>{tier.cta}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security / Whop Guarantee Banner */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-3 text-xs text-neutral-400">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>
            Payments and memberships are managed securely through Whop. Entitlements and generation credits are activated automatically upon cryptographic webhook confirmation.
          </span>
        </div>
      </div>
    </div>
  );
};
