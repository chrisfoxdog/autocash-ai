// Shared "how to use" content for the guided walkthrough and the Help page.
// Copy rules: describe time saved and workflows only — no income promises,
// no earnings claims, no invented stats or testimonials.

export interface GuideStep {
  id: string;
  title: string;
  intro: string;
  bullets: string[];
  action?: { label: string; tab: string };
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to AutoCash AI',
    intro:
      'AutoCash AI is a set of AI drafting tools for creators selling on Whop. It helps you draft digital products, short-form video scripts, affiliate bridge pages, and marketing media, so you spend less time staring at a blank page and more time on the parts of the work only you can do.',
    bullets: [
      'Every result is a draft: you review, edit, and decide what gets published.',
      'Nothing is posted or sold automatically — you stay in control of your store.',
      'AutoCash AI is a workflow tool. It does not promise sales or income; results depend on your offer, your audience, and the work you put in.',
    ],
  },
  {
    id: 'credits',
    title: 'How credits work',
    intro:
      'Every AI generation costs 1 credit, no matter which tool you use. Your plan sets how many credits you get each period, and your balance is always visible in the top bar and on your dashboard.',
    bullets: [
      'Free Trial: 5 credits to try the tools.',
      'Starter: 50 credits per month.',
      'Pro: 100 credits per month.',
      'Lifetime Founders: 500 credits per period.',
      'When your credits run out, generation pauses until your next reset date or until you upgrade.',
      'If a generation fails on our side, the credit is refunded automatically.',
    ],
  },
  {
    id: 'generate',
    title: 'Generate content, step by step',
    intro: 'Creating something takes under a minute:',
    bullets: [
      '1. Pick a tool — Product Studio for a digital product, Viral Traffic for short-form scripts, or the Video & Image Studio for marketing media.',
      '2. Describe your niche and topic. Specific beats generic: "meal-prep for busy nurses" drafts better than "fitness".',
      '3. Click generate. That costs 1 credit, and the draft appears on screen.',
      '4. Read it like an editor. Cut anything that does not sound like you, fix the details, then export or keep it for later.',
    ],
    action: { label: 'Open Product Studio', tab: 'products' },
  },
  {
    id: 'library',
    title: 'Where your work lives',
    intro:
      'Everything you generate is saved automatically to your account — nothing is lost when you close the tab.',
    bullets: [
      'Vault: every asset you have generated, in one place.',
      'Turnkey Catalog: ready-made templates you can start from instead of a blank prompt.',
      'Dashboard → Recent Generations: your latest work, one click from reopening it.',
      'Digital products open in a reader you can export as a customer deliverable, or turn into a Whop listing kit with sales copy and an FAQ.',
    ],
    action: { label: 'Open the Vault', tab: 'vault' },
  },
  {
    id: 'next',
    title: 'Get more from the app',
    intro: 'Once your first draft exists, these are the natural next steps:',
    bullets: [
      'Conversion Radar: paste in your Whop offer and get copy feedback before you promote it.',
      'Launch War Room: generate a coordinated bundle — product, scripts, and bridge page — in one session.',
      '72-Hour Blueprint: a plain checklist for taking an offer from draft to listed on Whop.',
      'You can replay this tour anytime from the How to Use page in the top navigation.',
    ],
    action: { label: 'Go to the Dashboard', tab: 'dashboard' },
  },
];
