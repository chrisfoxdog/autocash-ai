import React from 'react';
import { UserAccount } from '../types';
import { Sparkles, ShieldCheck, Zap, Search } from 'lucide-react';

interface TopNavProps {
  user: UserAccount | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpgrade: () => void;
  onOpenCommandPalette: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenUpgrade,
  onOpenCommandPalette,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'warroom', label: '⚡ Autopilot War Room' },
    { id: 'media', label: '🎬 Video & Image Studio' },
    { id: 'catalog', label: 'Turnkey Catalog' },
    { id: 'products', label: 'Product Studio' },
    { id: 'optimizer', label: '🎯 Conversion Radar' },
    { id: 'community', label: '💬 Community & Reviews' },
    { id: 'traffic', label: 'Viral Traffic' },
    { id: 'affiliate', label: 'Recurring Deals' },
    { id: 'cashflow', label: '72h Blueprint' },
    { id: 'vault', label: 'Vault' },
    { id: 'whop', label: 'Whop Engine' },
    { id: 'audit', label: '📋 Audit' },
  ];

  const planLabel = user?.plan === 'empire' ? 'Empire' : user?.plan === 'pro' ? 'Pro' : 'Free';
  const planColor =
    user?.plan === 'empire'
      ? 'text-cyan-400 bg-cyan-950/60 border-cyan-800'
      : user?.plan === 'pro'
      ? 'text-blue-400 bg-blue-950/60 border-blue-800'
      : 'text-neutral-400 bg-neutral-900 border-neutral-800';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text wordmark in display face */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 text-left font-semibold tracking-tight text-white hover:text-cyan-400 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-600 text-neutral-950 font-bold text-xs">
              ⚡
            </div>
            <span className="text-base tracking-tight font-bold">AutoCash AI</span>
          </button>
        </div>

        {/* Zone 2: Navigation links, single-line text */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium transition-colors rounded-md ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-900/60'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Command Launcher */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md transition-colors font-mono cursor-pointer"
            title="Press Cmd+K or Ctrl+K to open Quick Command Palette"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline text-[11px]">Command</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] bg-neutral-950 border border-neutral-800 rounded text-neutral-400">
              ⌘K
            </kbd>
          </button>

          {/* Credits Display */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono tabular-nums text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-md">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>
              {user?.plan === 'empire' ? '∞' : user?.credits ?? 0}
            </span>
            <span className="text-neutral-500 font-sans text-[11px]">credits</span>
          </div>

          {/* Plan badge & Upgrade trigger */}
          <button
            onClick={onOpenUpgrade}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium border rounded-md transition-all ${planColor} hover:brightness-110`}
          >
            <Sparkles className="h-3 w-3" />
            <span className="capitalize">{planLabel}</span>
            {user?.plan === 'free' && (
              <span className="text-cyan-400 font-bold ml-1">Upgrade</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Sub-Navigation Bar */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto py-2 px-4 border-t border-neutral-800/80 bg-neutral-950/95 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-medium transition-colors rounded-md ${
                isActive
                  ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-800'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
