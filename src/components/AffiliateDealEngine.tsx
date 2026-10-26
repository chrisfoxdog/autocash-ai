import React, { useState, useEffect } from 'react';
import { UserAccount, GeneratedAsset, AffiliateProgram, AIPersonaId } from '../types';
import {
  Share2,
  Sparkles,
  Copy,
  Check,
  DollarSign,
  CheckCircle2,
  Mail,
  Gift,
  ArrowRight,
  Loader2,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Award,
} from 'lucide-react';
import { AIPersonaSelector } from './AIPersonaSelector';

interface AffiliateDealEngineProps {
  user: UserAccount | null;
  onAssetCreated: (asset: GeneratedAsset) => void;
  onOpenUpgrade: () => void;
  selectedAsset?: GeneratedAsset | null;
}

export const AffiliateDealEngine: React.FC<AffiliateDealEngineProps> = ({
  user,
  onAssetCreated,
  onOpenUpgrade,
  selectedAsset,
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'generator'>('directory');
  const [programs, setPrograms] = useState<AffiliateProgram[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  const [niche, setNiche] = useState('Creator Subscriptions & Monetization');
  const [productOrCategory, setProductOrCategory] = useState('Whop Creator Marketplace & Community Engine');
  const [commissionType, setCommissionType] = useState('Up to 30% Recurring Creator Fee Cut');
  const [targetPainPoint, setTargetPainPoint] = useState('High platform fees on Shopify/Teachable and complicated payment gateways');
  const [aiPersona, setAiPersona] = useState<AIPersonaId>('aggressive_salesman');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<any>(
    selectedAsset && selectedAsset.type === 'affiliate_bridge' ? selectedAsset.content : null
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/affiliate-directory')
      .then((res) => res.json())
      .then((data) => {
        setPrograms(data.programs || []);
        setLoadingPrograms(false);
      })
      .catch((err) => {
        console.error('Failed to load affiliate directory:', err);
        setLoadingPrograms(false);
      });
  }, []);

  const lastLoadedIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (selectedAsset && selectedAsset.type === 'affiliate_bridge' && selectedAsset.id !== lastLoadedIdRef.current) {
      lastLoadedIdRef.current = selectedAsset.id;
      setActiveResult(selectedAsset.content);
      setNiche(selectedAsset.niche);
      setActiveTab('generator');
    }
  }, [selectedAsset]);

  const handleSelectProgram = (prog: AffiliateProgram) => {
    setNiche(prog.category);
    setProductOrCategory(prog.name);
    setCommissionType(prog.commission);
    setTargetPainPoint(prog.bestAngle);
    setActiveTab('generator');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (user.plan === 'free' && user.credits <= 0)) {
      onOpenUpgrade();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/assets/generate-affiliate-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          productOrCategory,
          commissionType,
          targetPainPoint,
          aiPersona,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          onOpenUpgrade();
        }
        throw new Error(data.message || data.error || 'Failed to generate affiliate bridge');
      }

      setActiveResult(data.asset.content);
      onAssetCreated(data.asset);
    } catch (err: any) {
      setError(err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
          <span>Income Stream 03</span>
          <span aria-hidden="true">·</span>
          <span>Monthly Recurring Commissions</span>
          <span aria-hidden="true">·</span>
          <span className="text-blue-400 font-medium">True Autopilot Yield</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Recurring Affiliate Programs & Bridge Engine
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl">
          Promote verified software tools that pay you 20% to 50% lifetime monthly recurring revenue. One referral equals passive monthly income deposited directly to your bank account.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'directory'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Award className="h-4 w-4" />
          Verified Programs Directory ({programs.length})
        </button>

        <button
          onClick={() => setActiveTab('generator')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'generator'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Bridge Page & Email Generator
        </button>
      </div>

      {/* Directory Tab View */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((prog) => (
              <div
                key={prog.id}
                className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-blue-400 font-medium">{prog.category}</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {prog.commission}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5">
                    {prog.name}
                  </h3>

                  <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                    {prog.description}
                  </p>

                  <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80 text-[11px] space-y-1 mb-4">
                    <div className="text-neutral-400">
                      <strong>Target Audience:</strong> {prog.targetAudience}
                    </div>
                    <div className="text-neutral-400">
                      <strong>Avg Payout:</strong>{' '}
                      <span className="text-emerald-400 font-mono font-medium">
                        {prog.avgMonthlyPerUser}
                      </span>
                    </div>
                    <div className="text-neutral-400">
                      <strong>Cookie Window:</strong> {prog.cookieDuration}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <button
                    onClick={() => handleSelectProgram(prog)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-md"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Build Bridge Page & Email
                  </button>

                  <a
                    href={prog.officialSignupUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1 text-[11px] text-neutral-400 hover:text-white flex items-center justify-center gap-1"
                  >
                    Official Affiliate Portal <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generator Tab View */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Generator Form */}
          <div className="lg:col-span-5 p-6 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-5">
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* AI Persona Selector */}
              <div className="pb-3 border-b border-neutral-800">
                <AIPersonaSelector
                  selectedPersona={aiPersona}
                  onSelectPersona={setAiPersona}
                  compact={true}
                  label="Review & Bridge AI Persona"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Market Niche
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Software Category or Target Product
                </label>
                <input
                  type="text"
                  value={productOrCategory}
                  onChange={(e) => setProductOrCategory(e.target.value)}
                  required
                  placeholder="e.g. Whop Creator Platform or GoHighLevel CRM"
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Commission Structure Target
                </label>
                <input
                  type="text"
                  value={commissionType}
                  onChange={(e) => setCommissionType(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Customer Problem / Pain Point & Pitch Angle
                </label>
                <input
                  type="text"
                  value={targetPainPoint}
                  onChange={(e) => setTargetPainPoint(e.target.value)}
                  required
                  placeholder="e.g. High platform fees on Shopify or paying for 5 separate tools"
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {error && (
                <div className="p-3 text-xs text-rose-400 bg-rose-950/30 border border-rose-900 rounded-md">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Recurring Asset...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Build Recurring Deal Asset (1 Credit)
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-neutral-800/80 text-xs text-neutral-400 space-y-1">
              <span className="font-semibold text-neutral-200">The Power of Recurring Math:</span>
              <p className="text-[11px] text-neutral-500">
                10 active users referred at $40/month commission = $400/mo guaranteed cashflow every month without any customer support.
              </p>
            </div>
          </div>

          {/* Display Output */}
          <div className="lg:col-span-7">
            {activeResult ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
                <div className="p-5 border-b border-neutral-800 bg-neutral-900/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
                      <span>Recurring Model</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {activeResult.commissionEstimate || commissionType}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                      {activeResult.pageTitle}
                    </h3>
                  </div>

                  <button
                    onClick={() =>
                      handleCopy(
                        `# ${activeResult.pageTitle}\n\n${activeResult.executiveSummary}\n\n## Bridge Email:\nSubject: ${activeResult.emailBridgeTemplate?.subjectLine}\n${activeResult.emailBridgeTemplate?.body}\n\n## Whop Bonus Strategy:\n${activeResult.whopBonusBundleIdea}`
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Bridge
                      </>
                    )}
                  </button>
                </div>

                <div className="p-6 max-h-[600px] overflow-y-auto space-y-6">
                  {/* Executive Summary */}
                  <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      Review Headline & Angle
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {activeResult.keyBenefitHeadline}
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {activeResult.executiveSummary}
                    </p>
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-2">
                      <span className="text-xs font-semibold text-emerald-400">
                        Why It Converts (Pros):
                      </span>
                      <ul className="space-y-1.5 text-xs text-neutral-300">
                        {activeResult.pros?.map((pro: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                      <span className="text-xs font-semibold text-neutral-400">
                        Honest Reality Check:
                      </span>
                      <ul className="space-y-1.5 text-xs text-neutral-400">
                        {activeResult.cons?.map((con: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-neutral-500 font-mono">·</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Whop Bonus Bundle Incentive */}
                  {activeResult.whopBonusBundleIdea && (
                    <div className="p-4 rounded-lg bg-cyan-950/30 border border-cyan-900/60 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                        <Gift className="h-4 w-4" />
                        <span>The "Double-Conversion" Whop Bonus Incentive</span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {activeResult.whopBonusBundleIdea}
                      </p>
                      <p className="text-[11px] text-cyan-300/80 italic">
                        Offer your customer: "Sign up through my link and get my $39 Whop Playbook completely free!" This turns a 2% conversion rate into 10%+.
                      </p>
                    </div>
                  )}

                  {/* High Converting Email Blast Template */}
                  {activeResult.emailBridgeTemplate && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-blue-400" />
                          Conversational Bridge Email
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(
                              `Subject: ${activeResult.emailBridgeTemplate.subjectLine}\n\n${activeResult.emailBridgeTemplate.body}`
                            )
                          }
                          className="text-xs text-blue-400 hover:underline"
                        >
                          Copy Email
                        </button>
                      </div>
                      <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-2 font-mono whitespace-pre-line">
                        <div className="font-semibold text-white">
                          Subject: {activeResult.emailBridgeTemplate.subjectLine}
                        </div>
                        <div className="text-neutral-300 pt-2 border-t border-neutral-800">
                          {activeResult.emailBridgeTemplate.body}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30">
                <Share2 className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white">
                  No Recurring Deal Bridge Created Yet
                </h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  Pick a program from the directory or enter your target software on the left to build a high-converting affiliate bridge page and email template.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
