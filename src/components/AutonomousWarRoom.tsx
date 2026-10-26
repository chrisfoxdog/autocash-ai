import React, { useState, useEffect } from 'react';
import { UserAccount, GeneratedAsset } from '../types';
import {
  Zap,
  Terminal,
  Volume2,
  VolumeX,
  Sparkles,
  TrendingUp,
  Package,
  Video,
  Share2,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  DollarSign,
  ShieldCheck,
  BookOpen,
  Code2,
  ExternalLink,
  Flame,
  Radio,
} from 'lucide-react';
import { DeliverableReaderModal } from './DeliverableReaderModal';
import { TeleprompterModal } from './TeleprompterModal';
import { WhopListingModal } from './WhopListingModal';
import { AIPersonaSelector } from './AIPersonaSelector';
import { AIPersonaId } from '../types';

interface AutonomousWarRoomProps {
  user: UserAccount | null;
  assets: GeneratedAsset[];
  onAssetCreated: (asset: GeneratedAsset) => void;
  onOpenUpgrade: () => void;
}

export const AutonomousWarRoom: React.FC<AutonomousWarRoomProps> = ({
  user,
  assets,
  onAssetCreated,
  onOpenUpgrade,
}) => {
  // Autonomous Generator State
  const [selectedNiche, setSelectedNiche] = useState('AI Automation & Workflow Systems');
  const [customTopic, setCustomTopic] = useState('');
  const [pricePoint, setPricePoint] = useState<number>(47);
  const [aiPersona, setAiPersona] = useState<AIPersonaId>('aggressive_salesman');
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStage, setLaunchStage] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [launchedBundle, setLaunchedBundle] = useState<any | null>(null);

  // Sound Synthesizer (Web Audio API)
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals
  const [activeDeliverableAsset, setActiveDeliverableAsset] = useState<GeneratedAsset | null>(null);
  const [teleprompterScript, setTeleprompterScript] = useState<any | null>(null);
  const [listingModalAssetId, setListingModalAssetId] = useState<string | null>(null);

  // Widget Copy State
  const [copiedWidget, setCopiedWidget] = useState(false);

  // Authenticated User Engine Activity
  const recentUserActivities = React.useMemo(() => {
    if (!assets || assets.length === 0) return [];
    return assets.slice(0, 5).map((asset) => {
      const date = new Date(asset.createdAt);
      const isToday = new Date().toDateString() === date.toDateString();
      const timeStr = isToday
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });

      let typeBadge = 'asset';
      let icon = '⚡';
      let label = 'Asset Generated';
      let valuation = 'Deliverable';

      if (asset.type === 'digital_product') {
        typeBadge = 'product';
        icon = '📦';
        label = 'Digital Product Guide';
        valuation = asset.content?.suggestedPrice ? `$${asset.content.suggestedPrice} List` : 'Playbook';
      } else if (asset.type === 'viral_script') {
        typeBadge = 'viral';
        icon = '🎬';
        label = 'Viral Video Script';
        valuation = 'Marketing Kit';
      } else if (asset.type === 'affiliate_bridge') {
        typeBadge = 'affiliate';
        icon = '🔗';
        label = 'Affiliate Bridge Page';
        valuation = 'Recurring Deal';
      }

      return {
        id: asset.id,
        title: asset.title,
        label,
        niche: asset.niche,
        time: timeStr,
        type: typeBadge,
        icon,
        valuation,
        rawAsset: asset,
      };
    });
  }, [assets]);

  // Audio synthesizer function for real launch completion chime
  const playCashChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // First chime tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.6);

      // Higher metallic harmonic tone
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1318.51, ctx.currentTime); // E6
        gain2.gain.setValueAtTime(0.15, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.7);
      }, 100);
    } catch (e) {
      // AudioContext policy suppression fallback
    }
  };

  const nicheOptions = [
    'AI Automation & Workflow Systems',
    'Faceless TikTok & Reels Cashflow',
    'Notion Solopreneur Operating Systems',
    'Crypto DeFi Yield & Airdrop Farming',
    'High-Ticket B2B Lead Generation',
    'Recurring SaaS Affiliate Machine',
  ];

  const handleLaunchAutonomousBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (user.plan === 'free' && user.credits <= 0)) {
      onOpenUpgrade();
      return;
    }

    setIsLaunching(true);
    setLaunchedBundle(null);
    setLogs([
      `[0.0s] ⚡ INITIATING AUTOPILOT LAUNCH PIPELINE...`,
      `[0.4s] Target Niche: "${selectedNiche}" | Price: $${pricePoint}`,
    ]);

    // Simulated terminal stage steps for visceral UI dopamine
    setLaunchStage(1);
    const t1 = setTimeout(() => {
      setLaunchStage(2);
      setLogs((p) => [...p, `[1.2s] 🧠 Synthesizing 3-Module Tactical Masterclass & Prompt Vault...`]);
    }, 1200);

    const t2 = setTimeout(() => {
      setLaunchStage(3);
      setLogs((p) => [...p, `[2.5s] 🎬 Engineering 3 Viral Video Hooks & Visual B-Roll Cues...`]);
    }, 2500);

    const t3 = setTimeout(() => {
      setLaunchStage(4);
      setLogs((p) => [...p, `[3.8s] 💰 Formulating Whop Store Listing Copy & Affiliate Bridge...`]);
    }, 3800);

    try {
      const res = await fetch('/api/assets/generate-autonomous-bundle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: selectedNiche,
          topic: customTopic || undefined,
          pricePoint,
          aiPersona,
        }),
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          onOpenUpgrade();
        }
        throw new Error(data.message || data.error || 'Failed to launch bundle');
      }

      setLaunchStage(5);
      setLogs((p) => [
        ...p,
        `[4.9s] ✓ Product Asset Saved: "${data.productAsset?.title}"`,
        `[5.1s] ✓ Viral Script Saved: "${data.scriptAsset?.title}"`,
        `[5.3s] ✓ Affiliate Bridge Saved: "${data.affiliateAsset?.title}"`,
        `[5.5s] 🚀 AUTOPILOT DIGITAL BUSINESS BUNDLE READY FOR SALE!`,
      ]);

      setLaunchedBundle(data);
      if (data.assets && Array.isArray(data.assets)) {
        data.assets.forEach((a: any) => onAssetCreated(a));
      }

      playCashChime();
    } catch (err: any) {
      setLogs((p) => [...p, `[ERROR] Pipeline aborted: ${err.message}`]);
    } finally {
      setIsLaunching(false);
    }
  };

  const activeProduct = launchedBundle?.productAsset || assets.find((a) => a.type === 'digital_product');
  const activeScript = launchedBundle?.scriptAsset || assets.find((a) => a.type === 'viral_script');

  const embedCode = `<!-- Whop Autopilot Instant Buy Badge -->
<div style="background:#09090b;border:1px solid #27272a;border-radius:16px;padding:24px;max-width:380px;font-family:sans-serif;color:#fff;">
  <div style="font-size:11px;font-family:monospace;color:#06b6d4;font-weight:bold;text-transform:uppercase;">⚡ Instant Digital Delivery</div>
  <h3 style="font-size:18px;font-weight:bold;margin:8px 0;">${activeProduct?.title || 'Tactical Digital Playbook'}</h3>
  <div style="font-size:13px;color:#a1a1aa;margin-bottom:16px;">Downloadable masterclass deliverable with interactive checklists and master prompts.</div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
    <span style="font-size:24px;font-weight:bold;color:#10b981;font-family:monospace;">$${activeProduct?.content?.suggestedPrice || pricePoint} USD</span>
    <span style="font-size:11px;background:#052e16;color:#34d399;padding:3px 8px;border-radius:20px;border:1px solid #065f46;">Code: AUTOPILOT20</span>
  </div>
  <a href="${user?.whopMembershipId ? 'https://whop.com' : 'https://whop.com/hub'}" target="_blank" style="display:block;text-align:center;background:#06b6d4;color:#09090b;font-weight:bold;font-size:13px;padding:12px;border-radius:10px;text-decoration:none;">Claim Instant Access Now →</a>
</div>`;

  const handleCopyWidget = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedWidget(true);
    setTimeout(() => setCopiedWidget(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top War Room Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-cyan-900/60 bg-gradient-to-r from-neutral-950 via-neutral-900 to-cyan-950/40 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
            <span>NEXUS AUTOPILOT COMMAND</span>
            <span>·</span>
            <span className="text-emerald-400">REAL-TIME REVENUE WAR ROOM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Zap className="w-7 h-7 text-cyan-400 fill-current" />
            Autonomous 1-Click Launch Terminal
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl">
            Execute the complete multi-asset digital business pipeline in a single click: synthesizes an authoritative product, compiles the HTML deliverable, drafts 3 viral video hooks, and sets up Whop pricing.
          </p>
        </div>

        {/* Audio Synthesizer Toggle */}
        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled((s) => !s)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors ${
              soundEnabled
                ? 'bg-cyan-950/80 border-cyan-800 text-cyan-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
            title="Toggle Web Audio real-time transaction chime"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Audio Radar ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-neutral-500" />
                <span>Audio Muted</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Autonomous Launcher & Terminal (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Terminal Launcher Card */}
          <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>AUTONOMOUS ENGINE CONTROLLER</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">
                Cost: 1 Credit · 3 Assets Generated
              </span>
            </div>

            <form onSubmit={handleLaunchAutonomousBundle} className="space-y-4">
              {/* AI Persona Directive Selector */}
              <div className="pb-3 border-b border-neutral-800">
                <AIPersonaSelector
                  selectedPersona={aiPersona}
                  onSelectPersona={setAiPersona}
                  compact={true}
                  label="Bundle AI Persona Directive"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Select High-Yield Niche
                </label>
                <select
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 font-sans"
                >
                  {nicheOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Custom Topic / Angle (Optional)
                  </label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. 48-Hour Remote Client Acquisition"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 font-sans"
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
                      min="19"
                      max="499"
                      value={pricePoint}
                      onChange={(e) => setPricePoint(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-7 pr-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLaunching}
                className="w-full py-3 px-6 bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-400 hover:brightness-110 text-neutral-950 font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-950/60 active:scale-[0.99]"
              >
                {isLaunching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                    <span>Synthesizing Coordinated Business Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-neutral-950" />
                    <span>ENGAGE 1-CLICK AUTONOMOUS LAUNCH</span>
                  </>
                )}
              </button>
            </form>

            {/* Futuristic Animated Terminal Window */}
            {(isLaunching || logs.length > 0) && (
              <div className="rounded-xl border border-neutral-800 bg-black p-4 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-neutral-500 pb-2 border-b border-neutral-800">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-neutral-400 font-semibold">pipeline-telemetry.log</span>
                  </div>
                  <span className="text-cyan-400">
                    {isLaunching ? `Stage 0${launchStage}/05 Active` : 'Complete'}
                  </span>
                </div>

                <div className="space-y-1.5 text-neutral-300 max-h-48 overflow-y-auto pt-1">
                  {logs.map((log, i) => (
                    <div
                      key={i}
                      className={
                        log.includes('✓') || log.includes('READY')
                          ? 'text-emerald-400 font-bold'
                          : log.includes('⚡')
                          ? 'text-cyan-400 font-bold'
                          : 'text-neutral-400'
                      }
                    >
                      {log}
                    </div>
                  ))}
                  {isLaunching && (
                    <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
                      <span>▸ Processing high-entropy model inference...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Autonomous Result Showcase */}
          {launchedBundle && (
            <div className="p-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 space-y-4 animate-in slide-in-from-bottom-3 duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>3-ASSET BUNDLE DEPLOYED TO DATABASE</span>
                </div>
                <span className="text-xs font-mono font-bold text-white">
                  ${pricePoint} Retainable Value
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Asset 1: Product */}
                <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/80 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block mb-1">
                      01. Digital Product
                    </span>
                    <h4 className="text-xs font-bold text-white line-clamp-2">
                      {launchedBundle.productAsset?.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveDeliverableAsset(launchedBundle.productAsset)}
                    className="mt-3 w-full py-1.5 px-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Deliverable</span>
                  </button>
                </div>

                {/* Asset 2: Script with Teleprompter */}
                <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/80 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">
                      02. Viral TikTok Funnel
                    </span>
                    <h4 className="text-xs font-bold text-white line-clamp-2">
                      "{launchedBundle.scriptAsset?.content?.hook || 'Scroll-stopping hook'}"
                    </h4>
                  </div>
                  <button
                    onClick={() => setTeleprompterScript(launchedBundle.scriptAsset?.content)}
                    className="mt-3 w-full py-1.5 px-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-neutral-950 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Teleprompter Mode</span>
                  </button>
                </div>

                {/* Asset 3: Whop Listing Kit */}
                <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/80 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block mb-1">
                      03. Whop Store Kit
                    </span>
                    <h4 className="text-xs font-bold text-white line-clamp-2">
                      Markdown Description & Guarantee
                    </h4>
                  </div>
                  <button
                    onClick={() => setListingModalAssetId(launchedBundle.productAsset?.id)}
                    className="mt-3 w-full py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <Package className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Whop Setup Kit</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Radar Stream & Embeddable Checkout Studio (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Authenticated Engine Activity Stream */}
          <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/70 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <h3 className="text-xs font-bold text-white font-mono uppercase">
                  Authenticated Engine Activity
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 font-semibold">
                {assets.length} {assets.length === 1 ? 'Asset' : 'Assets'} Created
              </span>
            </div>

            {/* Genuine Events List or Honest Empty State */}
            {recentUserActivities.length === 0 ? (
              <div className="p-6 rounded-xl border border-neutral-800/80 bg-neutral-950/70 text-center space-y-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 mx-auto flex items-center justify-center text-cyan-400 text-sm">
                  ⚡
                </div>
                <div className="text-xs font-bold text-neutral-300 font-mono">No Engine Runs Yet</div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Your authenticated generation history will appear here once you run your first autonomous product engine below.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentUserActivities.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      if (evt.rawAsset.type === 'digital_product') {
                        setActiveDeliverableAsset(evt.rawAsset);
                      } else if (evt.rawAsset.type === 'viral_script') {
                        setTeleprompterScript(evt.rawAsset.content);
                      }
                    }}
                    className="p-2.5 rounded-xl border border-neutral-800/80 bg-neutral-950/70 flex items-center justify-between text-xs transition-all hover:border-cyan-800 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          evt.type === 'product'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : evt.type === 'affiliate'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : evt.type === 'viral'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                        }`}
                      >
                        {evt.icon}
                      </div>
                      <div className="max-w-[180px] sm:max-w-[220px]">
                        <div className="font-semibold text-white font-mono text-[11px] truncate">
                          {evt.title}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {evt.label} · {evt.time}
                        </div>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-xs text-cyan-400 shrink-0">
                      {evt.valuation}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Embeddable Whop Checkout Widget Studio */}
          <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/70 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>EMBEDDABLE WHOP BUY BADGE</span>
              </div>
              <button
                onClick={handleCopyWidget}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 hover:bg-cyan-900 transition-colors font-medium"
              >
                {copiedWidget ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied Embed!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy HTML Embed</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Interactive Preview of Badge */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-cyan-400 font-bold uppercase">
                  ⚡ Verified Digital Delivery
                </span>
                <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                  Code: AUTOPILOT20
                </span>
              </div>

              <h4 className="text-sm font-bold text-white">
                {activeProduct?.title || 'The Solopreneur AI Workflow Playbook'}
              </h4>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xl font-bold font-mono text-emerald-400">
                  ${activeProduct?.content?.suggestedPrice || pricePoint} USD
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  Full Commercial License
                </span>
              </div>

              <button
                onClick={() => {
                  if (activeProduct) setActiveDeliverableAsset(activeProduct);
                }}
                className="w-full py-2 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/40"
              >
                <span>Preview Deliverable Experience →</span>
              </button>
            </div>

            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Embed this interactive badge directly into your Notion docs, Carrd site, or Linktree to drive impulse checkouts straight into Whop.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeDeliverableAsset && (
        <DeliverableReaderModal
          asset={activeDeliverableAsset}
          isOpen={Boolean(activeDeliverableAsset)}
          onClose={() => setActiveDeliverableAsset(null)}
          onOpenListingKit={(id) => setListingModalAssetId(id)}
        />
      )}

      {teleprompterScript && (
        <TeleprompterModal
          script={teleprompterScript}
          isOpen={Boolean(teleprompterScript)}
          onClose={() => setTeleprompterScript(null)}
        />
      )}

      {listingModalAssetId && (
        <WhopListingModal
          assetId={listingModalAssetId}
          isOpen={Boolean(listingModalAssetId)}
          onClose={() => setListingModalAssetId(null)}
        />
      )}
    </div>
  );
};
