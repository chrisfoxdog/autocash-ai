import React, { useState } from 'react';
import { UserAccount, GeneratedAsset } from '../types';
import {
  Video,
  Sparkles,
  Copy,
  Check,
  Share2,
  Clock,
  MessageSquare,
  Hash,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { TeleprompterModal } from './TeleprompterModal';
import { AIPersonaSelector } from './AIPersonaSelector';
import { AIPersonaId } from '../types';

interface ViralTrafficGeneratorProps {
  user: UserAccount | null;
  onAssetCreated: (asset: GeneratedAsset) => void;
  onOpenUpgrade: () => void;
  selectedAsset?: GeneratedAsset | null;
}

export const ViralTrafficGenerator: React.FC<ViralTrafficGeneratorProps> = ({
  user,
  onAssetCreated,
  onOpenUpgrade,
  selectedAsset,
}) => {
  const [niche, setNiche] = useState('AI Automation & Online Income');
  const [productName, setProductName] = useState('The $0 to $5K/Mo Notion & AI Systems Playbook');
  const [platform, setPlatform] = useState<'reels_tiktok' | 'x_thread' | 'whop_post'>('reels_tiktok');
  const [hookStyle, setHookStyle] = useState<'curiosity' | 'contrarian' | 'urgency_fomo' | 'zero_to_hero'>('zero_to_hero');
  const [callToAction, setCallToAction] = useState('Comment PLAYBOOK or click the Whop link in bio for instant access');
  const [aiPersona, setAiPersona] = useState<AIPersonaId>('aggressive_salesman');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<any>(
    selectedAsset && selectedAsset.type === 'viral_script' ? selectedAsset.content : null
  );
  const [copied, setCopied] = useState(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);

  const lastLoadedIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (selectedAsset && selectedAsset.type === 'viral_script' && selectedAsset.id !== lastLoadedIdRef.current) {
      lastLoadedIdRef.current = selectedAsset.id;
      setActiveResult(selectedAsset.content);
      setNiche(selectedAsset.niche);
    }
  }, [selectedAsset]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (user.plan === 'free' && user.credits <= 0)) {
      onOpenUpgrade();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/assets/generate-viral-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          productName,
          platform,
          hookStyle,
          callToAction,
          aiPersona,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          onOpenUpgrade();
        }
        throw new Error(data.message || data.error || 'Failed to generate script');
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
          <span>Income Stream 02</span>
          <span aria-hidden="true">·</span>
          <span>Zero-Ad-Spend Funnels</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400 font-medium">Organic Conversions</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Viral Social Traffic & Hook Engine
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl">
          Generate scroll-stopping TikTok, Instagram Reels, and X/Twitter scripts engineered to stop the scroll, build retention, and funnel organic viewers directly into your Whop checkout link.
        </p>
      </div>

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
                label="Hook & Script AI Persona"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Channel / Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'reels_tiktok', label: 'TikTok / Reels' },
                  { id: 'x_thread', label: 'X Thread' },
                  { id: 'whop_post', label: 'Whop Post' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPlatform(item.id as any)}
                    className={`py-2 px-2 text-xs font-medium rounded-md border text-center transition-colors ${
                      platform === item.id
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
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
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Product Name / Offer Being Promoted
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                placeholder="e.g. The $0 to $5K Notion Systems Playbook"
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Viral Hook Psychological Angle
              </label>
              <select
                value={hookStyle}
                onChange={(e: any) => setHookStyle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="zero_to_hero">Zero To Hero ("I was completely broke with $0...")</option>
                <option value="contrarian">Contrarian ("Stop doing dropshipping or crypto in 2026...")</option>
                <option value="curiosity">High Curiosity ("The secret tool millionaires hide...")</option>
                <option value="urgency_fomo">Urgency / Opportunity Window ("This window closes soon...")</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Conversion Call-to-Action (CTA)
              </label>
              <input
                type="text"
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-emerald-500"
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Viral Script...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Viral Script (1 Credit)
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-800/80 text-xs text-neutral-400 space-y-1">
            <span className="font-semibold text-neutral-200">The 2026 Algorithm Rule:</span>
            <p className="text-[11px] text-neutral-500">
              Never pitch in the first 10 seconds. Hook hard on an emotion, deliver fast actionable insight in 30 seconds, then direct them to your bio link on Whop.
            </p>
          </div>
        </div>

        {/* Script Display Output */}
        <div className="lg:col-span-7">
          {activeResult ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
              <div className="p-5 border-b border-neutral-800 bg-neutral-900/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-emerald-400">
                    SCRIPT READY FOR PRODUCTION
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Viral Conversion Breakdown
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsTeleprompterOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors shadow-sm"
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>Teleprompter Mode</span>
                  </button>

                  <button
                    onClick={() =>
                      handleCopy(
                        `HOOK:\n${activeResult.hook}\n\nSCRIPT:\n${activeResult.mainScript}\n\nCTA:\n${activeResult.callToActionScript}\n\nPINNED COMMENT:\n${activeResult.pinnedComment}`
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-neutral-950" />
                        <span>Copied Script</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy All</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[600px] overflow-y-auto space-y-6">
                {/* 3-Second Scroll Stopping Hook */}
                <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      First 3-Second Hook
                    </span>
                    <button
                      onClick={() => handleCopy(activeResult.hook)}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      Copy hook
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-white leading-snug">
                    "{activeResult.hook}"
                  </p>

                  {activeResult.hookVariations && (
                    <div className="pt-2 border-t border-emerald-900/40 space-y-1">
                      <span className="text-[11px] text-neutral-400 font-medium">
                        Alternative Hooks To A/B Test:
                      </span>
                      {activeResult.hookVariations.map((alt: string, i: number) => (
                        <p key={i} className="text-xs text-neutral-300 italic">
                          · "{alt}"
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visual Direction / Camera Setup */}
                {activeResult.visualDirection && (
                  <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5 text-xs">
                    <span className="font-semibold text-cyan-400 uppercase tracking-wider text-[11px]">
                      Director's Visual & Camera Notes
                    </span>
                    <p className="text-neutral-300 leading-relaxed">
                      {activeResult.visualDirection}
                    </p>
                  </div>
                )}

                {/* Spoken Word / Main Script */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                      Main Video / Thread Script
                    </span>
                    <button
                      onClick={() => handleCopy(activeResult.mainScript)}
                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy Script
                    </button>
                  </div>
                  <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 whitespace-pre-line leading-relaxed font-mono">
                    {activeResult.mainScript}
                  </div>
                </div>

                {/* Conversion Call-to-Action */}
                <div className="p-4 rounded-lg bg-cyan-950/30 border border-cyan-900/50 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    High-Converting CTA (Spoken & On-Screen)
                  </span>
                  <p className="text-xs text-white font-medium">
                    {activeResult.callToActionScript}
                  </p>
                </div>

                {/* Pinned Comment Strategy */}
                {activeResult.pinnedComment && (
                  <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Pinned Comment For Direct Whop Link
                      </span>
                      <button
                        onClick={() => handleCopy(activeResult.pinnedComment)}
                        className="text-[11px] text-neutral-400 hover:text-white"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-neutral-300 font-mono text-[11px]">
                      {activeResult.pinnedComment}
                    </p>
                  </div>
                )}

                {/* Trending Audio & Hashtags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {activeResult.recommendedAudioStyle && (
                    <div className="p-3 rounded bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-400 block mb-1 text-[11px]">
                        Recommended Audio:
                      </span>
                      <span className="text-white font-medium">
                        {activeResult.recommendedAudioStyle}
                      </span>
                    </div>
                  )}

                  {activeResult.hashtags && (
                    <div className="p-3 rounded bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-400 block mb-1 text-[11px]">
                        Targeted Hashtags:
                      </span>
                      <span className="text-emerald-400 font-mono">
                        {activeResult.hashtags.join(' ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30">
              <Video className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white">
                No Viral Script Generated Yet
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Select your niche and hook style to produce a conversion-optimized script driving organic views directly to your Whop product.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Vertical Video Teleprompter Studio */}
      {activeResult && (
        <TeleprompterModal
          script={activeResult}
          isOpen={isTeleprompterOpen}
          onClose={() => setIsTeleprompterOpen(false)}
        />
      )}
    </div>
  );
};
