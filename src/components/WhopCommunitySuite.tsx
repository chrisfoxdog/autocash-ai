import React, { useState } from 'react';
import { UserAccount, GeneratedAsset } from '../types';
import {
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  Star,
  ShieldCheck,
  TrendingUp,
  Flame,
  ArrowRight,
  ExternalLink,
  Users,
  Bell,
  HeartHandshake,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WhopCommunitySuiteProps {
  user: UserAccount | null;
  assets: GeneratedAsset[];
}

export const WhopCommunitySuite: React.FC<WhopCommunitySuiteProps> = ({
  user,
  assets,
}) => {
  const productAssets = assets.filter((a) => a.type === 'digital_product');
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    productAssets[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'discord' | 'dm_welcome' | 'review_booster' | 'upsell'>(
    'discord'
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedAsset =
    productAssets.find((a) => a.id === selectedAssetId) || productAssets[0];

  const productName = selectedAsset?.title || 'The 2026 AI Solopreneur Workflow Playbook';
  const niche = selectedAsset?.niche || 'AI Productivity & Solopreneurship';
  const price = selectedAsset?.content?.suggestedPrice || 39;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#06b6d4', '#10b981', '#ffffff'],
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Discord Embed Announcement
  const discordAnnouncement = `🎉 **NEW MEMBER UNLOCKED ACCESS!** 🎉

Please give a warm welcome to our newest operator joining the **${productName}** container! 🚀

📌 **QUICK-START INSTRUCTIONS FOR NEW MEMBERS:**
1️⃣ Head over to <#getting-started> and grab your official formatted HTML deliverable.
2️⃣ Open Module 01: Validate your initial offer before this weekend.
3️⃣ Drop your action checklist progress in <#wins-and-results> to get community feedback!

💎 **Need Support?** Ping <@&Community-Moderator> or check the pinned resources in <#faq>.
*Delivered securely via Whop Checkout · Let's get to work!*`;

  // Onboarding DM Sequence
  const onboardingDm = `Hey there! 👋 

Just saw your order go through on Whop for **${productName}**. Huge congratulations on taking action!

Here is your private member access link:
👉 **Fulfillment Portal:** ${typeof window !== 'undefined' ? window.location.origin : ''}/api/assets/${selectedAsset?.id || 'prod_solopreneur_playbook'}/deliverable-html

**My #1 Tip for Today:**
Do not try to consume everything at once. Open Module 01, complete the 3 execution checklist items, and copy the master prompt into your workflow.

If you have any questions, reply directly to this message. I read every single one!

Best,
${user?.email?.split('@')[0] || 'Your Store Creator'}`;

  // 48-Hour Review Extraction Message
  const reviewBooster = `Hey! 👋 Checking in 48 hours after your purchase of **${productName}**.

How did the Module 01 action steps go for you?

If you found value in the guides and prompt templates, would you do me a quick 30-second favor?

Drop a quick honest review on our Whop product page here:
⭐ **Leave 5-Star Review on Whop:** https://whop.com/hub (Products → Reviews)

**To say thank you:** Once you leave a review, send me a screenshot and I'll immediately unlock our private **"High-Converting Viral Hooks Swipe Vault"** (valued at $27) free inside your account!

Appreciate you! 🙌`;

  // VIP Recurring Upsell Message
  const upsellPitch = `⚡ **EXCLUSIVE VIP COMMUNITY UPGRADE FOR PLAYBOOK OWNERS** ⚡

Hey operator! Since you invested in **${productName}**, you've already experienced our tactical implementation guides.

Starting this month, we are opening 25 spots for our private **Autopilot Mastermind & Weekly Sprint Room**:

**What VIP Members Get Every Single Month:**
✅ Weekly 30-minute live breakdown sessions & live Q&As
✅ Monthly updated Master Prompt Vaults & new high-margin turnkey templates
✅ Private member deal flow & accountability sprints
✅ Direct 1-on-1 feedback on your Whop store listings

**Special Playbook Owner Rate:**
Normally $49/month — claim your locked-in rate for only **$29/month** (cancel anytime with 1 click).

👉 **Claim Your VIP Spot Here:** [Insert Whop VIP Checkout Link]`;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
          <span>Whop Ecosystem Supercharge</span>
          <span aria-hidden="true">·</span>
          <span>Community Retention & Reviews</span>
          <span aria-hidden="true">·</span>
          <span className="text-cyan-400 font-semibold">Trained on Top 1% Communities</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <HeartHandshake className="w-6 h-6 text-cyan-400" />
          Whop Community Retention & Review Engine
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl">
          Automate customer onboarding, harvest 5-star reviews on Whop, send high-converting welcome DMs, and convert one-time buyers into $29/mo recurring subscribers.
        </p>
      </div>

      {/* Product Selector Bar */}
      {productAssets.length > 0 && (
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-300">Active Product:</span>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
            >
              {productAssets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (${p.content?.suggestedPrice || 39})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
            <span>Niche: <strong className="text-white">{niche}</strong></span>
            <span>·</span>
            <span>Price: <strong className="text-emerald-400">${price}</strong></span>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto text-xs">
        {[
          { id: 'discord', label: 'Discord Welcome Embed', icon: MessageSquare },
          { id: 'dm_welcome', label: 'Post-Checkout DM Onboarding', icon: Users },
          { id: 'review_booster', label: '5-Star Review Booster', icon: Star },
          { id: 'upsell', label: '$29/mo VIP Recurring Upsell', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Discord Welcome Embed */}
      {activeTab === 'discord' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/70 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  Discord Welcome Announcement Copy
                </span>
                <button
                  onClick={() => handleCopy(discordAnnouncement, 'discord')}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
                >
                  {copiedKey === 'discord' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Announcement!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Discord Markdown</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                readOnly
                rows={12}
                value={discordAnnouncement}
                className="w-full bg-black/70 border border-neutral-800 rounded-xl p-4 text-xs font-mono text-neutral-200 leading-relaxed resize-none focus:outline-none"
              />

              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-[11px] text-neutral-300 leading-relaxed">
                <strong className="text-cyan-400">Whop Setup Tip:</strong> In your Whop Dashboard under <em>Experiences → Discord</em>, set up a webhook that automatically posts this announcement to your #welcome channel whenever a member's checkout completes!
              </div>
            </div>
          </div>

          {/* Discord Visual Preview Mockup */}
          <div className="lg:col-span-6 space-y-3">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">
              Live Discord Mockup Preview
            </span>
            <div className="p-5 rounded-2xl bg-[#313338] border border-[#232428] text-white shadow-xl space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-md">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">AutoCash AI Bot</span>
                    <span className="bg-[#5865F2] text-[10px] font-bold px-1.5 py-0.5 rounded text-white uppercase">
                      BOT
                    </span>
                    <span className="text-[11px] text-[#949BA4]">Today at 5:42 PM</span>
                  </div>
                  <div className="text-xs text-[#DBDEE1] mt-1 whitespace-pre-line leading-relaxed font-sans">
                    {discordAnnouncement}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: DM Onboarding */}
      {activeTab === 'dm_welcome' && (
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/70 space-y-4 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                Post-Purchase Direct Message Sequence
              </span>
              <span className="text-[11px] text-neutral-400">
                Send 5 minutes after purchase to eliminate refunds and drive instant adoption
              </span>
            </div>
            <button
              onClick={() => handleCopy(onboardingDm, 'dm')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
            >
              {copiedKey === 'dm' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied DM!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Onboarding DM</span>
                </>
              )}
            </button>
          </div>

          <textarea
            readOnly
            rows={12}
            value={onboardingDm}
            className="w-full bg-black/70 border border-neutral-800 rounded-xl p-4 text-xs font-mono text-neutral-200 leading-relaxed resize-none focus:outline-none"
          />
        </div>
      )}

      {/* Tab 3: Review Booster */}
      {activeTab === 'review_booster' && (
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/70 space-y-4 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block">
                ⭐ 48-Hour 5-Star Testimonial Extraction Trigger
              </span>
              <span className="text-[11px] text-neutral-400">
                Incentivizes buyer reviews with a free bonus swipe file
              </span>
            </div>
            <button
              onClick={() => handleCopy(reviewBooster, 'review')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
            >
              {copiedKey === 'review' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied Review Script!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Review Script</span>
                </>
              )}
            </button>
          </div>

          <textarea
            readOnly
            rows={14}
            value={reviewBooster}
            className="w-full bg-black/70 border border-neutral-800 rounded-xl p-4 text-xs font-mono text-neutral-200 leading-relaxed resize-none focus:outline-none"
          />
        </div>
      )}

      {/* Tab 4: VIP Recurring Upsell */}
      {activeTab === 'upsell' && (
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/70 space-y-4 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                💰 $29/mo VIP Community Recurring Conversion Pitch
              </span>
              <span className="text-[11px] text-neutral-400">
                Converts one-time $39 playbook buyers into long-term monthly subscribers
              </span>
            </div>
            <button
              onClick={() => handleCopy(upsellPitch, 'upsell')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              {copiedKey === 'upsell' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied VIP Pitch!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy VIP Upsell Pitch</span>
                </>
              )}
            </button>
          </div>

          <textarea
            readOnly
            rows={16}
            value={upsellPitch}
            className="w-full bg-black/70 border border-neutral-800 rounded-xl p-4 text-xs font-mono text-neutral-200 leading-relaxed resize-none focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};
