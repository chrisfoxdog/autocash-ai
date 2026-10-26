import React, { useState } from 'react';
import { UserAccount, GeneratedAsset } from '../types';
import {
  TrendingUp,
  Package,
  Video,
  Share2,
  ArrowRight,
  Zap,
  CheckCircle2,
  Circle,
  DollarSign,
  Download,
  Gauge,
  Sparkles,
  Sliders,
  ExternalLink,
  BookOpen,
  ShieldCheck,
  Flame,
  Check,
} from 'lucide-react';
import { DeliverableReaderModal } from './DeliverableReaderModal';

interface DashboardViewProps {
  user: UserAccount | null;
  assets: GeneratedAsset[];
  setActiveTab: (tab: string) => void;
  onOpenUpgrade: () => void;
  onSelectAsset: (asset: GeneratedAsset) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  assets,
  setActiveTab,
  onOpenUpgrade,
  onSelectAsset,
}) => {
  // Simulator State
  const [simPrice, setSimPrice] = useState<number>(39);
  const [simWeeklySales, setSimWeeklySales] = useState<number>(8);
  const [simRecurringMembers, setSimRecurringMembers] = useState<number>(25);
  const [targetSaved, setTargetSaved] = useState(false);
  const [deliverableModalAsset, setDeliverableModalAsset] = useState<GeneratedAsset | null>(null);

  // 72-Hour Launchpad Checklist State with localStorage persistence
  const [launchSteps, setLaunchSteps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('autocash_launch_steps');
      return saved
        ? JSON.parse(saved)
        : { s1: true, s2: false, s3: false, s4: false, s5: false };
    } catch {
      return { s1: true, s2: false, s3: false, s4: false, s5: false };
    }
  });

  const toggleLaunchStep = (stepKey: string) => {
    setLaunchSteps((prev) => {
      const updated = { ...prev, [stepKey]: !prev[stepKey] };
      try {
        localStorage.setItem('autocash_launch_steps', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Calculations
  const completedCount = Object.values(launchSteps).filter(Boolean).length;
  const launchPercent = Math.round((completedCount / 5) * 100);

  const monthlyProductSales = simWeeklySales * 4;
  const monthlyProductRevenue = monthlyProductSales * simPrice;
  const monthlyRecurringRevenue = simRecurringMembers * 29;
  const grossMRR = monthlyProductRevenue + monthlyRecurringRevenue;
  const whopFee = Math.round(grossMRR * 0.03);
  const netMRR = grossMRR - whopFee;
  const projectedARR = netMRR * 12;
  const dailyVisitorsNeeded = Math.ceil((simWeeklySales / 7) / 0.015);

  const totalPotentialValue = assets.reduce((sum, a) => {
    if (a.type === 'digital_product' && a.content?.suggestedPrice) {
      return sum + Number(a.content.suggestedPrice) * 10;
    }
    return sum + 190;
  }, 0);

  const productCount = assets.filter((a) => a.type === 'digital_product').length;
  const scriptCount = assets.filter((a) => a.type === 'viral_script').length;
  const affiliateCount = assets.filter((a) => a.type === 'affiliate_bridge').length;

  const handleSaveTarget = () => {
    setTargetSaved(true);
    setTimeout(() => setTargetSaved(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Hero Showcase with visual asset and clean typography */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/autopilot_income_hero_1790382807339.jpg"
            alt="Creator Autopilot Studio"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3 font-mono">
            <span>Whop Autopilot Engine</span>
            <span aria-hidden="true">·</span>
            <span>Zero Ad Spend Architecture</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400 font-semibold">Active & Live</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3 text-balance">
            Turn Ideas Into Passive Cashflow On Whop Without Capital.
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6">
            Generate turnkey sellable digital products with instant deliverables, audit your offers with AI conversion analysis, and launch viral organic traffic funnels that generate real revenue.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('warroom')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:brightness-110 text-neutral-950 font-extrabold text-xs sm:text-sm rounded-lg transition-all shadow-lg shadow-cyan-950/60"
            >
              <Zap className="h-4 w-4 fill-current" />
              ⚡ 1-Click War Room
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold text-xs sm:text-sm rounded-lg transition-colors shadow-lg shadow-emerald-950/50"
            >
              <Package className="h-4 w-4" />
              Turnkey Catalog ({productCount})
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('optimizer')}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs sm:text-sm rounded-lg transition-colors shadow-lg shadow-cyan-950/50"
            >
              <Gauge className="h-4 w-4" />
              Conversion Radar
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs sm:text-sm rounded-lg border border-neutral-700 transition-colors"
            >
              <Zap className="h-4 w-4 text-cyan-400" />
              Product Studio
            </button>
          </div>
        </div>
      </div>

      {/* Primary Quantitative Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>Total Revenue Assets</span>
            <Package className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {assets.length}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {productCount} Products · {scriptCount} Scripts · {affiliateCount} Deals
          </div>
        </div>

        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>Estimated 10-Sale Pipeline</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            ${totalPotentialValue.toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Conservative 10-customer benchmark
          </div>
        </div>

        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>Available AI Credits</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {user?.plan === 'empire' ? 'Unlimited' : user?.credits ?? 0}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {user?.plan === 'empire'
              ? 'Autopilot Empire Tier Active'
              : `${user?.plan?.toUpperCase()} Tier Active`}
          </div>
        </div>

        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>Whop Webhook Engine</span>
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-base font-semibold text-white">
            Live Endpoint Ready
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            HMAC-SHA256 signature verification active
          </div>
        </div>
      </div>

      {/* 72-Hour Fast-Track Whop Launchpad */}
      <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/70 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Fast-Track</span>
              <span>·</span>
              <span className="text-emerald-400">{completedCount}/5 Milestones Completed</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
              72-Hour Whop Cashflow Launchpad
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-32 bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${launchPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-white">
              {launchPercent}%
            </span>
          </div>
        </div>

        {/* Milestone Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Step 1 */}
          <div
            onClick={() => toggleLaunchStep('s1')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              launchSteps.s1
                ? 'border-emerald-500/40 bg-emerald-950/20 text-neutral-300'
                : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold">
                  Step 01
                </span>
                {launchSteps.s1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-neutral-600" />
                )}
              </div>
              <h4 className="text-xs font-bold text-white mb-1">
                Choose / Generate Product
              </h4>
              <p className="text-[11px] text-neutral-400 line-clamp-2">
                Select a $39 turnkey playbook from catalog or generate custom SOP.
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('catalog');
              }}
              className="mt-3 text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
            >
              Open Catalog →
            </button>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => toggleLaunchStep('s2')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              launchSteps.s2
                ? 'border-emerald-500/40 bg-emerald-950/20 text-neutral-300'
                : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold">
                  Step 02
                </span>
                {launchSteps.s2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-neutral-600" />
                )}
              </div>
              <h4 className="text-xs font-bold text-white mb-1">
                Export Customer Deliverable
              </h4>
              <p className="text-[11px] text-neutral-400 line-clamp-2">
                Download standalone HTML deliverable or print PDF fulfillment file.
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (assets.length > 0) {
                  setDeliverableModalAsset(assets.find((a) => a.type === 'digital_product') || assets[0]);
                } else {
                  setActiveTab('catalog');
                }
              }}
              className="mt-3 text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
            >
              Read Deliverable →
            </button>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => toggleLaunchStep('s3')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              launchSteps.s3
                ? 'border-emerald-500/40 bg-emerald-950/20 text-neutral-300'
                : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold">
                  Step 03
                </span>
                {launchSteps.s3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-neutral-600" />
                )}
              </div>
              <h4 className="text-xs font-bold text-white mb-1">
                Audit Offer & Copy Kit
              </h4>
              <p className="text-[11px] text-neutral-400 line-clamp-2">
                Run Conversion Radar to optimize title, price, and hook rewrites.
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('optimizer');
              }}
              className="mt-3 text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
            >
              Audit Offer →
            </button>
          </div>

          {/* Step 4 */}
          <div
            onClick={() => toggleLaunchStep('s4')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              launchSteps.s4
                ? 'border-emerald-500/40 bg-emerald-950/20 text-neutral-300'
                : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold">
                  Step 04
                </span>
                {launchSteps.s4 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-neutral-600" />
                )}
              </div>
              <h4 className="text-xs font-bold text-white mb-1">
                Post 3 Viral Hooks
              </h4>
              <p className="text-[11px] text-neutral-400 line-clamp-2">
                Deploy 3-second attention scripts with Whop store link in bio.
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('traffic');
              }}
              className="mt-3 text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
            >
              Generate Hooks →
            </button>
          </div>

          {/* Step 5 */}
          <div
            onClick={() => toggleLaunchStep('s5')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              launchSteps.s5
                ? 'border-emerald-500/40 bg-emerald-950/20 text-neutral-300'
                : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold">
                  Step 05
                </span>
                {launchSteps.s5 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-neutral-600" />
                )}
              </div>
              <h4 className="text-xs font-bold text-white mb-1">
                Connect Webhook Engine
              </h4>
              <p className="text-[11px] text-neutral-400 line-clamp-2">
                Verify webhook endpoint for automated entitlement delivery.
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('whop');
              }}
              className="mt-3 text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
            >
              Configure Engine →
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Autopilot MRR Simulator & Profit Forecaster */}
      <div className="p-6 sm:p-8 rounded-2xl border border-neutral-800 bg-neutral-900/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
              <Sliders className="w-3.5 h-3.5" />
              <span>Financial Forecasting Cockpit</span>
              <span>·</span>
              <span className="text-emerald-400 font-bold">Dynamic Revenue Modeling</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Whop Autopilot MRR Simulator
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Adjust your product retail price, weekly sales volume, and community subscribers to calculate net payout and traffic required.
            </p>
          </div>

          <button
            onClick={handleSaveTarget}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
          >
            {targetSaved ? (
              <>
                <Check className="w-4 h-4 text-neutral-950 font-bold" />
                <span>Target Locked!</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 text-neutral-950" />
                <span>Lock In Target</span>
              </>
            )}
          </button>
        </div>

        {/* Sliders & Outputs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Slider 1: Product Price */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-300 font-medium">Digital Product Retail Price:</span>
                <span className="font-mono text-cyan-400 font-bold text-sm">${simPrice} USD</span>
              </div>
              <input
                type="range"
                min="19"
                max="199"
                step="5"
                value={simPrice}
                onChange={(e) => setSimPrice(Number(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-neutral-950 rounded-lg appearance-none cursor-pointer border border-neutral-800"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>$19 (Impulse)</span>
                <span>$39 (Standard)</span>
                <span>$99 (Masterclass)</span>
                <span>$199 (High-Ticket)</span>
              </div>
            </div>

            {/* Slider 2: Weekly Sales Volume */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-300 font-medium">Weekly Product Sales:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">{simWeeklySales} sales/week</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={simWeeklySales}
                onChange={(e) => setSimWeeklySales(Number(e.target.value))}
                className="w-full accent-emerald-400 h-2 bg-neutral-950 rounded-lg appearance-none cursor-pointer border border-neutral-800"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>1 sale/wk (Casual)</span>
                <span>10 sales/wk (Automated)</span>
                <span>25 sales/wk (Growth)</span>
                <span>50 sales/wk (Full Scaled)</span>
              </div>
            </div>

            {/* Slider 3: Community Subscriptions */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-300 font-medium">VIP Community Members ($29/mo recurring):</span>
                <span className="font-mono text-blue-400 font-bold text-sm">{simRecurringMembers} members</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                step="5"
                value={simRecurringMembers}
                onChange={(e) => setSimRecurringMembers(Number(e.target.value))}
                className="w-full accent-blue-400 h-2 bg-neutral-950 rounded-lg appearance-none cursor-pointer border border-neutral-800"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>0 members</span>
                <span>50 members ($1,450/mo)</span>
                <span>150 members ($4,350/mo)</span>
                <span>250 members ($7,250/mo)</span>
              </div>
            </div>
          </div>

          {/* Financial Calculation Output Cards (5 Cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl border border-neutral-800 bg-neutral-950/70 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
                Projected Net Monthly Cashflow (MRR)
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tabular-nums">
                ${netMRR.toLocaleString()}
                <span className="text-xs font-sans text-neutral-400 font-normal ml-2">/ month</span>
              </div>
              <div className="text-[11px] text-neutral-500 font-mono">
                Gross: ${grossMRR.toLocaleString()} · Whop Fee (3%): -${whopFee}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <span className="text-[10px] font-mono text-neutral-400 block mb-0.5">
                  Annualized Run Rate (ARR)
                </span>
                <span className="font-bold text-white font-mono text-sm">
                  ${projectedARR.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <span className="text-[10px] font-mono text-neutral-400 block mb-0.5">
                  Daily Traffic Needed
                </span>
                <span className="font-bold text-cyan-400 font-mono text-sm">
                  ~{dailyVisitorsNeeded} views/day
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-[11px] text-neutral-300 leading-relaxed">
              <span className="font-bold text-cyan-400">Execution Formula: </span>
              Requires only ~{(simWeeklySales / 7).toFixed(1)} sales per day. Post 2 organic short-form videos with the script generator to achieve this reliably without paid ads.
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Autopilot Income Stream Channels */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white tracking-tight">
            3 Automated Monetization Streams
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Choose a channel to start generating monetizable assets in under 60 seconds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stream 1 */}
          <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-medium mb-2">
                <Package className="h-4 w-4" />
                <span>Stream 01 · 100% Margin</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                Digital Products & Whop Store
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Generate high-margin actionable playbooks, prompt vaults, and 7-day challenge guides with full Whop sales copy and instant checkout setup.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('products')}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors font-bold"
            >
              Create Product ($19–$99)
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Stream 2 */}
          <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium mb-2">
                <Video className="h-4 w-4" />
                <span>Stream 02 · Organic Traffic</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                Viral Short-Form & Social Funnels
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Generate scroll-stopping TikTok, Instagram Reels, and X thread scripts with visual timing and direct bio CTAs driving paying customers.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('traffic')}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors"
            >
              Generate Viral Scripts
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Stream 3 */}
          <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-medium mb-2">
                <Share2 className="h-4 w-4" />
                <span>Stream 03 · Monthly Recurring</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                Recurring Affiliate Bridge Pages
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Build honest high-converting comparison reviews and bridge email blasts for top recurring SaaS tools that pay 30% to 50% monthly passive revenue.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('affiliate')}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors"
            >
              Build Affiliate Bridge
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Revenue Assets Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              Generated Income Assets ({assets.length})
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Permanently saved on your server database and ready for export to Whop
            </p>
          </div>
          <button
            onClick={() => setActiveTab('vault')}
            className="text-xs font-medium text-cyan-400 hover:underline"
          >
            View all in Vault →
          </button>
        </div>

        {assets.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-neutral-800 rounded-xl bg-neutral-900/30">
            <Package className="h-8 w-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-300">
              No revenue assets generated yet.
            </p>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Start by building your first digital product or viral script to launch your autopilot income stream.
            </p>
            <button
              onClick={() => setActiveTab('products')}
              className="mt-4 px-3.5 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs rounded-lg transition-colors"
            >
              Generate First Product
            </button>
          </div>
        ) : (
          <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Asset Title</th>
                  <th className="py-2.5 px-4 font-medium">Niche</th>
                  <th className="py-2.5 px-4 font-medium">Stream Type</th>
                  <th className="py-2.5 px-4 font-medium text-right">Potential Price</th>
                  <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {assets.slice(0, 5).map((asset) => {
                  const typeLabel =
                    asset.type === 'digital_product'
                      ? 'Digital Product'
                      : asset.type === 'viral_script'
                      ? 'Viral Script'
                      : 'Affiliate Bridge';

                  const priceDisplay =
                    asset.type === 'digital_product' && asset.content?.suggestedPrice
                      ? `$${asset.content.suggestedPrice}`
                      : asset.type === 'affiliate_bridge'
                      ? '$47/mo avg'
                      : 'Organic Funnel';

                  return (
                    <tr key={asset.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                        {asset.title}
                      </td>
                      <td className="py-3 px-4 text-neutral-400">
                        {asset.niche}
                      </td>
                      <td className="py-3 px-4 text-neutral-300">
                        {typeLabel}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400">
                        {priceDisplay}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {asset.type === 'digital_product' && (
                            <button
                              onClick={() => setDeliverableModalAsset(asset)}
                              className="px-2.5 py-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded transition-colors flex items-center gap-1"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Read</span>
                            </button>
                          )}
                          <button
                            onClick={() => onSelectAsset(asset)}
                            className="px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deliverable Reader Modal */}
      {deliverableModalAsset && (
        <DeliverableReaderModal
          asset={deliverableModalAsset}
          isOpen={Boolean(deliverableModalAsset)}
          onClose={() => setDeliverableModalAsset(null)}
          onOpenListingKit={(id) => {
            setDeliverableModalAsset(null);
            onSelectAsset(deliverableModalAsset);
          }}
        />
      )}
    </div>
  );
};
