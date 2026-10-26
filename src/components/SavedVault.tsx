import React, { useState } from 'react';
import { GeneratedAsset } from '../types';
import {
  Package,
  Video,
  Share2,
  Trash2,
  Copy,
  Check,
  Download,
  Search,
  ExternalLink,
  Eye,
  X,
  Link2,
  FileText,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  BookOpen,
  Film,
  Image as ImageIcon,
} from 'lucide-react';
import { DeliverableReaderModal } from './DeliverableReaderModal';

interface SavedVaultProps {
  assets: GeneratedAsset[];
  onDeleteAsset: (id: string) => void;
  onSelectForEdit: (asset: GeneratedAsset) => void;
}

type CopyFormat = 'primary' | 'description' | 'script' | 'link' | 'full' | 'json';

export const SavedVault: React.FC<SavedVaultProps> = ({
  assets,
  onDeleteAsset,
  onSelectForEdit,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [previewAsset, setPreviewAsset] = useState<GeneratedAsset | null>(null);
  const [previewTab, setPreviewTab] = useState<'formatted' | 'json'>('formatted');
  const [readerAsset, setReaderAsset] = useState<GeneratedAsset | null>(null);
  
  // Track copied state per asset and format: key `${assetId}:${format}`
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.title.toLowerCase().includes(search.toLowerCase()) ||
      asset.niche.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'all' || asset.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Extract clean text for copying
  const getAssetCopyContent = (asset: GeneratedAsset, format: CopyFormat): { text: string; label: string } => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const deliverableLink = `${origin}/api/assets/${asset.id}/deliverable-html`;

    if (format === 'json') {
      return {
        text: JSON.stringify(asset.content, null, 2),
        label: 'JSON Data',
      };
    }

    if (format === 'link') {
      if (asset.type === 'affiliate_bridge') {
        const link = asset.content?.officialSignupUrl || asset.content?.affiliateLink || deliverableLink;
        return { text: link, label: 'Affiliate Link' };
      }
      return { text: deliverableLink, label: 'Deliverable Link' };
    }

    if (asset.type === 'viral_script') {
      const c = asset.content || {};
      const scriptBody = c.spokenScript || c.scriptBody || c.script || '';
      const visualDir = c.visualDirections || c.visualCues || '';
      const hook = c.hook || '';
      const cta = c.cta || '';
      const hashtags = Array.isArray(c.hashtags) ? c.hashtags.join(' ') : c.hashtags || '';
      const pinned = c.pinnedComment || '';

      if (format === 'primary' || format === 'script' || format === 'full') {
        const lines = [
          `# ${asset.title}`,
          `Niche: ${asset.niche}`,
          '',
          `🎯 HOOK (0-3s):`,
          `"${hook}"`,
          '',
          visualDir ? `🎬 VISUAL DIRECTIONS:\n${visualDir}\n` : '',
          `🎙️ SPOKEN SCRIPT:\n${scriptBody}`,
          '',
          cta ? `👉 CALL TO ACTION:\n${cta}\n` : '',
          pinned ? `📌 PINNED COMMENT (Drop your link here):\n"${pinned}"\n` : '',
          hashtags ? `🏷️ HASHTAGS:\n${hashtags}` : '',
        ].filter(Boolean).join('\n');

        return { text: lines, label: 'Viral Script' };
      }
    }

    if (asset.type === 'digital_product') {
      const c = asset.content || {};
      const salesCopy = c.whopSalesCopy || {};
      const headline = salesCopy.headline || c.subtitle || '';
      const bullets = Array.isArray(salesCopy.bullets)
        ? salesCopy.bullets.map((b: string) => `• ${b}`).join('\n')
        : '';
      const guarantee = salesCopy.guarantee || '';
      const price = c.suggestedPrice ? `$${c.suggestedPrice} USD` : '$39 USD';

      if (format === 'description' || format === 'primary') {
        // High-converting Whop sales copy description
        const text = [
          `# ${asset.title}`,
          `Whop Store Price: ${price}`,
          '',
          headline ? `## ${headline}\n` : '',
          c.summary ? `### Overview:\n${c.summary}\n` : '',
          bullets ? `### What You Receive Inside:\n${bullets}\n` : '',
          guarantee ? `### Action Guarantee:\n${guarantee}\n` : '',
          salesCopy.faq && Array.isArray(salesCopy.faq)
            ? `### Frequently Asked Questions:\n` +
              salesCopy.faq.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
            : '',
        ].filter(Boolean).join('\n');

        return { text, label: 'Whop Sales Description' };
      }

      if (format === 'full') {
        // Complete playbook with all modules
        let fullText = `# ${asset.title}\nPrice: ${price}\n\n${c.summary || ''}\n\n`;
        if (c.modules && Array.isArray(c.modules)) {
          c.modules.forEach((mod: any, idx: number) => {
            fullText += `========================================\n`;
            fullText += `MODULE ${mod.moduleNumber || idx + 1}: ${mod.title}\n`;
            fullText += `========================================\n`;
            if (mod.summary) fullText += `Objective: ${mod.summary}\n\n`;
            if (mod.actionSteps && Array.isArray(mod.actionSteps)) {
              fullText += `Action Steps:\n${mod.actionSteps.map((s: string) => `[ ] ${s}`).join('\n')}\n\n`;
            }
            if (mod.fullContent) {
              fullText += `Content:\n${mod.fullContent}\n\n`;
            }
            if (mod.copyPasteResource) {
              fullText += `Copy-Paste Resource / Prompt:\n${mod.copyPasteResource}\n\n`;
            }
          });
        }
        return { text: fullText, label: 'Full Playbook Deliverable' };
      }
    }

    if (asset.type === 'affiliate_bridge') {
      const c = asset.content || {};
      const targetTool = c.targetProduct || c.productName || 'Recommended Software';
      const comm = c.commissionEstimate || '30%-50% Recurring';
      const emailDraft = c.emailDraft || {};
      const subject = emailDraft.subject || c.headline || '';
      const body = emailDraft.body || c.fullReview || c.comparisonAnalysis || '';
      const signupLink = c.officialSignupUrl || c.affiliateLink || 'https://whop.com';

      if (format === 'primary' || format === 'description' || format === 'full') {
        const text = [
          `# Affiliate Review & Pitch: ${targetTool}`,
          `Recurring Commission: ${comm}`,
          `Affiliate Link: ${signupLink}`,
          '',
          subject ? `Subject: ${subject}\n` : '',
          `Pitch & Review Body:\n${body}`,
          '',
          `CTA Link: ${signupLink}`,
        ].filter(Boolean).join('\n');

        return { text, label: 'Affiliate Pitch & Review' };
      }
    }

    // Default fallback
    return {
      text: typeof asset.content === 'string' ? asset.content : JSON.stringify(asset.content, null, 2),
      label: 'Asset Content',
    };
  };

  const handleCopy = async (asset: GeneratedAsset, format: CopyFormat) => {
    const { text, label } = getAssetCopyContent(asset, format);
    let success = false;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      }
    } catch (err) {
      console.warn('Clipboard writeText failed, using fallback', err);
    }

    if (!success) {
      // Fallback method for robust browser support
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
    }

    if (success) {
      const key = `${asset.id}:${format}`;
      setCopiedKey(key);
      setToastMessage(`Copied ${label} for "${asset.title.slice(0, 32)}..." to clipboard!`);
      setOpenDropdownId(null);

      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2200);

      setTimeout(() => {
        setToastMessage(null);
      }, 3500);
    }
  };

  const isCopied = (assetId: string, format: CopyFormat) => {
    return copiedKey === `${assetId}:${format}`;
  };

  const isAnyCopiedForAsset = (assetId: string) => {
    return copiedKey?.startsWith(`${assetId}:`);
  };

  const handleDownloadAsset = (asset: GeneratedAsset) => {
    const { text } = getAssetCopyContent(asset, 'full');
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification for Clipboard Copy Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-neutral-900 border border-emerald-500/50 text-white shadow-2xl shadow-emerald-950/50 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
          <span>Server Database</span>
          <span aria-hidden="true">·</span>
          <span>Persistent Storage</span>
          <span aria-hidden="true">·</span>
          <span className="text-cyan-400 font-medium">1-Click Clipboard Utilities</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Saved Revenue Asset Vault
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Every generated playbook, script, and bridge page is stored permanently in your backend database. Use the instant Copy utility to copy ready-to-paste scripts, product descriptions, or links directly to your clipboard.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-neutral-800 bg-neutral-900/60">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search saved assets by title or niche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: `All Assets (${assets.length})` },
            { id: 'digital_product', label: 'Products' },
            { id: 'marketing_video', label: 'Videos' },
            { id: 'marketing_image', label: 'Images' },
            { id: 'viral_script', label: 'Viral Scripts' },
            { id: 'affiliate_bridge', label: 'Affiliates' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 font-medium rounded-md whitespace-nowrap transition-colors ${
                filterType === tab.id
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Grid */}
      {filteredAssets.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30">
          <Package className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No Assets Found</h3>
          <p className="text-xs text-neutral-500 mt-1">
            {search ? 'Try adjusting your search criteria.' : 'Generate your first digital product, marketing video, or visual to populate your vault.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => {
            const isProduct = asset.type === 'digital_product';
            const isScript = asset.type === 'viral_script';
            const isAffiliate = asset.type === 'affiliate_bridge';
            const isVideo = asset.type === 'marketing_video';
            const isImage = asset.type === 'marketing_image';

            // Primary copy button labels based on type
            const primaryCopyLabel = isScript
              ? 'Copy Script'
              : isProduct
              ? 'Copy Description'
              : isVideo
              ? 'Open in Video Studio'
              : isImage
              ? 'Copy Image Data'
              : 'Copy Pitch & Review';

            const primaryCopied = isCopied(asset.id, 'primary');
            const linkCopied = isCopied(asset.id, 'link');
            const fullCopied = isCopied(asset.id, 'full');
            const isDropdownOpen = openDropdownId === asset.id;

            return (
              <div
                key={asset.id}
                className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      {isProduct && <Package className="h-3.5 w-3.5 text-cyan-400" />}
                      {isScript && <Video className="h-3.5 w-3.5 text-emerald-400" />}
                      {isAffiliate && <Share2 className="h-3.5 w-3.5 text-blue-400" />}
                      {isVideo && <Film className="h-3.5 w-3.5 text-purple-400" />}
                      {isImage && <ImageIcon className="h-3.5 w-3.5 text-pink-400" />}
                      <span className="capitalize">{asset.type.replace('_', ' ')}</span>
                      {asset.content?.aiPersonaUsed && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-cyan-900/60 bg-cyan-950/40 text-cyan-300 capitalize">
                          {asset.content.aiPersonaUsed.replace('_', ' ')}
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {isImage && asset.content?.imageUrl && (
                    <div className="mb-3 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 h-36 flex items-center justify-center">
                      <img
                        src={asset.content.imageUrl}
                        alt={asset.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <h3 className="text-sm font-bold text-white mb-1.5 line-clamp-2">
                    {asset.title}
                  </h3>

                  <p className="text-xs text-neutral-400 mb-3">
                    Niche: <span className="text-neutral-300 font-medium">{asset.niche}</span>
                  </p>

                  {isVideo && (
                    <div className="mb-3 flex items-center gap-2 text-[11px] font-mono text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-900/50">
                      <span>🎬 {asset.content?.scenes?.length || 4} Scenes</span>
                      <span>•</span>
                      <span>{asset.content?.platform || '9:16'}</span>
                      <span>•</span>
                      <span>{asset.content?.totalDurationSeconds || 15}s</span>
                    </div>
                  )}

                  {isProduct && asset.content?.suggestedPrice && (
                    <div className="mb-4 inline-block text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                      Whop Price: ${asset.content.suggestedPrice} USD
                    </div>
                  )}

                  {isScript && asset.content?.hook && (
                    <p className="text-xs text-neutral-300 italic mb-4 line-clamp-2 bg-neutral-950 p-2 rounded border border-neutral-800/80">
                      "{asset.content.hook}"
                    </p>
                  )}

                  {isAffiliate && (
                    <div className="mb-4 inline-block text-xs font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/50">
                      {asset.content?.commissionEstimate || 'Recurring SaaS'}
                    </div>
                  )}

                  {/* Dedicated Copy Utility Section on Card */}
                  <div className="my-3 p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800/80">
                    <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-2 flex items-center justify-between">
                      <span>Quick Copy to Clipboard</span>
                      {isAnyCopiedForAsset(asset.id) && (
                        <span className="text-emerald-400 font-medium flex items-center gap-1 normal-case">
                          <Check className="h-3 w-3" /> Copied!
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 relative">
                      {/* Main Copy Button */}
                      <button
                        onClick={() => handleCopy(asset, 'primary')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-medium rounded-md transition-all ${
                          primaryCopied
                            ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-950'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700/60 active:scale-[0.98]'
                        }`}
                        title={`Copy ${primaryCopyLabel} to clipboard`}
                      >
                        {primaryCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400 animate-in zoom-in-50 duration-150" />
                            <span className="font-semibold text-emerald-400">Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-neutral-400" />
                            <span>{primaryCopyLabel}</span>
                          </>
                        )}
                      </button>

                      {/* Copy Link Utility Button */}
                      <button
                        onClick={() => handleCopy(asset, 'link')}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2.5 text-xs font-medium rounded-md transition-all ${
                          linkCopied
                            ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800'
                        }`}
                        title="Copy link (deliverable or affiliate URL)"
                      >
                        {linkCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-[11px] font-semibold text-emerald-400">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Link2 className="h-3.5 w-3.5 text-neutral-400" />
                            <span>Link</span>
                          </>
                        )}
                      </button>

                      {/* Dropdown for More Copy Options */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdownId(isDropdownOpen ? null : asset.id)}
                          className="py-1.5 px-2 text-xs font-medium rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
                          title="More copy options"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute right-0 bottom-full mb-1 w-52 p-1.5 rounded-lg bg-neutral-900 border border-neutral-700 shadow-xl z-30 text-xs space-y-1">
                            {isProduct && (
                              <>
                                <button
                                  onClick={() => handleCopy(asset, 'description')}
                                  className="w-full text-left px-2.5 py-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-between"
                                >
                                  <span>Whop Sales Copy</span>
                                  {isCopied(asset.id, 'description') && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                                </button>
                                <button
                                  onClick={() => handleCopy(asset, 'full')}
                                  className="w-full text-left px-2.5 py-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-between"
                                >
                                  <span>Full Course Playbook</span>
                                  {fullCopied && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                                </button>
                              </>
                            )}

                            {isScript && (
                              <>
                                <button
                                  onClick={() => handleCopy(asset, 'script')}
                                  className="w-full text-left px-2.5 py-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-between"
                                >
                                  <span>Full Video Script</span>
                                  {isCopied(asset.id, 'script') && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                                </button>
                                {asset.content?.hook && (
                                  <button
                                    onClick={async () => {
                                      await navigator.clipboard.writeText(`"${asset.content.hook}"`);
                                      setCopiedKey(`${asset.id}:hook`);
                                      setToastMessage('Copied hook to clipboard!');
                                      setOpenDropdownId(null);
                                      setTimeout(() => setCopiedKey(null), 2000);
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-between"
                                  >
                                    <span>Hook Only</span>
                                    {copiedKey === `${asset.id}:hook` && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                                  </button>
                                )}
                              </>
                            )}

                            {isAffiliate && (
                              <button
                                onClick={() => handleCopy(asset, 'full')}
                                className="w-full text-left px-2.5 py-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-between"
                              >
                                <span>Full Review & Email</span>
                                {fullCopied && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                              </button>
                            )}

                            <button
                              onClick={() => handleCopy(asset, 'link')}
                              className="w-full text-left px-2.5 py-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-between"
                            >
                              <span>Direct Link</span>
                              {linkCopied && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                            </button>

                            <button
                              onClick={() => handleCopy(asset, 'json')}
                              className="w-full text-left px-2.5 py-1.5 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 flex items-center justify-between border-t border-neutral-800 pt-1 mt-1"
                            >
                              <span>Raw JSON</span>
                              {isCopied(asset.id, 'json') && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setPreviewAsset(asset);
                        setPreviewTab('formatted');
                      }}
                      className="flex items-center gap-1 text-neutral-300 hover:text-white font-medium"
                    >
                      <Eye className="h-3.5 w-3.5 text-cyan-400" />
                      Inspect
                    </button>

                    {isProduct && (
                      <button
                        onClick={() => setReaderAsset(asset)}
                        className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border border-cyan-800 font-semibold transition-colors"
                      >
                        <BookOpen className="h-3 w-3" />
                        <span>Read</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadAsset(asset)}
                      title="Download markdown deliverable file"
                      className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteAsset(asset.id)}
                      title="Delete asset"
                      className="p-1.5 text-neutral-500 hover:text-rose-400 rounded hover:bg-neutral-800 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Asset Preview / Inspection Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase">
                  <span>{previewAsset.type.replace('_', ' ')}</span>
                  <span>·</span>
                  <span>{previewAsset.niche}</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  {previewAsset.title}
                </h2>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Tabs: Formatted Reader vs Raw JSON */}
            <div className="flex items-center justify-between px-6 pt-3 border-b border-neutral-800 bg-neutral-950/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewTab('formatted')}
                  className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    previewTab === 'formatted'
                      ? 'border-cyan-400 text-white'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Formatted Content Reader
                </button>
                <button
                  onClick={() => setPreviewTab('json')}
                  className={`pb-2.5 px-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    previewTab === 'json'
                      ? 'border-cyan-400 text-white'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>JSON Payload</span>
                </button>
              </div>

              {/* Quick Deliverable Link in Modal Header */}
              {previewAsset.type === 'digital_product' && (
                <a
                  href={`/api/assets/${previewAsset.id}/deliverable-html`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 pb-2.5"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open Live HTML
                </a>
              )}
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto flex-1 text-xs">
              {previewTab === 'formatted' ? (
                <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-neutral-200 whitespace-pre-wrap leading-relaxed select-text">
                  {getAssetCopyContent(previewAsset, 'full').text}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed select-text">
                  {JSON.stringify(previewAsset.content, null, 2)}
                </div>
              )}
            </div>

            {/* Modal Footer / Copy Action Bar with Visual Feedback Indicators */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  onSelectForEdit(previewAsset);
                  setPreviewAsset(null);
                }}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                Load into Generator Editor →
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Copy Primary Content (Script, Description, or Review) */}
                <button
                  onClick={() => handleCopy(previewAsset, 'primary')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    isCopied(previewAsset.id, 'primary')
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                  }`}
                >
                  {isCopied(previewAsset.id, 'primary') ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-neutral-400" />
                      <span>
                        {previewAsset.type === 'viral_script'
                          ? 'Copy Script'
                          : previewAsset.type === 'digital_product'
                          ? 'Copy Sales Copy'
                          : 'Copy Review'}
                      </span>
                    </>
                  )}
                </button>

                {/* 2. Copy Link Button */}
                <button
                  onClick={() => handleCopy(previewAsset, 'link')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    isCopied(previewAsset.id, 'link')
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                  }`}
                >
                  {isCopied(previewAsset.id, 'link') ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="h-3.5 w-3.5 text-neutral-400" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                {/* 3. Copy JSON Button */}
                <button
                  onClick={() => handleCopy(previewAsset, 'json')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    isCopied(previewAsset.id, 'json')
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                  }`}
                >
                  {isCopied(previewAsset.id, 'json') ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">JSON Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-neutral-400" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>

                {/* 4. Download File */}
                <button
                  onClick={() => handleDownloadAsset(previewAsset)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Deliverable</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Deliverable Reader Modal */}
      {readerAsset && (
        <DeliverableReaderModal
          asset={readerAsset}
          isOpen={Boolean(readerAsset)}
          onClose={() => setReaderAsset(null)}
          onOpenListingKit={(id) => {
            setReaderAsset(null);
            onSelectForEdit(readerAsset);
          }}
        />
      )}
    </div>
  );
};
