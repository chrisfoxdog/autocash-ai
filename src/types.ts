export type AIPersonaId =
  | 'aggressive_salesman'
  | 'empathetic_creator'
  | 'technical_expert'
  | 'contrarian_disruptor'
  | 'executive_strategist';

export interface AIPersonaConfig {
  id: AIPersonaId;
  name: string;
  tagline: string;
  badge: string;
  tone: string;
  sampleQuote: string;
  systemDirective: string;
}

export const AI_PERSONAS: Record<AIPersonaId, AIPersonaConfig> = {
  aggressive_salesman: {
    id: 'aggressive_salesman',
    name: 'Aggressive Closer',
    tagline: 'High-Urgency Direct Response',
    badge: '🔥 Max Urgency',
    tone: 'Unapologetic, high-stakes FOMO, punchy short sentences, and direct challenges to inaction',
    sampleQuote: '"Stop making excuses while your competitors steal your customers. Secure this exact system today before the doors close."',
    systemDirective: 'Write in an aggressive, high-converting direct-response sales voice. Use intense urgency, bold scarcity, call out the brutal cost of procrastination, eliminate buyer excuses, and demand immediate checkout with sharp, commanding calls to action.',
  },
  empathetic_creator: {
    id: 'empathetic_creator',
    name: 'Empathetic Creator',
    tagline: 'Authentic & Relatable Storytelling',
    badge: '🤝 Story & Trust',
    tone: 'Warm, vulnerable, authentic, encouraging, relatable struggles, and supportive mentor guidance',
    sampleQuote: '"I remember staring at zero sales for months feeling overwhelmed. You are not alone, and you do not need 100k followers to make this work."',
    systemDirective: 'Write with deep empathy, vulnerability, and supportive warmth. Share relatable struggles, validate the audience\'s exhaustion with complex hype, avoid aggressive shouting, and guide the customer like a trusted mentor who has been in their exact shoes.',
  },
  technical_expert: {
    id: 'technical_expert',
    name: 'Technical Expert',
    tagline: 'Analytical & Framework-Driven',
    badge: '🔬 High Authority',
    tone: 'Precise, authoritative, algorithmic, structural, data-backed, step-by-step schematics',
    sampleQuote: '"By deploying this 3-tier modular automation pipeline, we eliminate 85% of manual friction and stabilize deterministic recurring cashflow."',
    systemDirective: 'Write with authoritative engineering precision, analytical rigor, and structured operational taxonomies. Emphasize systems, reproducibility, concrete mechanics, and data-backed workflows without fluff.',
  },
  contrarian_disruptor: {
    id: 'contrarian_disruptor',
    name: 'Contrarian Disruptor',
    tagline: 'Myth-Busting & Anti-Guru',
    badge: '⚡ Polarizing',
    tone: 'Provocative, anti-establishment, cutting through industry BS, counterintuitive breakthroughs',
    sampleQuote: '"95% of generic course gurus have never run a real business. Here is why the standard playbook is broken and what actually works."',
    systemDirective: 'Write with a provocative, myth-busting contrarian perspective. Challenge conventional industry dogma, expose fake gurus or outdated playbooks, and position this solution as the counterintuitive truth that the mainstream misses.',
  },
  executive_strategist: {
    id: 'executive_strategist',
    name: 'Executive Strategist',
    tagline: 'High-Ticket & ROI-Focused',
    badge: '💼 Boardroom ROI',
    tone: 'Sophisticated, concise, executive-level, capital efficiency, operational leverage',
    sampleQuote: '"Treat your digital assets as high-margin capital infrastructure. Compress acquisition costs, maximize LTV, and scale institutional retention."',
    systemDirective: 'Write in a polished, executive, high-ticket business consulting voice. Focus on ROI, capital efficiency, asymmetric leverage, enterprise scale, and frictionless execution for serious operators.',
  },
};

export interface CreatorSettings {
  storeName: string;
  creatorName: string;
  whopStoreUrl: string;
  supportEmail: string;
  currency: string;
  whopProCheckoutUrl: string;
  whopEmpireCheckoutUrl: string;
}

export interface UserAccount {
  id: string;
  email: string;
  plan: 'free' | 'pro' | 'empire';
  credits: number;
  creditsResetAt: string;
  whopUserId?: string;
  whopMembershipId?: string;
  whopPlanId?: string;
  status: 'active' | 'cancelled' | 'past_due';
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedAsset {
  id: string;
  userId: string;
  type: 'digital_product' | 'viral_script' | 'affiliate_bridge' | 'whop_listing' | 'marketing_video' | 'marketing_image';
  title: string;
  niche: string;
  content: any;
  createdAt: string;
}

export interface MarketingVideoScene {
  id: string;
  sceneNumber: number;
  durationSeconds: number;
  heading: string;
  subtext: string;
  visualPrompt: string;
  motionStyle: 'kinetic_zoom' | 'pan_reveal' | 'glitch_strike' | 'cyber_pulse' | 'smooth_fade';
  badgeOverlay?: string;
  bgGradient: [string, string];
  imageUrl?: string;
}

export interface MarketingVideoProject {
  id?: string;
  title: string;
  niche: string;
  platform: '9:16' | '16:9';
  aspectRatio: '9:16' | '16:9';
  scenes: MarketingVideoScene[];
  audioTrack: 'cyberpunk_synth' | 'high_energy_trap' | 'lofi_chill' | 'cinematic_epic' | 'ambient_pulse';
  callToAction: string;
  whopDiscountCode?: string;
  voiceoverScript: string;
  totalDurationSeconds: number;
  aiPersonaUsed?: AIPersonaId;
}

export interface MarketingImageResult {
  imageUrl: string;
  prompt: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3';
  style: string;
  purpose: 'whop_banner' | 'product_mockup' | 'social_ad' | 'community_badge' | 'custom';
  title?: string;
  createdAt: string;
}

export interface WebhookLog {
  id: string;
  eventId: string;
  eventType: string;
  timestamp: string;
  status: 'processed' | 'rejected' | 'duplicate';
  details: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  whopPaymentId?: string;
  amount: number;
  currency: string;
  plan: string;
  status: string;
  createdAt: string;
}

export interface AffiliateProgram {
  id: string;
  name: string;
  category: string;
  commission: string;
  cookieDuration: string;
  payoutModel: string;
  avgMonthlyPerUser: string;
  officialSignupUrl: string;
  bestAngle: string;
  targetAudience: string;
  description: string;
}

export interface WhopListingKit {
  assetId: string;
  title: string;
  suggestedPrice: number;
  category: string;
  formattedHtmlDescription: string;
  headline: string;
  bullets: string[];
  guarantee: string;
  faq: { question: string; answer: string }[];
  instructions: string[];
}

export interface WhopConfig {
  webhookUrl: string;
  whopApiKeySet: boolean;
  whopWebhookSecretSet: boolean;
  geminiApiKeySet: boolean;
  settings?: CreatorSettings;
  checkoutLinks: {
    proMonthly: string;
    empireMonthly: string;
  };
  tierFeatures: {
    [key: string]: {
      name: string;
      price: number;
      credits: number;
      features: string[];
    };
  };
}

export interface WhopOfferAnalysisResult {
  overallScore: number;
  conversionGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  verdictSummary: string;
  strengths: string[];
  frictionPoints: string[];
  priceOptimization: {
    currentPrice: number;
    recommendedPrice: number;
    reasoning: string;
    estimatedLift: string;
  };
  rewrittenHooks: {
    angle: string;
    headline: string;
    subhook: string;
    whopStoreCopy: string;
    ctaButton: string;
  }[];
  quickWinChecklist: string[];
}
