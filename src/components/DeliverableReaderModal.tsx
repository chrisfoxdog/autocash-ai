import React, { useState } from 'react';
import { GeneratedAsset } from '../types';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Circle,
  Layers,
  BookOpen,
  DollarSign,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  FileCode,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DeliverableReaderModalProps {
  asset: GeneratedAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenListingKit?: (assetId: string) => void;
}

export const DeliverableReaderModal: React.FC<DeliverableReaderModalProps> = ({
  asset,
  isOpen,
  onClose,
  onOpenListingKit,
}) => {
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [copiedResource, setCopiedResource] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !asset) return null;

  const content = asset.content || {};
  const modules = Array.isArray(content.modules) ? content.modules : [];
  const currentModule = modules[activeModuleIdx] || null;
  const suggestedPrice = content.suggestedPrice || 39;

  const toggleStep = (stepKey: string) => {
    setCompletedSteps((prev) => {
      const next = { ...prev, [stepKey]: !prev[stepKey] };
      const stepCount = currentModule?.actionSteps?.length || 0;
      const completedNow = (currentModule?.actionSteps || []).filter(
        (_: any, sIdx: number) => next[`${activeModuleIdx}_${sIdx}`]
      ).length;
      if (stepCount > 0 && completedNow === stepCount && !prev[stepKey]) {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.7 },
          colors: ['#06b6d4', '#10b981', '#38bdf8', '#ffffff'],
        });
      }
      return next;
    });
  };

  const handleCopyResource = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResource(true);
    setTimeout(() => setCopiedResource(false), 2000);
  };

  const handleDownloadHtml = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/assets/${asset.id}/deliverable-html`);
      const htmlText = await res.text();
      const blob = new Blob([htmlText], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${asset.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-deliverable.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadMarkdown = () => {
    let md = `# ${asset.title}\n\n`;
    md += `*${content.subtitle || ''}*\n\n`;
    md += `**Suggested Retail Price:** $${suggestedPrice} USD\n`;
    md += `**Niche:** ${asset.niche}\n\n`;
    md += `## Executive Summary\n${content.summary || ''}\n\n`;

    modules.forEach((mod: any, i: number) => {
      md += `### Module ${i + 1}: ${mod.title}\n`;
      md += `*${mod.summary}*\n\n`;
      if (mod.actionSteps?.length) {
        md += `#### Action Checklist:\n`;
        mod.actionSteps.forEach((step: string) => {
          md += `- [ ] ${step}\n`;
        });
        md += `\n`;
      }
      md += `#### Implementation Guide:\n${mod.fullContent}\n\n`;
      if (mod.copyPasteResource) {
        md += `#### Ready-to-Use Resource / Prompt:\n\`\`\`\n${mod.copyPasteResource}\n\`\`\`\n\n`;
      }
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadNotion = () => {
    let notion = `# 📘 ${asset.title}\n\n`;
    notion += `> 💡 **VALUE PROPOSITION:** ${content.subtitle || ''}\n>\n> 🏷️ **RETAIL PRICE:** $${suggestedPrice} USD | **NICHE:** ${asset.niche}\n\n`;
    notion += `## 🎯 Executive Overview\n${content.summary || ''}\n\n---\n\n`;

    modules.forEach((mod: any, i: number) => {
      notion += `## 📌 Module 0${i + 1}: ${mod.title}\n\n`;
      notion += `> 📖 **Summary:** *${mod.summary}*\n\n`;
      if (mod.actionSteps?.length) {
        notion += `### ✅ Execution Checklist\n`;
        mod.actionSteps.forEach((step: string) => {
          notion += `- [ ] ${step}\n`;
        });
        notion += `\n`;
      }
      notion += `### 🛠️ Tactical Guide\n${mod.fullContent}\n\n`;
      if (mod.copyPasteResource) {
        notion += `### ⚡ Master Prompt / Resource\n\`\`\`text\n${mod.copyPasteResource}\n\`\`\`\n\n`;
      }
      notion += `---\n\n`;
    });

    const blob = new Blob([notion], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-notion-template.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold text-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                <span className="text-cyan-400 uppercase font-semibold">{asset.niche}</span>
                <span>·</span>
                <span className="text-emerald-400 font-semibold">${suggestedPrice} Retail</span>
                {content.aiPersonaUsed && (
                  <>
                    <span>·</span>
                    <span className="text-amber-400 font-medium capitalize">
                      Voice: {content.aiPersonaUsed.replace('_', ' ')}
                    </span>
                  </>
                )}
                <span>·</span>
                <span className="text-neutral-400">Interactive Customer Deliverable</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1">
                {asset.title}
              </h2>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <a
              href={`/api/assets/${asset.id}/deliverable-html`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 hover:text-white rounded-lg border border-neutral-700 transition-colors"
              title="Open full page print/PDF deliverable view"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Print / PDF</span>
            </a>

            <button
              onClick={handleDownloadHtml}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm"
              title="Download standalone HTML file for customers"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Downloading...' : 'Save .HTML'}</span>
            </button>

            <button
              onClick={handleDownloadNotion}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-700 transition-colors"
              title="Export formatted Notion template markdown"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Notion .MD</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-800 transition-colors"
              title="Download formatted Markdown"
            >
              <span>Raw .MD</span>
            </button>

            {onOpenListingKit && (
              <button
                onClick={() => {
                  onClose();
                  onOpenListingKit(asset.id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                title="Open Whop product listing copy"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Whop Kit</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Deliverable Body: 2-Column Split View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Module Navigation & Summary */}
          <div className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-950/60 p-4 overflow-y-auto space-y-4">
            {/* Overview Card */}
            <div className="p-3.5 rounded-xl border border-neutral-800/80 bg-neutral-900/40 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Executive Overview
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {content.summary || content.subtitle}
              </p>
            </div>

            {/* Curriculum List */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold px-1">
                Curriculum Modules ({modules.length})
              </span>
              {modules.map((mod: any, idx: number) => {
                const isActive = activeModuleIdx === idx;
                const stepCount = mod.actionSteps?.length || 0;
                const completedInMod = (mod.actionSteps || []).filter(
                  (_: any, sIdx: number) => completedSteps[`${idx}_${sIdx}`]
                ).length;

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveModuleIdx(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                      isActive
                        ? 'border-cyan-500/80 bg-cyan-950/30 text-white shadow-sm ring-1 ring-cyan-500/30'
                        : 'border-neutral-800/70 bg-neutral-900/30 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    <span
                      className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-cyan-500 text-neutral-950'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      0{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate text-neutral-200">
                        {mod.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center justify-between">
                        <span>{stepCount} Action Steps</span>
                        {stepCount > 0 && (
                          <span
                            className={
                              completedInMod === stepCount
                                ? 'text-emerald-400 font-semibold'
                                : 'text-neutral-500'
                            }
                          >
                            {completedInMod}/{stepCount} done
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* License & Rights Badge */}
            <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-900/30 text-[11px] text-neutral-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Commercial Resale Rights</span>
              </div>
              <p className="text-[11px] text-neutral-500">
                You are authorized to sell, rebrand, or bundle this asset on your Whop store.
              </p>
            </div>
          </div>

          {/* Right Column: Active Module Detailed Content */}
          <div className="flex-1 p-5 sm:p-8 overflow-y-auto bg-neutral-950 space-y-6">
            {currentModule ? (
              <>
                {/* Module Header */}
                <div className="space-y-1.5 pb-4 border-b border-neutral-800">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
                    <span>MODULE 0{activeModuleIdx + 1} OF 0{modules.length}</span>
                    <span>·</span>
                    <span className="text-neutral-500">{currentModule.summary}</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {currentModule.title}
                  </h1>
                </div>

                {/* Interactive Action Steps Checklist */}
                {currentModule.actionSteps && currentModule.actionSteps.length > 0 && (
                  <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Execution Checklist (Interactive)
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        Click items to mark complete
                      </span>
                    </div>

                    <div className="space-y-2">
                      {currentModule.actionSteps.map((step: string, sIdx: number) => {
                        const stepKey = `${activeModuleIdx}_${sIdx}`;
                        const isDone = Boolean(completedSteps[stepKey]);

                        return (
                          <div
                            key={sIdx}
                            onClick={() => toggleStep(stepKey)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 text-xs ${
                              isDone
                                ? 'border-emerald-500/40 bg-emerald-950/20 text-neutral-300'
                                : 'border-neutral-800/80 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                            }`}
                          >
                            <span className="mt-0.5 text-emerald-400">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <Circle className="w-4 h-4 text-neutral-600" />
                              )}
                            </span>
                            <span className={isDone ? 'line-through text-neutral-500' : ''}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Deep Instructional Prose */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    Tactical Implementation Guide
                  </h3>
                  <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line bg-neutral-900/30 p-5 rounded-xl border border-neutral-800/80 font-sans">
                    {currentModule.fullContent}
                  </div>
                </div>

                {/* Ready-to-Use Resource / Master Prompt Box */}
                {currentModule.copyPasteResource && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Production Resource / Master Prompt
                      </span>
                      <button
                        onClick={() => handleCopyResource(currentModule.copyPasteResource)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 bg-cyan-950 border border-cyan-800 hover:border-cyan-600 text-cyan-400 rounded-md transition-colors"
                      >
                        {copiedResource ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Prompt</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-4 rounded-xl bg-black border border-neutral-800 text-neutral-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {currentModule.copyPasteResource}
                    </pre>
                  </div>
                )}

                {/* Module Footer Navigation */}
                <div className="pt-6 border-t border-neutral-800 flex items-center justify-between">
                  <button
                    disabled={activeModuleIdx === 0}
                    onClick={() => setActiveModuleIdx((p) => p - 1)}
                    className="px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none rounded-lg border border-neutral-800 transition-colors"
                  >
                    ← Previous Module
                  </button>

                  <div className="text-xs text-neutral-500 font-mono">
                    Module {activeModuleIdx + 1} of {modules.length}
                  </div>

                  <button
                    disabled={activeModuleIdx === modules.length - 1}
                    onClick={() => setActiveModuleIdx((p) => p + 1)}
                    className="px-3.5 py-2 text-xs font-medium text-neutral-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-30 disabled:pointer-events-none rounded-lg font-bold transition-colors"
                  >
                    Next Module →
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-neutral-500 text-sm">
                No module selected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
