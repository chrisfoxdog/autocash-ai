import React, { useState, useEffect } from 'react';
import {
  Search,
  Zap,
  Gauge,
  Video,
  Package,
  HeartHandshake,
  TrendingUp,
  FileText,
  ShieldCheck,
  Terminal,
  Sparkles,
  X,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tabId: string) => void;
  onOpenUpgrade: () => void;
}

interface ActionItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: any;
  tab: string;
  badge?: string;
}

const COMMAND_ACTIONS: ActionItem[] = [
  {
    id: 'warroom',
    title: 'Autonomous 1-Click Launch Terminal',
    category: 'God-Mode Engine',
    description: 'Synthesize 3-module product, deliverable HTML, and viral scripts in 5s',
    icon: Zap,
    tab: 'warroom',
    badge: 'Hot',
  },
  {
    id: 'optimizer',
    title: 'Whop Offer & Conversion Radar',
    category: 'AI Growth',
    description: 'Audit product title, pricing elasticity, friction, and 3 rewritten hooks',
    icon: Gauge,
    tab: 'optimizer',
    badge: 'New',
  },
  {
    id: 'community',
    title: 'Discord Welcome & 5-Star Review Engine',
    category: 'Community',
    description: 'Generate Discord embed welcome blast, post-checkout DMs, and reviews',
    icon: HeartHandshake,
    tab: 'community',
    badge: 'Pro',
  },
  {
    id: 'traffic',
    title: 'Viral Video Scripts & Mobile Teleprompter',
    category: 'Traffic',
    description: '3-second hook scripts with built-in vertical video teleprompter',
    icon: Video,
    tab: 'traffic',
  },
  {
    id: 'catalog',
    title: 'Turnkey Whop Products Catalog',
    category: 'Products',
    description: 'Inspect $39 fully authored playbooks ready for immediate sale',
    icon: Package,
    tab: 'catalog',
  },
  {
    id: 'products',
    title: 'Custom Product Studio & 1-Click Presets',
    category: 'Products',
    description: 'Generate tailored playbooks, prompt vaults, and challenge guides',
    icon: Sparkles,
    tab: 'products',
  },
  {
    id: 'dashboard',
    title: 'Autopilot MRR Simulator & Cockpit',
    category: 'Finance',
    description: 'Model price, weekly sales, VIP recurring members, and net payouts',
    icon: TrendingUp,
    tab: 'dashboard',
  },
  {
    id: 'vault',
    title: 'Saved Revenue Asset Vault',
    category: 'Database',
    description: 'Search, inspect, export HTML, and download all generated assets',
    icon: FileText,
    tab: 'vault',
  },
  {
    id: 'whop',
    title: 'Whop Webhook & Security Engine',
    category: 'Integration',
    description: 'Inspect HMAC-SHA256 signature verification and checkout settings',
    icon: ShieldCheck,
    tab: 'whop',
  },
];

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenUpgrade,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return COMMAND_ACTIONS;
    return COMMAND_ACTIONS.filter(
      (act) =>
        act.title.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q) ||
        act.category.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const selectTabRef = React.useRef(onSelectTab);
  selectTabRef.current = onSelectTab;
  const closeRef = React.useRef(onClose);
  closeRef.current = onClose;

  // Global Keyboard listener for arrow keys and Enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected) {
          selectTabRef.current(selected.tab);
          closeRef.current();
        }
      } else if (e.key === 'Escape') {
        closeRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-neutral-800 flex items-center gap-3 bg-neutral-900/60">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, tool, or action (e.g. War Room, Teleprompter, Discord)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none font-sans"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-neutral-900 border border-neutral-800 rounded text-neutral-400">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-[380px] overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 font-mono">
              No matching commands or tools found for "{query}"
            </div>
          ) : (
            filtered.map((action, i) => {
              const Icon = action.icon;
              const isSelected = selectedIndex === i;

              return (
                <div
                  key={action.id}
                  onClick={() => {
                    onSelectTab(action.tab);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-cyan-950/40 border border-cyan-800 text-white'
                      : 'hover:bg-neutral-900/60 text-neutral-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-cyan-500 text-neutral-950 font-bold'
                          : 'bg-neutral-900 text-cyan-400 border border-neutral-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{action.title}</span>
                        {action.badge && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 text-[10px] font-mono border border-cyan-800 font-semibold">
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 line-clamp-1">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-neutral-500">
                    {action.category} →
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Command Deck Footer */}
        <div className="p-3 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>

          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>AutoCash AI Fast Command</span>
          </div>
        </div>
      </div>
    </div>
  );
};
