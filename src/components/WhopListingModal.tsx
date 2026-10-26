import React, { useState, useEffect } from 'react';
import { WhopListingKit } from '../types';
import { X, Copy, Check, ExternalLink, Sparkles, Package, ShieldCheck, HelpCircle } from 'lucide-react';

interface WhopListingModalProps {
  assetId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const WhopListingModal: React.FC<WhopListingModalProps> = ({
  assetId,
  isOpen,
  onClose,
}) => {
  const [kit, setKit] = useState<WhopListingKit | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && assetId) {
      setLoading(true);
      fetch(`/api/assets/${assetId}/whop-listing-kit`)
        .then((res) => res.json())
        .then((data) => {
          setKit(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load listing kit:', err);
          setLoading(false);
        });
    }
  }, [isOpen, assetId]);

  if (!isOpen) return null;

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <Package className="h-3.5 w-3.5" />
              <span>Whop Marketplace Launch Kit</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Ready-to-Paste Whop Product Listing
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Everything required to launch this product on Whop in under 5 minutes without writing a single line of copy.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-neutral-400">
            Generating Whop Listing Package...
          </div>
        ) : kit ? (
          <div className="space-y-6">
            {/* Quick stats banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-neutral-800 bg-neutral-950 text-xs">
              <div>
                <span className="text-neutral-500 block text-[11px]">Recommended Price</span>
                <span className="text-emerald-400 font-bold font-mono text-base tabular-nums">
                  ${kit.suggestedPrice} USD
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Fulfillment Type</span>
                <span className="text-white font-semibold">Digital File / PDF</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Whop Category</span>
                <span className="text-cyan-400 font-semibold">{kit.category}</span>
              </div>
            </div>

            {/* Step-by-Step Whop Instructions */}
            <div className="p-4 rounded-xl border border-cyan-900/60 bg-cyan-950/20 space-y-2 text-xs">
              <span className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
                5-Minute Launch Procedure:
              </span>
              <ol className="space-y-1 text-neutral-300">
                {kit.instructions.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ol>
            </div>

            {/* Product Title & Tagline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Product Title
                </label>
                <button
                  onClick={() => handleCopy(kit.title, 'title')}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  {copiedSection === 'title' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy Title
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={kit.title}
                className="w-full px-3 py-2 text-xs font-medium bg-neutral-950 border border-neutral-800 rounded-md text-white select-all"
              />
            </div>

            {/* Full Formatted HTML Sales Copy for Whop Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Whop Store Description (Rich HTML)
                </label>
                <button
                  onClick={() => handleCopy(kit.formattedHtmlDescription, 'html')}
                  className="px-2.5 py-1 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors flex items-center gap-1"
                >
                  {copiedSection === 'html' ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied Full HTML
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy HTML Description
                    </>
                  )}
                </button>
              </div>
              <textarea
                readOnly
                rows={8}
                value={kit.formattedHtmlDescription}
                className="w-full p-3 text-xs font-mono bg-neutral-950 border border-neutral-800 rounded-md text-neutral-300 select-all"
              />
              <span className="text-[11px] text-neutral-500 block">
                Paste directly into the Whop Product Description box. It includes formatted headers, benefit bullets, money-back guarantee, and customer FAQs.
              </span>
            </div>

            {/* Deliverable File Download Trigger */}
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-white block">
                  Product Deliverable Document
                </span>
                <span className="text-neutral-400 text-[11px]">
                  Styled, branded masterclass with author details and resale rights.
                </span>
              </div>
              <a
                href={`/api/assets/${assetId}/deliverable-html`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open & Print PDF Deliverable
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
