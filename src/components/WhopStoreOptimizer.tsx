import React, { useState } from 'react';
import { UserAccount, GeneratedAsset, WhopOfferAnalysisResult } from '../types';
import {
  Sparkles,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
  DollarSign,
  Layers,
  HelpCircle,
  Loader2,
  Gauge,
  Flame,
} from 'lucide-react';

interface WhopStoreOptimizerProps {
  user: UserAccount | null;
  assets: GeneratedAsset[];
  onOpenUpgrade: () => void;
  onAssetUpdated?: () => void;
}

export const WhopStoreOptimizer: React.FC<WhopStoreOptimizerProps> = ({
  user,
  assets,
  onOpenUpgrade,
  onAssetUpdated,
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [niche, setNiche] = useState('AI Productivity & Automation');
  const [pricePoint, setPricePoint] = useState<number>(39);
  const [targetAudience, setTargetAudience] = useState('Solopreneurs and remote freelancers');
  const [descriptionOrHook, setDescriptionOrHook] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<WhopOfferAnalysisResult | null>(null);
  const [copiedHookIdx, setCopiedHookIdx] = useState<number | null>(null);
  const [copiedStoreCopyIdx, setCopiedStoreCopyIdx] = useState<number | null>(null);

  // Digital product assets available for quick selection
  const productAssets = assets.filter((a) => a.type === 'digital_product');

  // Handle selecting an existing asset
  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    const found = productAssets.find((a) => a.id === assetId);
    if (found) {
      setTitle(found.title);
      setNiche(found.niche);
      setPricePoint(found.content?.suggestedPrice || 39);
      setTargetAudience(found.content?.targetAudience || 'Digital operators and entrepreneurs');
      setDescriptionOrHook(found.content?.whopSalesCopy?.headline || found.content?.subtitle || '');
    }
  };

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (user.plan === 'free' && user.credits <= 0)) {
      onOpenUpgrade();
      return;
    }

    if (!title.trim() || !niche.trim()) {
      setError('Please provide at least a product title and niche.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/optimizer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          niche,
          pricePoint,
          targetAudience,
          descriptionOrHook,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          onOpenUpgrade();
        }
        throw new Error(data.message || data.error || 'Failed to analyze offer');
      }

      setAnalysis(data.analysis);
      if (onAssetUpdated) onAssetUpdated();
    } catch (err: any) {
      setError(err.message || 'Audit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHook = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedHookIdx(idx);
    setTimeout(() => setCopiedHookIdx(null), 2000);
  };

  const handleCopyStoreCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStoreCopyIdx(idx);
    setTimeout(() => setCopiedStoreCopyIdx(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
    if (score >= 70) return 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30';
    if (score >= 55) return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/30';
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
          <span>Whop AI Conversion Radar</span>
          <span aria-hidden="true">·</span>
          <span>Offer Optimizer</span>
          <span aria-hidden="true">·</span>
          <span className="text-cyan-400 font-semibold">Trained on Top 1% Whop Sellers</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Gauge className="w-6 h-6 text-cyan-400" />
          Whop Offer & Conversion Radar
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl">
          Audit your product title, pricing elasticity, buyer friction, and hook before launching. AutoCash AI analyzes conversion bottlenecks and writes 3 high-converting rewrites ready to copy into your Whop store.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Audit Parameters
              </h2>
              <span className="text-[11px] font-mono text-neutral-400">
                Cost: 1 Credit
              </span>
            </div>

            {/* Quick Load from Existing Assets */}
            {productAssets.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Load From Your Products
                </label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => handleSelectAsset(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Choose a product or enter custom --</option>
                  {productAssets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (${p.content?.suggestedPrice || 39})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleRunAudit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Product / Offer Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Automated Notion Solopreneur Playbook"
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Niche / Category *
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. AI Automation"
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Retail Price ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-neutral-500 font-mono">
                      $
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      value={pricePoint}
                      onChange={(e) => setPricePoint(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-7 pr-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Remote freelancers & creators"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Current Pitch Hook / Subtitle (Optional)
                </label>
                <textarea
                  rows={2}
                  value={descriptionOrHook}
                  onChange={(e) => setDescriptionOrHook(e.target.value)}
                  placeholder="e.g. Stop wasting 20 hours a week on manual spreadsheets..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg border border-rose-900/50 bg-rose-950/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Running Deep Conversion Audit...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Run Whop Conversion Audit</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Audit Results & Rewrites (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {analysis ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Score & Verdict Card */}
              <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                  <div className="flex items-center gap-4">
                    {/* Visual Score Badge */}
                    <div
                      className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center font-bold ${getScoreColor(
                        analysis.overallScore
                      )}`}
                    >
                      <span className="text-2xl font-mono leading-none">
                        {analysis.overallScore}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-sans mt-0.5">
                        Grade {analysis.conversionGrade}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                        <span>Whop Conversion Index</span>
                        <span>·</span>
                        <span className="text-emerald-400 font-semibold">Audit Passed</span>
                      </div>
                      <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                        {title}
                      </h3>
                    </div>
                  </div>

                  {/* Price Optimization Callout */}
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-right sm:min-w-[160px]">
                    <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
                      Optimal Price Point
                    </div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">
                      ${analysis.priceOptimization.recommendedPrice} USD
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                      {analysis.priceOptimization.estimatedLift}
                    </div>
                  </div>
                </div>

                {/* Verdict Summary */}
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {analysis.verdictSummary}
                </p>

                {/* Strengths & Friction Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Conversion Strengths
                    </span>
                    <ul className="space-y-1.5 text-xs text-neutral-300">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Buyer Friction Bottlenecks
                    </span>
                    <ul className="space-y-1.5 text-xs text-neutral-300">
                      {analysis.frictionPoints.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 3 High-Converting Rewritten Hooks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    3 High-Converting Rewritten Angles
                  </h3>
                  <span className="text-xs text-neutral-400 font-mono">
                    Ready to copy into Whop
                  </span>
                </div>

                <div className="space-y-4">
                  {analysis.rewrittenHooks.map((hook, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                          Angle 0{idx + 1}: {hook.angle}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyHook(hook.headline, idx)}
                            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
                          >
                            {copiedHookIdx === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Hook</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleCopyStoreCopy(hook.whopStoreCopy, idx)}
                            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 transition-colors font-medium"
                          >
                            {copiedStoreCopyIdx === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Whop Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white">
                        {hook.headline}
                      </h4>
                      <p className="text-xs text-neutral-400">
                        {hook.subhook}
                      </p>

                      <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 text-xs text-neutral-300 leading-relaxed font-sans">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">
                          Whop Product Listing Description:
                        </span>
                        {hook.whopStoreCopy}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 text-neutral-500">
                        <span className="font-mono">Recommended CTA:</span>
                        <span className="text-emerald-400 font-semibold font-mono">
                          {hook.ctaButton}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tactical Quick Win Checklist */}
              {analysis.quickWinChecklist && analysis.quickWinChecklist.length > 0 && (
                <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                    Pre-Launch Whop Store Checklist
                  </h4>
                  <div className="space-y-2">
                    {analysis.quickWinChecklist.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 text-xs text-neutral-300 p-2 rounded-lg bg-neutral-950 border border-neutral-800/60"
                      >
                        <span className="font-mono text-cyan-400 font-bold">0{i + 1}.</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="p-12 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 text-center space-y-4 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
                <Gauge className="w-7 h-7 text-cyan-500/70" />
              </div>
              <div className="max-w-md">
                <h3 className="text-base font-bold text-white">
                  No Active Offer Audit
                </h3>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                  Select one of your existing products from the left or enter a custom offer to receive a conversion score, pricing recommendations, and 3 high-converting rewritten hooks.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
