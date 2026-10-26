import React, { useState } from 'react';
import { UserAccount, GeneratedAsset } from '../types';
import {
  Package,
  Sparkles,
  Copy,
  Check,
  Download,
  DollarSign,
  FileText,
  ShieldCheck,
  Layers,
  ArrowRight,
  Loader2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { WhopListingModal } from './WhopListingModal';
import { DeliverableReaderModal } from './DeliverableReaderModal';
import { AIPersonaSelector } from './AIPersonaSelector';
import { AIPersonaId } from '../types';

interface DigitalProductGeneratorProps {
  user: UserAccount | null;
  onAssetCreated: (asset: GeneratedAsset) => void;
  onOpenUpgrade: () => void;
  selectedAsset?: GeneratedAsset | null;
}

export const DigitalProductGenerator: React.FC<DigitalProductGeneratorProps> = ({
  user,
  onAssetCreated,
  onOpenUpgrade,
  selectedAsset,
}) => {
  const [niche, setNiche] = useState('AI Productivity & Automation');
  const [topic, setTopic] = useState('Automated Lead Generation & Client Onboarding Systems');
  const [targetAudience, setTargetAudience] = useState('Solopreneurs, remote freelancers, and boutique agencies');
  const [format, setFormat] = useState<'playbook' | 'checklist_bundle' | 'prompt_vault' | '7day_challenge'>('playbook');
  const [pricePoint, setPricePoint] = useState<number>(39);
  const [aiPersona, setAiPersona] = useState<AIPersonaId>('aggressive_salesman');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<any>(selectedAsset ? selectedAsset.content : null);
  const [activeAssetId, setActiveAssetId] = useState<string | null>(selectedAsset ? selectedAsset.id : null);
  const [activeTab, setActiveTab] = useState<'modules' | 'whop_copy' | 'raw_markdown'>('modules');
  const [copied, setCopied] = useState(false);
  const [isListingKitOpen, setIsListingKitOpen] = useState(false);
  const [isDeliverableReaderOpen, setIsDeliverableReaderOpen] = useState(false);

  const lastLoadedIdRef = React.useRef<string | null>(null);

  // If user selected an asset from dashboard/vault, display it
  React.useEffect(() => {
    if (selectedAsset && selectedAsset.type === 'digital_product' && selectedAsset.id !== lastLoadedIdRef.current) {
      lastLoadedIdRef.current = selectedAsset.id;
      setActiveResult(selectedAsset.content);
      setActiveAssetId(selectedAsset.id);
      setNiche(selectedAsset.niche);
      setTopic(selectedAsset.title);
    }
  }, [selectedAsset]);

  const nichePresets = [
    'AI Productivity & Automation',
    'E-Commerce & Digital Products',
    'Remote Freelancing & Agency',
    'Health, Fitness & Wellness',
    'Crypto, DeFi & Wealth Systems',
    'Creator Economy & Social Media',
  ];

  const quickLaunchPresets = [
    {
      badge: '🤖 AI Systems',
      name: 'AI Automation & Prompt Vault',
      niche: 'AI Productivity & Automation',
      topic: 'Enterprise ChatGPT & Claude Automation Systems with 100+ Master Prompts',
      targetAudience: 'Solopreneurs, boutique agency owners, and knowledge workers',
      format: 'prompt_vault' as const,
      pricePoint: 47,
    },
    {
      badge: '🎬 Viral Growth',
      name: 'Faceless Shorts Cashflow Machine',
      niche: 'Creator Economy & Social Media',
      topic: '30-Day Faceless TikTok & Reels System: Script Hooks, B-Roll, and Whop Bio Conversion',
      targetAudience: 'Aspiring creators, introverts, and affiliate marketers',
      format: 'playbook' as const,
      pricePoint: 37,
    },
    {
      badge: '⚡ Systems',
      name: 'Notion Solopreneur Operating System',
      niche: 'Remote Freelancing & Agency',
      topic: 'High-Performance Solopreneur Notion OS: Client CRM, Project Boards, and Daily Dashboards',
      targetAudience: 'Freelancers, consultants, and remote contractors',
      format: 'checklist_bundle' as const,
      pricePoint: 29,
    },
    {
      badge: '💎 Alpha',
      name: 'Crypto & DeFi Yield Blueprint',
      niche: 'Crypto, DeFi & Wealth Systems',
      topic: 'Zero-Risk DeFi Yield Farming & Ecosystem Airdrop Hunting Playbook for 2026',
      targetAudience: 'Crypto beginners, DeFi investors, and web3 enthusiasts',
      format: 'playbook' as const,
      pricePoint: 67,
    },
    {
      badge: '💼 B2B Deals',
      name: 'High-Ticket Client Funnel',
      niche: 'Remote Freelancing & Agency',
      topic: 'Automated Cold Email & LinkedIn Client Acquisition Engine for $3,000+ Retainers',
      targetAudience: 'Agencies, consultants, and high-ticket service providers',
      format: '7day_challenge' as const,
      pricePoint: 97,
    },
    {
      badge: '💰 Recurring',
      name: 'SaaS Recurring Affiliate Swipe File',
      niche: 'E-Commerce & Digital Products',
      topic: 'The 30% Lifetime Recurring Software Affiliate Machine: Review Bridges & Email Sequences',
      targetAudience: 'Affiliate marketers, newsletter creators, and bloggers',
      format: 'playbook' as const,
      pricePoint: 49,
    },
  ];

  const applyPreset = (preset: (typeof quickLaunchPresets)[0]) => {
    setNiche(preset.niche);
    setTopic(preset.topic);
    setTargetAudience(preset.targetAudience);
    setFormat(preset.format);
    setPricePoint(preset.pricePoint);
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
      const res = await fetch('/api/assets/generate-digital-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          topic,
          targetAudience,
          format,
          pricePoint,
          aiPersona,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          onOpenUpgrade();
        }
        throw new Error(data.message || data.error || 'Failed to generate product');
      }

      setActiveResult(data.asset.content);
      setActiveAssetId(data.asset.id);
      onAssetCreated(data.asset);
    } catch (err: any) {
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFullMarkdown = () => {
    if (!activeResult) return '';
    let md = `# ${activeResult.title || 'Digital Product'}\n\n`;
    md += `*${activeResult.subtitle || ''}*\n\n`;
    md += `**Suggested Whop Price:** $${activeResult.suggestedPrice || pricePoint}\n`;
    md += `**Target Audience:** ${targetAudience}\n\n`;
    md += `## Overview\n${activeResult.summary || ''}\n\n`;

    if (activeResult.modules && Array.isArray(activeResult.modules)) {
      activeResult.modules.forEach((mod: any, i: number) => {
        md += `### Module ${i + 1}: ${mod.title}\n`;
        md += `**Summary:** ${mod.summary}\n\n`;
        md += `#### Action Checklist:\n`;
        mod.actionSteps?.forEach((step: string) => {
          md += `- [ ] ${step}\n`;
        });
        md += `\n#### Detailed Implementation Guide:\n${mod.fullContent}\n\n`;
        if (mod.copyPasteResource) {
          md += `#### Ready-to-Use Resource / Prompt Template:\n\`\`\`\n${mod.copyPasteResource}\n\`\`\`\n\n`;
        }
      });
    }

    if (activeResult.whopSalesCopy) {
      md += `\n---\n## Whop Store Listing Copy\n\n`;
      md += `**Headline:** ${activeResult.whopSalesCopy.headline}\n\n`;
      md += `**Bullet Points:**\n`;
      activeResult.whopSalesCopy.bullets?.forEach((b: string) => {
        md += `- ${b}\n`;
      });
      md += `\n**Guarantee:** ${activeResult.whopSalesCopy.guarantee}\n`;
    }

    return md;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = getFullMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(activeResult.title || 'whop-digital-product')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
          <span>Income Stream 01</span>
          <span aria-hidden="true">·</span>
          <span>100% Margin Digital Assets</span>
          <span aria-hidden="true">·</span>
          <span className="text-cyan-400 font-medium">Ready For Whop Store</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Digital Product & Whop Store Creator
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl">
          Instantly generate comprehensive, actionable digital playbooks, prompt vaults, and SOPs complete with Whop checkout copy, module guides, and pricing strategy.
        </p>
      </div>

      {/* 1-Click High-Converting Launch Presets */}
      <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Trending Whop Launch Presets</span>
          </div>
          <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline">
            Click any template to auto-fill proven offer
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {quickLaunchPresets.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyPreset(preset)}
              className="p-3 rounded-xl border border-neutral-800/80 bg-neutral-950/70 hover:border-cyan-500/60 hover:bg-cyan-950/20 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-semibold block mb-1">
                  {preset.badge}
                </span>
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 line-clamp-2 leading-tight">
                  {preset.name}
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 font-mono mt-2 font-semibold">
                ${preset.pricePoint} USD
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Product Configuration */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            {/* AI Persona Selector */}
            <div className="pb-3 border-b border-neutral-800">
              <AIPersonaSelector
                selectedPersona={aiPersona}
                onSelectPersona={setAiPersona}
                compact={true}
                label="AI Writing Persona & Voice"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Market Niche
              </label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-cyan-500"
              >
                {nichePresets.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Specific Product Topic / Outcome
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                placeholder="e.g. Automated Notion Systems for $5K/mo Agencies"
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-cyan-500 placeholder-neutral-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Target Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                required
                placeholder="e.g. Broke college students, solopreneurs, creators"
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-cyan-500 placeholder-neutral-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Product Format
                </label>
                <select
                  value={format}
                  onChange={(e: any) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="playbook">Tactical Playbook (PDF)</option>
                  <option value="prompt_vault">Prompt / Template Vault</option>
                  <option value="checklist_bundle">SOP Checklist Bundle</option>
                  <option value="7day_challenge">7-Day Action Challenge</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Whop Price Point
                </label>
                <select
                  value={pricePoint}
                  onChange={(e) => setPricePoint(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value={19}>$19 (Fast impulse impulse buy)</option>
                  <option value={39}>$39 (Sweet spot value standard)</option>
                  <option value={49}>$49 (Comprehensive master guide)</option>
                  <option value={99}>$99 (High-ticket premium system)</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 text-xs text-rose-400 bg-rose-950/30 border border-rose-900 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-neutral-950 font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Full Product Asset...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Whop Product (1 Credit)
                </>
              )}
            </button>
          </form>

          {/* Value Calculation Helper */}
          <div className="pt-4 border-t border-neutral-800/80 text-xs text-neutral-400 space-y-1">
            <div className="flex justify-between font-mono">
              <span>Potential Revenue (10 Sales):</span>
              <span className="text-emerald-400 font-semibold tabular-nums">
                ${pricePoint * 10} USD
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Zero inventory cost. 100% digital fulfillment delivered directly via Whop.
            </p>
          </div>
        </div>

        {/* Right Area: Generated Product Viewer */}
        <div className="lg:col-span-7">
          {activeResult ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
              {/* Product Header Bar */}
              <div className="p-5 border-b border-neutral-800 bg-neutral-900/80">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium mb-1">
                      <span>Ready To Sell</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-emerald-400 font-bold">
                        ${activeResult.suggestedPrice || pricePoint} USD
                      </span>
                      {activeResult.aiPersonaUsed && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-cyan-800/60 bg-cyan-950/40 text-cyan-300 capitalize">
                            Voice: {activeResult.aiPersonaUsed.replace('_', ' ')}
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      {activeResult.title}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {activeResult.subtitle}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {activeAssetId && (
                      <button
                        onClick={() => setIsDeliverableReaderOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors shadow-sm"
                        title="Open interactive deliverable reader & checklist"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        Read Deliverable
                      </button>
                    )}

                    {activeAssetId && (
                      <a
                        href={`/api/assets/${activeAssetId}/deliverable-html`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors shadow-sm"
                        title="Open styled HTML deliverable to print or save as PDF"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Print PDF
                      </a>
                    )}

                    {activeAssetId && (
                      <button
                        onClick={() => setIsListingKitOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md transition-colors"
                        title="Get copy-paste Whop product title, HTML description, and setup steps"
                      >
                        <Package className="h-3.5 w-3.5 text-cyan-400" />
                        Whop Kit
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(getFullMarkdown())}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md transition-colors"
                      title="Copy full markdown content"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy MD
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleDownloadMarkdown}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md transition-colors"
                      title="Download Markdown file"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download MD
                    </button>
                  </div>
                </div>

                {/* Sub tabs */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-800 text-xs">
                  <button
                    onClick={() => setActiveTab('modules')}
                    className={`px-3 py-1 font-medium rounded-md transition-colors ${
                      activeTab === 'modules'
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Actionable Modules ({activeResult.modules?.length || 0})
                  </button>

                  <button
                    onClick={() => setActiveTab('whop_copy')}
                    className={`px-3 py-1 font-medium rounded-md transition-colors ${
                      activeTab === 'whop_copy'
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Whop Store Sales Copy
                  </button>

                  <button
                    onClick={() => setActiveTab('raw_markdown')}
                    className={`px-3 py-1 font-medium rounded-md transition-colors ${
                      activeTab === 'raw_markdown'
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Raw Export Preview
                  </button>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="p-6 max-h-[600px] overflow-y-auto space-y-6">
                {activeTab === 'modules' && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-neutral-950/70 border border-neutral-800/80">
                      <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                        Executive Overview & Transformation
                      </h3>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {activeResult.summary}
                      </p>
                    </div>

                    {activeResult.modules?.map((mod: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-5 rounded-lg border border-neutral-800 bg-neutral-950/40 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-xs font-mono text-cyan-400">
                              0{idx + 1}. MODULE
                            </span>
                            <h4 className="text-base font-semibold text-white mt-0.5">
                              {mod.title}
                            </h4>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-400">
                          {mod.summary}
                        </p>

                        {/* Action Steps */}
                        {mod.actionSteps && (
                          <div className="space-y-1.5 pt-2">
                            <span className="text-xs font-semibold text-neutral-300">
                              Execution Checklist:
                            </span>
                            <ul className="space-y-1 text-xs text-neutral-400">
                              {mod.actionSteps.map((step: string, sIdx: number) => (
                                <li key={sIdx} className="flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Full Detailed Content */}
                        <div className="pt-2 text-xs text-neutral-300 leading-relaxed whitespace-pre-line border-t border-neutral-800/60">
                          {mod.fullContent}
                        </div>

                        {/* Ready Resource / Prompt */}
                        {mod.copyPasteResource && (
                          <div className="p-3 rounded bg-neutral-900 border border-neutral-800 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-cyan-400">
                                Ready-to-Use Resource Snippet
                              </span>
                              <button
                                onClick={() => handleCopy(mod.copyPasteResource)}
                                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1"
                              >
                                <Copy className="h-3 w-3" />
                                Copy
                              </button>
                            </div>
                            <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap overflow-x-auto">
                              {mod.copyPasteResource}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'whop_copy' && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-cyan-950/30 border border-cyan-900/50">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
                        Paste Directly Into Your Whop Store Product Description
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5 leading-snug">
                        {activeResult.whopSalesCopy?.headline}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                        High-Converting Benefit Bullets
                      </h4>
                      <div className="space-y-2">
                        {activeResult.whopSalesCopy?.bullets?.map(
                          (bullet: string, bIdx: number) => (
                            <div
                              key={bIdx}
                              className="p-3 rounded-lg border border-neutral-800 bg-neutral-950 text-xs text-neutral-200 flex items-start gap-2"
                            >
                              <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{bullet}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {activeResult.whopSalesCopy?.guarantee && (
                      <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-950 text-xs space-y-1">
                        <span className="font-semibold text-neutral-200">
                          Money-Back Guarantee Statement:
                        </span>
                        <p className="text-neutral-400">
                          {activeResult.whopSalesCopy.guarantee}
                        </p>
                      </div>
                    )}

                    {activeResult.whopSalesCopy?.faq && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                          Frequently Asked Questions (FAQ)
                        </h4>
                        <div className="space-y-2">
                          {activeResult.whopSalesCopy.faq.map((item: any, fIdx: number) => (
                            <div
                              key={fIdx}
                              className="p-3 rounded-lg border border-neutral-800 bg-neutral-950 text-xs space-y-1"
                            >
                              <div className="font-medium text-white">
                                {item.question}
                              </div>
                              <div className="text-neutral-400">
                                {item.answer}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'raw_markdown' && (
                  <div>
                    <pre className="p-4 rounded-lg bg-neutral-950 text-xs font-mono text-neutral-300 overflow-x-auto whitespace-pre-wrap">
                      {getFullMarkdown()}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30">
              <Package className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white">
                No Digital Product Generated Yet
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Fill out the configuration on the left and click "Generate Whop Product" to generate a full actionable playbook ready for sale.
              </p>
            </div>
          )}
        </div>
      </div>
      {activeAssetId && isListingKitOpen && (
        <WhopListingModal
          assetId={activeAssetId}
          isOpen={isListingKitOpen}
          onClose={() => setIsListingKitOpen(false)}
        />
      )}

      {activeResult && (
        <DeliverableReaderModal
          asset={
            selectedAsset || {
              id: activeAssetId || 'active_gen',
              userId: user?.id || 'user',
              type: 'digital_product',
              title: activeResult.title || 'Digital Product',
              niche,
              content: activeResult,
              createdAt: new Date().toISOString(),
            }
          }
          isOpen={isDeliverableReaderOpen}
          onClose={() => setIsDeliverableReaderOpen(false)}
          onOpenListingKit={(id) => {
            if (activeAssetId) setIsListingKitOpen(true);
          }}
        />
      )}
    </div>
  );
};
