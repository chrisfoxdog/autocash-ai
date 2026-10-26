import React, { useState } from 'react';
import { GeneratedAsset } from '../types';
import {
  Package,
  ExternalLink,
  Download,
  Copy,
  Check,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Sparkles,
  Layers,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { WhopListingModal } from './WhopListingModal';
import { DeliverableReaderModal } from './DeliverableReaderModal';

interface ReadyCatalogProps {
  assets: GeneratedAsset[];
  onSelectForEdit: (asset: GeneratedAsset) => void;
}

export const ReadyCatalog: React.FC<ReadyCatalogProps> = ({
  assets,
  onSelectForEdit,
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [listingModalAssetId, setListingModalAssetId] = useState<string | null>(null);
  const [isDeliverableReaderOpen, setIsDeliverableReaderOpen] = useState(false);

  // Filter only digital products
  const products = assets.filter((a) => a.type === 'digital_product');

  // Currently expanded product
  const activeProduct =
    products.find((p) => p.id === selectedAssetId) || products[0] || null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
          <span>Ready-To-Sell Catalog</span>
          <span aria-hidden="true">·</span>
          <span>100% Authored Digital Assets</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400 font-medium">Zero Setup Required</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Turnkey Whop Products Ready For Launch
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl">
          Every product below is completely authored with real instructional depth, master prompts, actionable execution checklists, and pre-formatted Whop sales pages. You can upload the deliverable and start selling today for $29–$49.
        </p>
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((prod) => {
          const isSelected = activeProduct?.id === prod.id;
          const price = prod.content?.suggestedPrice || 39;
          const moduleCount = prod.content?.modules?.length || 1;

          return (
            <div
              key={prod.id}
              onClick={() => setSelectedAssetId(prod.id)}
              className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-cyan-500/80 bg-cyan-950/20 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                  : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-cyan-400 font-mono font-semibold">
                    {moduleCount} Modules
                  </span>
                  <span className="text-emerald-400 font-bold font-mono tabular-nums">
                    ${price} USD
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-2 mb-1.5">
                  {prod.title}
                </h3>

                <p className="text-xs text-neutral-400 line-clamp-2">
                  {prod.content?.subtitle || prod.content?.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800/80 mt-4 flex items-center justify-between text-xs">
                <span className="text-neutral-500 text-[11px] font-mono">
                  {prod.niche}
                </span>
                <span className={`font-medium ${isSelected ? 'text-cyan-400' : 'text-neutral-400'}`}>
                  {isSelected ? 'Viewing' : 'Inspect →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Inspection Panel for Selected Product */}
      {activeProduct && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
          {/* Top banner */}
          <div className="p-6 border-b border-neutral-800 bg-neutral-900 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                <span>{activeProduct.niche}</span>
                <span aria-hidden="true">·</span>
                <span>Retail Price: ${activeProduct.content?.suggestedPrice || 39} USD</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400">Complete Masterclass</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeProduct.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-3xl">
                {activeProduct.content?.subtitle}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsDeliverableReaderOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-md"
              >
                <BookOpen className="h-4 w-4" />
                Read Interactive Deliverable
              </button>

              <a
                href={`/api/assets/${activeProduct.id}/deliverable-html`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-md"
              >
                <ExternalLink className="h-4 w-4" />
                Print / Save PDF Deliverable
              </a>

              <button
                onClick={() => setListingModalAssetId(activeProduct.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors shadow-sm"
              >
                <Package className="h-4 w-4 text-cyan-400" />
                Whop Listing Kit
              </button>

              <button
                onClick={() => onSelectForEdit(activeProduct)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors"
              >
                <Sparkles className="h-4 w-4 text-cyan-400" />
                Customize in Studio
              </button>
            </div>
          </div>

          {/* Product Content Details */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Overview Box */}
            <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-950 text-xs space-y-2">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                Transformation Summary & Value Proposition
              </span>
              <p className="text-neutral-300 leading-relaxed text-sm">
                {activeProduct.content?.summary}
              </p>
            </div>

            {/* Modules Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Curriculum & Implementation Modules ({activeProduct.content?.modules?.length || 0})
                </h3>
                <span className="text-xs text-neutral-500">
                  Full text embedded inside deliverable
                </span>
              </div>

              <div className="space-y-4">
                {activeProduct.content?.modules?.map((mod: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-neutral-800 bg-neutral-950/70 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-mono text-cyan-400">
                          MODULE 0{idx + 1}
                        </span>
                        <h4 className="text-base font-semibold text-white mt-0.5">
                          {mod.title}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {mod.summary}
                    </p>

                    {mod.actionSteps && (
                      <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800/80 text-xs space-y-1.5">
                        <span className="font-semibold text-neutral-300 text-[11px] uppercase tracking-wider">
                          Action Checklist:
                        </span>
                        <ul className="space-y-1 text-neutral-400">
                          {mod.actionSteps.map((step: string, sIdx: number) => (
                            <li key={sIdx} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line border-t border-neutral-800/60 pt-3">
                      {mod.fullContent}
                    </div>

                    {mod.copyPasteResource && (
                      <div className="p-3.5 rounded-lg bg-black border border-neutral-800 space-y-1.5">
                        <span className="text-[11px] font-mono text-cyan-400 font-semibold block">
                          Included Production Prompt / Template Snippet
                        </span>
                        <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap">
                          {mod.copyPasteResource}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sales Copy Preview */}
            {activeProduct.content?.whopSalesCopy && (
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950 space-y-4">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                  Whop Marketplace Copy Preview
                </span>
                <h4 className="text-lg font-bold text-white">
                  {activeProduct.content.whopSalesCopy.headline}
                </h4>

                <div className="space-y-2">
                  {activeProduct.content.whopSalesCopy.bullets?.map((b: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-neutral-800 text-xs text-neutral-400">
                  <strong className="text-white">Guarantee:</strong>{' '}
                  {activeProduct.content.whopSalesCopy.guarantee}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Listing Kit Modal */}
      {listingModalAssetId && (
        <WhopListingModal
          assetId={listingModalAssetId}
          isOpen={Boolean(listingModalAssetId)}
          onClose={() => setListingModalAssetId(null)}
        />
      )}

      {/* Deliverable Reader Modal */}
      {activeProduct && (
        <DeliverableReaderModal
          asset={activeProduct}
          isOpen={isDeliverableReaderOpen}
          onClose={() => setIsDeliverableReaderOpen(false)}
          onOpenListingKit={(id) => setListingModalAssetId(id)}
        />
      )}
    </div>
  );
};
