import React, { useState, useEffect } from 'react';
import { UserAccount, GeneratedAsset } from './types';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { DigitalProductGenerator } from './components/DigitalProductGenerator';
import { ViralTrafficGenerator } from './components/ViralTrafficGenerator';
import { AffiliateDealEngine } from './components/AffiliateDealEngine';
import { ReadyCatalog } from './components/ReadyCatalog';
import { CashflowRoadmap } from './components/CashflowRoadmap';
import { SavedVault } from './components/SavedVault';
import { WhopIntegrationModal } from './components/WhopIntegrationModal';
import { UpgradeModal } from './components/UpgradeModal';
import { TechnicalAuditReport } from './components/TechnicalAuditReport';
import { WhopStoreOptimizer } from './components/WhopStoreOptimizer';
import { AutonomousWarRoom } from './components/AutonomousWarRoom';
import { WhopCommunitySuite } from './components/WhopCommunitySuite';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { MarketingStudio } from './components/MarketingStudio';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState<GeneratedAsset | null>(null);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const [userRes, assetsRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/assets'),
      ]);

      if (userRes.status === 401) {
        setAuthError('Unauthorized: Access to AutoCash AI requires a verified Whop user session.');
        setLoading(false);
        return;
      }

      const userData = await userRes.json();
      const assetsData = await assetsRes.json();
      setUser(userData.user);
      setAssets(assetsData.assets || []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssetCreated = (newAsset: GeneratedAsset) => {
    setAssets((prev) => [newAsset, ...prev]);
    // Refresh user credits
    fetch('/api/user')
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(console.error);
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await fetch(`/api/assets/${id}`, { method: 'DELETE' });
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleSelectAsset = (asset: GeneratedAsset) => {
    setSelectedAssetForEdit(asset);
    if (asset.type === 'digital_product') {
      setActiveTab('products');
    } else if (asset.type === 'viral_script') {
      setActiveTab('traffic');
    } else if (asset.type === 'affiliate_bridge') {
      setActiveTab('affiliate');
    } else if (asset.type === 'marketing_video' || asset.type === 'marketing_image') {
      setActiveTab('media');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
        <span className="text-xs font-mono text-neutral-400">
          Initializing AutoCash AI Engine...
        </span>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full p-8 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur space-y-5">
          <div className="mx-auto w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold text-xl">
            ⚡
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Whop Authentication Required</h1>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              AutoCash AI operates securely inside the Whop app ecosystem. To access your personal dashboard, products, and AI generation credits, please open this app within Whop.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <a
              href="https://whop.com/hub"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs rounded-lg transition-colors shadow-lg shadow-cyan-950/50"
            >
              Open in Whop Dashboard
            </a>
            <button
              onClick={fetchData}
              className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs rounded-lg border border-neutral-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-neutral-950">
      {/* 3-Zone Top Navigation Contract */}
      <TopNav
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedAssetForEdit(null);
          setActiveTab(tab);
        }}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            user={user}
            assets={assets}
            setActiveTab={setActiveTab}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
            onSelectAsset={handleSelectAsset}
          />
        )}

        {activeTab === 'warroom' && (
          <AutonomousWarRoom
            user={user}
            assets={assets}
            onAssetCreated={handleAssetCreated}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
          />
        )}

        {activeTab === 'media' && (
          <MarketingStudio
            user={user}
            onAssetCreated={handleAssetCreated}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
            initialVideoProject={selectedAssetForEdit?.type === 'marketing_video' ? selectedAssetForEdit.content : null}
          />
        )}

        {activeTab === 'catalog' && (
          <ReadyCatalog
            assets={assets}
            onSelectForEdit={handleSelectAsset}
          />
        )}

        {activeTab === 'products' && (
          <DigitalProductGenerator
            user={user}
            onAssetCreated={handleAssetCreated}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
            selectedAsset={selectedAssetForEdit}
          />
        )}

        {activeTab === 'optimizer' && (
          <WhopStoreOptimizer
            user={user}
            assets={assets}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
            onAssetUpdated={() => {
              // Refresh credits
              fetch('/api/user')
                .then((r) => r.json())
                .then((d) => setUser(d.user))
                .catch(console.error);
            }}
          />
        )}

        {activeTab === 'community' && (
          <WhopCommunitySuite
            user={user}
            assets={assets}
          />
        )}

        {activeTab === 'traffic' && (
          <ViralTrafficGenerator
            user={user}
            onAssetCreated={handleAssetCreated}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
            selectedAsset={selectedAssetForEdit}
          />
        )}

        {activeTab === 'affiliate' && (
          <AffiliateDealEngine
            user={user}
            onAssetCreated={handleAssetCreated}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
            selectedAsset={selectedAssetForEdit}
          />
        )}

        {activeTab === 'cashflow' && (
          <CashflowRoadmap setActiveTab={setActiveTab} />
        )}

        {activeTab === 'vault' && (
          <SavedVault
            assets={assets}
            onDeleteAsset={handleDeleteAsset}
            onSelectForEdit={handleSelectAsset}
          />
        )}

        {activeTab === 'whop' && (
          <WhopIntegrationModal
            user={user}
            onUserUpdated={(updated) => setUser(updated)}
          />
        )}

        {activeTab === 'audit' && (
          <TechnicalAuditReport />
        )}
      </main>

      {/* Upgrade / Membership Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        user={user}
        onPlanUpdated={(updated) => setUser(updated)}
      />

      {/* Command Palette Modal (Cmd+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tabId) => {
          setSelectedAssetForEdit(null);
          setActiveTab(tabId);
        }}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />

      {/* Quiet, anti-slop footer with clean links and copyright */}
      <footer className="border-t border-neutral-800 bg-neutral-950/80 py-6 text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-400">AutoCash AI</span>
            <span aria-hidden="true">·</span>
            <span>Whop Autopilot Monetization Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <button
              onClick={() => setActiveTab('optimizer')}
              className="hover:text-cyan-400 font-semibold transition-colors"
            >
              Conversion Radar
            </button>
            <button
              onClick={() => setActiveTab('cashflow')}
              className="hover:text-white transition-colors"
            >
              72h Blueprint
            </button>
            <button
              onClick={() => setActiveTab('whop')}
              className="hover:text-white transition-colors"
            >
              Webhook Engine
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className="hover:text-cyan-400 font-semibold transition-colors flex items-center gap-1"
            >
              📋 Audit Report
            </button>
            <button
              onClick={() => setIsUpgradeOpen(true)}
              className="hover:text-white transition-colors"
            >
              Plans
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
