import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export type AIPersonaId =
  | 'aggressive_salesman'
  | 'empathetic_creator'
  | 'technical_expert'
  | 'contrarian_disruptor'
  | 'executive_strategist';

export const PERSONA_DIRECTIVES: Record<AIPersonaId, { name: string; directive: string }> = {
  aggressive_salesman: {
    name: 'Aggressive Closer / Salesman',
    directive:
      'Write in an aggressive, high-converting direct-response sales voice. Use intense urgency, bold scarcity, call out the brutal cost of procrastination, eliminate buyer excuses, and demand immediate checkout with sharp, commanding calls to action.',
  },
  empathetic_creator: {
    name: 'Empathetic Creator',
    directive:
      'Write with deep empathy, vulnerability, and supportive warmth. Share relatable struggles, validate the audience\'s exhaustion with complex hype, avoid aggressive shouting, and guide the customer like a trusted mentor who has been in their exact shoes.',
  },
  technical_expert: {
    name: 'Technical Expert',
    directive:
      'Write with authoritative engineering precision, analytical rigor, and structured operational taxonomies. Emphasize systems, reproducibility, concrete mechanics, and data-backed workflows without fluff.',
  },
  contrarian_disruptor: {
    name: 'Contrarian Disruptor',
    directive:
      'Write with a provocative, myth-busting contrarian perspective. Challenge conventional industry dogma, expose fake gurus or outdated playbooks, and position this solution as the counterintuitive truth that the mainstream misses.',
  },
  executive_strategist: {
    name: 'Executive Strategist',
    directive:
      'Write in a polished, executive, high-ticket business consulting voice. Focus on ROI, capital efficiency, asymmetric leverage, enterprise scale, and frictionless execution for serious operators.',
  },
};

export interface GenerateDigitalProductParams {
  niche: string;
  topic: string;
  targetAudience: string;
  format: 'playbook' | 'checklist_bundle' | 'prompt_vault' | '7day_challenge';
  pricePoint: number;
  aiPersona?: AIPersonaId;
}

export interface GenerateViralScriptParams {
  niche: string;
  productName: string;
  hookStyle: 'curiosity' | 'contrarian' | 'urgency_fomo' | 'zero_to_hero';
  platform: 'reels_tiktok' | 'x_thread' | 'whop_post';
  callToAction: string;
  aiPersona?: AIPersonaId;
}

export interface GenerateAffiliateBridgeParams {
  niche: string;
  productOrCategory: string;
  commissionType: string;
  targetPainPoint: string;
  aiPersona?: AIPersonaId;
}

/**
 * Generate complete ready-to-sell Digital Product with structured modules and Whop listing copy
 */
export async function generateDigitalProduct(params: GenerateDigitalProductParams) {
  const personaId = params.aiPersona || 'aggressive_salesman';
  const persona = PERSONA_DIRECTIVES[personaId] || PERSONA_DIRECTIVES.aggressive_salesman;

  const prompt = `You are a world-class digital product strategist, copywriter, and Whop monetization expert.

AI WRITING PERSONA: ${persona.name}
WRITING STYLE DIRECTIVE: ${persona.directive}
CRITICAL INSTRUCTION: Adhere strictly to this persona's voice, tone, vocabulary, emotional cadence, and psychological framing across the title, subtitle, Whop sales copy, guarantee, and detailed module prose.

Create a complete, comprehensive, premium digital product ready to sell immediately on Whop for $${params.pricePoint}.
Domain/Niche: ${params.niche}
Product Topic: ${params.topic}
Format: ${params.format}
Target Audience: ${params.targetAudience}

The response MUST be valid JSON adhering to this structure:
{
  "title": "A punchy, high-converting product title reflecting the chosen persona",
  "subtitle": "Clear value proposition subtitle",
  "suggestedPrice": ${params.pricePoint},
  "estimatedTimeToComplete": "e.g. 45 minutes",
  "summary": "2-3 sentences overview of the transformation provided in the persona's voice",
  "aiPersonaUsed": "${personaId}",
  "whopSalesCopy": {
    "headline": "High-converting hook for Whop Store listing matching the persona style",
    "bullets": ["3-5 concrete high-impact benefit bullets written in the persona style"],
    "guarantee": "Action-oriented guarantee statement matching the persona style",
    "faq": [
      {"question": "Q1", "answer": "A1 in persona style"},
      {"question": "Q2", "answer": "A2 in persona style"}
    ]
  },
  "modules": [
    {
      "moduleNumber": 1,
      "title": "Module title",
      "summary": "Module summary",
      "actionSteps": ["Step 1", "Step 2", "Step 3"],
      "fullContent": "In-depth, actionable instruction prose containing real tactics, tools, templates, and execution details written in the selected persona voice (at least 200 words)",
      "copyPasteResource": "An actual ready-to-use template, prompt, or checklist text snippet"
    },
    {
      "moduleNumber": 2,
      "title": "Module title",
      "summary": "Module summary",
      "actionSteps": ["Step 1", "Step 2", "Step 3"],
      "fullContent": "In-depth, actionable instruction prose containing real tactics, tools, templates, and execution details",
      "copyPasteResource": "An actual ready-to-use template, prompt, or checklist text snippet"
    },
    {
      "moduleNumber": 3,
      "title": "Module title",
      "summary": "Module summary",
      "actionSteps": ["Step 1", "Step 2", "Step 3"],
      "fullContent": "In-depth, actionable instruction prose containing real tactics, tools, templates, and execution details",
      "copyPasteResource": "An actual ready-to-use template, prompt, or checklist text snippet"
    }
  ]
};`;

  if (!process.env.GEMINI_API_KEY) {
    return generateFallbackDigitalProduct(params);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini');
    }
    return JSON.parse(text);
  } catch (err: any) {
    console.error('Gemini generation error, using curated template:', err);
    return generateFallbackDigitalProduct(params);
  }
}

/**
 * Generate Viral Content Scripts for social channels driving direct traffic to Whop
 */
export async function generateViralScript(params: GenerateViralScriptParams) {
  const personaId = params.aiPersona || 'aggressive_salesman';
  const persona = PERSONA_DIRECTIVES[personaId] || PERSONA_DIRECTIVES.aggressive_salesman;

  const prompt = `You are a viral social media growth hacker and direct-response copywriter.

AI WRITING PERSONA: ${persona.name}
WRITING STYLE DIRECTIVE: ${persona.directive}
CRITICAL INSTRUCTION: Infuse the spoken hook, video script pacing, body language, and call to action with this persona's voice!

Generate high-converting organic viral content that drives users to buy "${params.productName}" on Whop.
Platform: ${params.platform}
Niche: ${params.niche}
Hook Style: ${params.hookStyle}
Call to Action: ${params.callToAction}

The output must be JSON with the following structure:
{
  "hook": "The first 3 seconds visual/verbal hook designed to stop the scroll in this persona voice",
  "hookVariations": ["Alternative hook 1", "Alternative hook 2"],
  "visualDirection": "Detailed camera angles, text on screen, and body language instructions",
  "mainScript": "Full spoken word script with timing cues (0:00-0:15, 0:15-0:40, etc.) or full X thread tweet by tweet written in the persona voice",
  "callToActionScript": "Exact verbal and on-screen CTA directing viewers to the Whop link in bio",
  "pinnedComment": "Copy-paste comment to pin with discount code or direct checkout link",
  "recommendedAudioStyle": "Trending background sound recommendation",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "aiPersonaUsed": "${personaId}"
}`;

  if (!process.env.GEMINI_API_KEY) {
    return generateFallbackViralScript(params);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from model');
    return JSON.parse(text);
  } catch (err: any) {
    console.error('Gemini viral script generation error:', err);
    return generateFallbackViralScript(params);
  }
}

/**
 * Generate High-Yield Affiliate Bridge Page & Review Matrix
 */
export async function generateAffiliateBridge(params: GenerateAffiliateBridgeParams) {
  const personaId = params.aiPersona || 'aggressive_salesman';
  const persona = PERSONA_DIRECTIVES[personaId] || PERSONA_DIRECTIVES.aggressive_salesman;

  const prompt = `You are a passive income affiliate marketing architect and conversion copywriter.

AI WRITING PERSONA: ${persona.name}
WRITING STYLE DIRECTIVE: ${persona.directive}
CRITICAL INSTRUCTION: Write the review headline, executive summary, pros/cons, and email bridge template strictly adhering to this persona's voice!

Generate a high-converting affiliate comparison and bridge page copy for recurring SaaS/digital tools in the "${params.niche}" niche.
Product/Category: ${params.productOrCategory}
Commission Model: ${params.commissionType}
Target Problem/Pain Point: ${params.targetPainPoint}

Output JSON format:
{
  "pageTitle": "High-intent search review title matching persona voice",
  "slug": "url-friendly-slug",
  "targetNiche": "${params.niche}",
  "verdictRating": "9.8 / 10",
  "keyBenefitHeadline": "Clear benefit headline in persona style",
  "executiveSummary": "Concise 3-sentence honest review in persona voice",
  "pros": ["Pro 1", "Pro 2", "Pro 3"],
  "cons": ["Minor con 1", "Minor con 2"],
  "commissionEstimate": "e.g. $47/month per active referral (30% recurring)",
  "recommendedAffiliatePrograms": [
    {
      "programName": "Program 1",
      "payout": "30% Lifetime Recurring",
      "cookieDuration": "60 days",
      "pitchAngle": "Best for complete beginners"
    },
    {
      "programName": "Program 2",
      "payout": "40% First Month + 20% Recurring",
      "cookieDuration": "90 days",
      "pitchAngle": "Best for agency scale"
    }
  ],
  "emailBridgeTemplate": {
    "subjectLine": "Curiosity subject line in persona voice",
    "body": "Full conversational bridge email driving clicks to the affiliate link or Whop bonus bundle written in persona voice"
  },
  "whopBonusBundleIdea": "A free bonus digital asset the creator can offer to customers who buy through their affiliate link to double conversion rates",
  "aiPersonaUsed": "${personaId}"
}`;

  if (!process.env.GEMINI_API_KEY) {
    return generateFallbackAffiliateBridge(params);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error('Empty response');
    return JSON.parse(text);
  } catch (err: any) {
    console.error('Gemini affiliate bridge error:', err);
    return generateFallbackAffiliateBridge(params);
  }
}

// Resilient, high-converting fallbacks if API key is not configured or network fails
function generateFallbackDigitalProduct(params: GenerateDigitalProductParams) {
  const persona = params.aiPersona || 'aggressive_salesman';

  let title = `The 2026 ${params.niche} Autopilot Cashflow Playbook`;
  let headline = `Finally: The Exact Blueprint To Monetize ${params.niche} On Autopilot`;
  let guarantee = '14-Day 100% money-back guarantee. If you follow the checklist and do not get value, we refund you immediately.';

  if (persona === 'aggressive_salesman') {
    title = `THE BRUTAL TRUTH: ${params.niche} Cashflow Domination Vault`;
    headline = `Stop Making Excuses: The No-BS System To Take Over ${params.niche} Before Doors Close`;
    guarantee = 'Take immediate action: follow this protocol for 14 days. If your revenue does not jump, get every cent back instantly.';
  } else if (persona === 'empathetic_creator') {
    title = `The Honest Creator Guide: Real, Sustainable Cashflow in ${params.niche}`;
    headline = `Tired of Empty Hype? Here Is The Authentic, Step-by-Step Way To Earn In ${params.niche}`;
    guarantee = 'Built from genuine struggle to help you breathe easier. Zero risk, full support, and a complete 30-day gentle refund policy.';
  } else if (persona === 'technical_expert') {
    title = `The Algorithmic ${params.niche} Systems & Architecture Protocol`;
    headline = `Deterministic Yield Specification: Engineering High-Margin Predictable MRR in ${params.niche}`;
    guarantee = 'Systematic Guarantee: Deploy the modular execution steps. Guaranteed operational repeatability or complete refund.';
  } else if (persona === 'contrarian_disruptor') {
    title = `Why 99% Of People Fail At ${params.niche} (And The Anti-Guru Fix)`;
    headline = `Exposing The Fake Industry Playbook: What Actually Drives Cashflow In ${params.niche}`;
    guarantee = 'Zero-Bullshit Guarantee: No fluff, no useless theory, just pure unfiltered tactical leverage.';
  } else if (persona === 'executive_strategist') {
    title = `The Institutional ${params.niche} Digital Asset Matrix`;
    headline = `Capital-Efficient Digital Assets: Maximizing LTV and Compressing CAC in ${params.niche}`;
    guarantee = 'Enterprise ROI Guarantee: Designed for serious operators seeking asymmetric digital cashflow.';
  }

  return {
    title,
    subtitle: `Step-by-step systems to build a reliable monthly revenue stream in ${params.topic}`,
    suggestedPrice: params.pricePoint || 47,
    estimatedTimeToComplete: '60 minutes',
    summary: `A complete tactical blueprint designed for ${params.targetAudience} to achieve measurable results in ${params.topic} without upfront advertising budget.`,
    aiPersonaUsed: persona,
    whopSalesCopy: {
      headline,
      bullets: [
        `Complete turnkey workflows tested with real paying customers`,
        `Includes copy-paste prompt templates, Notion tracking sheets, and launch checklist`,
        `Pre-configured Whop checkout structure with 1-click delivery`,
        `Direct action roadmap designed for fast execution`,
      ],
      guarantee,
      faq: [
        {
          question: 'Do I need any technical skills?',
          answer: 'None at all. Every workflow is built with simple copy-paste systems and free tools.',
        },
        {
          question: 'How quickly can I launch this on Whop?',
          answer: 'You can package this guide and list it on your Whop store in under 30 minutes.',
        },
      ],
    },
    modules: [
      {
        moduleNumber: 1,
        title: 'Phase 1: Zero-Budget Market Validation & Product Setup',
        summary: 'How to position and set up your Whop store without spending a dime.',
        actionSteps: [
          'Claim your free Whop creator URL',
          'Create a single-time digital download product priced at $' + params.pricePoint,
          'Set up the automated delivery link',
        ],
        fullContent:
          'The biggest mistake broke creators make is spending money before validating demand. On Whop, your primary advantage is zero friction. Set up your product container first. Ensure your product title highlights the end result, not the process. People do not buy books; they buy faster money, saved hours, and reduced stress.',
        copyPasteResource:
          'WHOP STORE LISTING TEMPLATE:\nHeadline: Master ' +
          params.topic +
          ' in 7 Days (Zero Ad Spend)\nPrice: $' +
          params.pricePoint +
          '\nDelivery: Instant PDF & Resource Vault',
      },
      {
        moduleNumber: 2,
        title: 'Phase 2: Organic Viral Traffic Engine (0 to 1,000 Views Daily)',
        summary: 'Turn free short-form video and posts into paying customer checkouts.',
        actionSteps: [
          'Record 3 hook-based videos using the viral script generator',
          'Place your Whop store link in your bio',
          'Pin the primary breakdown video with a discount incentive',
        ],
        fullContent:
          'Organic traffic in 2026 relies on specific problem-solving hooks. Instead of generic advice, show the specific screen, the specific dollar figure, or the exact workflow. In the first 3 seconds, call out the target pain point: "If you have $0 in your bank account right now, do not start dropshipping or crypto. Do this instead."',
        copyPasteResource:
          'TIKTOK/REELS HOOK FORMULA:\n"Stop doing [Common Hard Method]. Here is the 3-step automation I used to generate my first $1,000 with zero inventory: [Step 1]... [Step 2]... [Step 3]. Link in bio for the full template."',
      },
      {
        moduleNumber: 3,
        title: 'Phase 3: Building The Recurring Subscription Flywheel',
        summary: 'Converting one-time buyers into monthly recurring Whop community members.',
        actionSteps: [
          'Add a $19/mo VIP Community tier to your Whop product',
          'Offer the first 30 days free or at a 50% discount for buyers of the playbook',
          'Host a weekly 30-minute Q&A or drop weekly updated resources',
        ],
        fullContent:
          'One-time sales provide quick cash, but recurring memberships provide peace of mind and true freedom. By packaging ongoing weekly updates, a Discord/Whop chat room, and monthly Q&As, you can convert 20% to 30% of your digital product buyers into subscribers.',
        copyPasteResource:
          'POST-PURCHASE EMAIL TRIGGER:\n"Hey [Name], thanks for grabbing the Playbook! As a fast-action bonus, you have an invite to our private Whop mastermind free for 14 days. Claim your invite here: [Whop Community Link]"',
      },
    ],
  };
}

function generateFallbackViralScript(params: GenerateViralScriptParams) {
  const persona = params.aiPersona || 'aggressive_salesman';

  let hook = `I was completely broke with $0 in my account. Here is the exact system that changed everything.`;
  let hookVariations = [
    `Most people will scroll past this, but this 1 workflow made me $2,400 last month.`,
    `Stop doing side hustles that take 6 months. Here is what works in 48 hours.`,
  ];
  let callToAction = `Head to the link in my bio, grab the full ${params.productName} blueprint, and set yours up before this weekend.`;

  if (persona === 'aggressive_salesman') {
    hook = `You are actively losing $150 every single day you do not launch this on Whop. Watch this now.`;
    hookVariations = [
      `Stop whining about your 9-to-5 if you refuse to spend 20 minutes copying this system.`,
      `Here is why your competitors are making $5k/month while you are still researching.`,
    ];
    callToAction = `Tap the Whop link in my bio right now. The introductory launch price disappears at midnight.`;
  } else if (persona === 'empathetic_creator') {
    hook = `If you have been feeling exhausted trying to make your first dollar online, take a breath. Watch this.`;
    hookVariations = [
      `I failed for 8 months straight before discovering this simple Whop method.`,
      `You don't need 100k followers or complicated tech to build something you love.`,
    ];
    callToAction = `I packaged the exact template in my bio so you don't have to struggle alone. Take care!`;
  } else if (persona === 'technical_expert') {
    hook = `Here is the exact 3-node automation architecture that generates $3,200/mo on Whop with zero code.`;
    hookVariations = [
      `Analyzing why 84% of digital product checkouts fail—and the algorithmic fix.`,
      `System breakdown: How to configure webhook triggers for instant deliverable access.`,
    ];
    callToAction = `The comprehensive system specification is mapped out at the Whop link in bio.`;
  } else if (persona === 'contrarian_disruptor') {
    hook = `Every single guru telling you to start dropshipping or Amazon FBA in 2026 is lying to your face.`;
    hookVariations = [
      `The dirty secret behind $10,000 course creators exposed in 45 seconds.`,
      `Why building an audience first is the worst mistake a new creator can make.`,
    ];
    callToAction = `Get the unfiltered anti-guru blueprint in my bio before it gets taken down.`;
  } else if (persona === 'executive_strategist') {
    hook = `Let's discuss capital efficiency: How to generate 94% gross margin digital cashflow via Whop.`;
    hookVariations = [
      `Compressing customer acquisition cost: A tactical playbook for high-ticket digital assets.`,
      `Why institutional creators are migrating from legacy courses to recurring Whop ecosystems.`,
    ];
    callToAction = `Access the complete executive asset matrix through the link in bio.`;
  }

  return {
    hook,
    hookVariations,
    visualDirection: `Film handheld in natural room light. Open your laptop screen showing the dashboard, then flip to front camera with high eye contact. Text on screen appears within 0.5s.`,
    mainScript: `(0:00 - 0:04) "${hook}"\n(0:05 - 0:15) "Most people tell you to learn coding or start a physical ecommerce store. That takes thousands of dollars and months of work. Instead, I packaged a simple high-value resource guide in ${params.niche}."\n(0:16 - 0:32) "I used free AI to structure the entire playbook, listed it on Whop in 20 minutes, and used this exact video script formula to get 14 sales in my first 4 days."\n(0:33 - 0:45) "You don't need inventory, you don't need a team, and you don't need ads."`,
    callToActionScript: callToAction,
    pinnedComment: `Grab the exact step-by-step blueprint here with 20% off using code 'AUTOPILOT': link in bio! 👇`,
    recommendedAudioStyle: `Low-tempo ambient synth or Lo-Fi deep focus beat at 15% volume.`,
    hashtags: [`#sidehustle`, `#makemoneyonline`, `#passiveincome`, `#whopcreator`, `#entrepreneurship`],
    aiPersonaUsed: persona,
  };
}

function generateFallbackAffiliateBridge(params: GenerateAffiliateBridgeParams) {
  const persona = params.aiPersona || 'aggressive_salesman';

  return {
    pageTitle: `Honest Review: The Top Recurring Software Tools in ${params.niche} for 2026`,
    slug: `top-recurring-tools-${params.niche.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    targetNiche: params.niche,
    verdictRating: '9.7 / 10',
    keyBenefitHeadline: `How To Earn 30% to 50% Lifetime Monthly Passive Income Promoting Software People Already Need`,
    executiveSummary: `Affiliate marketing with high-churn $10 products is dead. The true autopilot income model is recurring SaaS subscriptions: refer a customer once, and receive $30 to $120 every single month for years.`,
    pros: [
      'Lifetime recurring commissions paid directly to Stripe/PayPal monthly',
      'High conversion rate because business owners need these tools daily',
      'Can be bundled with your Whop membership for 2x retention',
    ],
    cons: [
      'Takes 30 days for initial payout clearance',
      'Requires authentic recommendation and honest value',
    ],
    commissionEstimate: '$68/month average payout per active business referral',
    recommendedAffiliatePrograms: [
      {
        programName: 'All-In-One CRM & Automation Platform',
        payout: '40% Recurring Monthly ($39 - $119/mo per user)',
        cookieDuration: '90 Days',
        pitchAngle: 'Replaces 5 expensive separate tools with 1 affordable subscription',
      },
      {
        programName: 'AI Content & Social Auto-Scheduler',
        payout: '30% Lifetime Recurring ($18 - $49/mo per user)',
        cookieDuration: '60 Days',
        pitchAngle: 'Saves creators 10+ hours per week on social media posting',
      },
    ],
    emailBridgeTemplate: {
      subjectLine: `The tool that saved me 15 hours this week (and pays my rent)`,
      body: `Hey friend,\n\nWhen I first started trying to make money online, I wasted weeks doing repetitive tasks manually.\n\nThen I discovered ${params.productOrCategory}. It automated my entire workflow in 1 afternoon.\n\nEven better: their creator affiliate program pays 30% recurring lifetime monthly commissions. I now have 18 active referrals paying for my groceries every single month.\n\nI put together an exclusive bonus tutorial for anyone who tests it out this week. Check out my full review and claim your free bonus on Whop:\n\n[Your Whop Bridge Link Here]\n\nTalk soon,\nYour Name`,
    },
    whopBonusBundleIdea: `A plug-and-play template pack or 15-minute quickstart video that walks the user through setting up the tool in under 10 minutes.`,
    aiPersonaUsed: persona,
  };
}

export interface AnalyzeWhopOfferParams {
  title: string;
  niche: string;
  pricePoint: number;
  targetAudience?: string;
  descriptionOrHook?: string;
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

/**
 * AI-powered Whop Store Offer Optimizer & Conversion Radar
 */
export async function analyzeWhopOffer(params: AnalyzeWhopOfferParams): Promise<WhopOfferAnalysisResult> {
  const prompt = `You are the lead conversion rate optimization (CRO) engineer for top 1% Whop digital stores generating over $50,000/month.
Analyze this creator's Whop digital offer and give them an elite, high-converting audit with actionable rewrites.

Offer Title: ${params.title}
Niche: ${params.niche}
Current Price: $${params.pricePoint} USD
Target Audience: ${params.targetAudience || 'General digital entrepreneurs and learners'}
Current Pitch / Hook: ${params.descriptionOrHook || 'No description provided yet'}

Return ONLY a valid JSON object matching this TypeScript interface:
{
  "overallScore": 88, // integer between 45 and 98 based on real market demand and copy sharpness
  "conversionGrade": "A", // 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D'
  "verdictSummary": "2 punchy sentences assessing the offer's market viability on Whop",
  "strengths": ["3 clear conversion advantages of this offer"],
  "frictionPoints": ["2-3 specific psychological friction points or buyer hesitation triggers"],
  "priceOptimization": {
    "currentPrice": ${params.pricePoint},
    "recommendedPrice": 47, // recommended price point based on perceived value
    "reasoning": "Why this specific price point maximizes both conversion rate and net profit on Whop",
    "estimatedLift": "+38% expected MRR lift"
  },
  "rewrittenHooks": [
    {
      "angle": "Scarcity & Urgent Problem Relief",
      "headline": "High-converting headline with clear transformation",
      "subhook": "Subheadline addressing the primary objection",
      "whopStoreCopy": "3-sentence description ready to copy into Whop product description",
      "ctaButton": "e.g. Get Instant Access Now ($47)"
    },
    {
      "angle": "High-Status No-Brainer Value Stack",
      "headline": "High-converting headline stacking 3x perceived value",
      "subhook": "Subheadline detailing deliverables",
      "whopStoreCopy": "3-sentence description ready to copy into Whop product description",
      "ctaButton": "e.g. Claim The System + Bonuses"
    },
    {
      "angle": "Speed-to-Result & Zero-Risk",
      "headline": "Outcome-focused headline guaranteeing quick result",
      "subhook": "Subheadline eliminating tech or time obstacles",
      "whopStoreCopy": "3-sentence description ready to copy into Whop product description",
      "ctaButton": "e.g. Start Building Cashflow Today"
    }
  ],
  "quickWinChecklist": [
    "5 specific tactical actions to implement in their Whop store before turning traffic on"
  ]
}`;

  if (!process.env.GEMINI_API_KEY) {
    return generateFallbackWhopAnalysis(params);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }
    return JSON.parse(text);
  } catch (err: any) {
    console.error('Gemini offer analysis error, using fallback:', err);
    return generateFallbackWhopAnalysis(params);
  }
}

function generateFallbackWhopAnalysis(params: AnalyzeWhopOfferParams): WhopOfferAnalysisResult {
  const currentPrice = Number(params.pricePoint) || 39;
  const recommendedPrice = currentPrice < 35 ? 39 : currentPrice < 60 ? 47 : currentPrice;

  return {
    overallScore: 84,
    conversionGrade: 'B+',
    verdictSummary: `"${params.title}" has strong baseline appeal in the ${params.niche} category, but currently undersells its immediate execution speed. With tighter transformation framing and an action-checklist bonus, conversion rates can double.`,
    strengths: [
      `High-intent topic with proven buyer willingness-to-pay on Whop`,
      `Impulse price point ($${currentPrice}) that eliminates corporate procurement friction`,
      `Clear relevance to self-directed operators looking for actionable systems`
    ],
    frictionPoints: [
      `Headline does not specify the exact timeframe to first dollar/result (e.g. "within 48 hours")`,
      `Needs a tangible "Artifact" bonus (like ready-to-use templates or swipe files) to make value undeniable`,
      `Missing a risk-reversal guarantee statement on the Whop product checkout page`
    ],
    priceOptimization: {
      currentPrice,
      recommendedPrice,
      reasoning: `Pricing at $${recommendedPrice} signals premium authoritative depth rather than cheap commodity advice, increasing customer perceived value and reducing refund rates.`,
      estimatedLift: '+42% Net Revenue Lift'
    },
    rewrittenHooks: [
      {
        angle: 'Scarcity & Pain Relief',
        headline: `The Zero-Fluff System To Launch Automated ${params.niche} In 48 Hours`,
        subhook: `Skip 6 months of trial-and-error with 3 ready-to-deploy playbooks and master prompts.`,
        whopStoreCopy: `Stop guessing what works. Get the exact step-by-step masterclass, implementation checklists, and copy-paste prompt vault designed to generate real cashflow on Whop without ad spend.`,
        ctaButton: `Unlock The Complete System ($${recommendedPrice})`
      },
      {
        angle: 'High-Status No-Brainer Value Stack',
        headline: `The Ultimate ${params.niche} Operator Kit: Complete Blueprints & Resource Vault`,
        subhook: `Everything you need to package, monetize, and scale digital assets on complete autopilot.`,
        whopStoreCopy: `Built for creators who value their time. Includes comprehensive step-by-step modules, turnkey launch templates, and the exact viral organic traffic distribution framework.`,
        ctaButton: `Claim Access & Start Today ($${recommendedPrice})`
      },
      {
        angle: 'Speed-to-Result & Zero-Tech',
        headline: `How To Turn ${params.title} Into Passive Cashflow Starting This Weekend`,
        subhook: `No coding, no inventory, and no paid ad budget required.`,
        whopStoreCopy: `A battle-tested tactical masterclass giving you the exact blueprint to build recurring digital income on Whop. Includes full downloadable deliverables and commercial licensing rights.`,
        ctaButton: `Get Instant Deliverable Access ($${recommendedPrice})`
      }
    ],
    quickWinChecklist: [
      `Add a bold guarantee line: "Take 14 days to deploy this system — if you don't save 10 hours and build a live product, get a 100% courteous refund."`,
      `Upload the standalone formatted HTML deliverable directly into your Whop product files tab.`,
      `Set up a custom Whop checkout CTA button reading "Instant Download Access" instead of generic "Buy".`,
      `Add an automated Whop community welcome message pointing buyers to Module 1 within 5 minutes.`,
      `Post 2 TikTok/Reels organic hooks using the scripts generated in AutoCash AI with the direct link in bio.`
    ]
  };
}

// ==========================================
// TEXT TO IMAGE CREATOR FOR MARKETING & WHOP
// ==========================================

export interface GenerateMarketingImageParams {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3';
  style?: string;
  purpose?: 'whop_banner' | 'product_mockup' | 'social_ad' | 'community_badge' | 'custom';
  title?: string;
}

export async function generateMarketingImage(params: GenerateMarketingImageParams) {
  const ratio = params.aspectRatio || '1:1';
  const style = params.style || 'Cyberpunk Neon & Dark Glassmorphism';
  const purpose = params.purpose || 'social_ad';

  const enhancedPrompt = `High-end commercial 4K visual for ${purpose}.
Theme/Topic: ${params.prompt}
Visual Art Direction & Style: ${style}
Aesthetic: Polished, professional digital business marketing asset, vibrant lighting accents, volumetric glow, high contrast, clean negative space, premium typography feel, photorealistic details. No watermarks, no blurry artifacts.`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: ratio,
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          return {
            imageUrl: `data:${mime};base64,${part.inlineData.data}`,
            prompt: params.prompt,
            aspectRatio: ratio,
            style,
            purpose,
            title: params.title || params.prompt.slice(0, 40),
            createdAt: new Date().toISOString(),
          };
        }
      }
    } catch (err: any) {
      console.warn('Gemini image generation API error, switching to procedural high-res SVG engine:', err?.message || err);
    }
  }

  // Resilient, high-converting stylized vector asset engine
  return generateFallbackMarketingImage(params);
}

function generateFallbackMarketingImage(params: GenerateMarketingImageParams) {
  const ratio = params.aspectRatio || '1:1';
  const style = params.style || 'Cyberpunk Neon';
  const purpose = params.purpose || 'social_ad';
  const title = (params.title || params.prompt || 'AutoCash AI Pro').toUpperCase().slice(0, 36);
  const subtitle = (params.prompt || 'Monetization Engine & Digital Asset Suite').slice(0, 75);

  let width = 1080;
  let height = 1080;
  if (ratio === '16:9') {
    width = 1920;
    height = 1080;
  } else if (ratio === '9:16') {
    width = 1080;
    height = 1920;
  } else if (ratio === '4:3') {
    width = 1440;
    height = 1080;
  }

  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="40%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="50%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <radialGradient id="glowGlow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="15" stdDeviation="25" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
  <circle cx="${width / 2}" cy="${height * 0.4}" r="${Math.min(width, height) * 0.45}" fill="url(#glowGlow)" />

  <!-- Cyber Grid Pattern -->
  <g opacity="0.12" stroke="#38bdf8" stroke-width="1.5">
    ${Array.from({ length: 12 })
      .map((_, i) => `<line x1="0" y1="${(i * height) / 11}" x2="${width}" y2="${(i * height) / 11}" />`)
      .join('')}
    ${Array.from({ length: 12 })
      .map((_, i) => `<line x1="${(i * width) / 11}" y1="0" x2="${(i * width) / 11}" y2="${height}" />`)
      .join('')}
  </g>

  <!-- Central Card Container -->
  <rect x="${width * 0.1}" y="${height * 0.18}" width="${width * 0.8}" height="${height * 0.64}" rx="32" fill="#0f172a" fill-opacity="0.75" stroke="#1e293b" stroke-width="2" filter="url(#shadow)" />
  <rect x="${width * 0.1}" y="${height * 0.18}" width="${width * 0.8}" height="8" rx="4" fill="url(#accentGrad)" />

  <!-- Badge Tag -->
  <rect x="${width * 0.16}" y="${height * 0.25}" width="${width * 0.32}" height="${height * 0.05}" rx="12" fill="#082f49" stroke="#0284c7" stroke-width="1.5" />
  <text x="${width * 0.32}" y="${height * 0.285}" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="${height * 0.022}" font-weight="800" text-anchor="middle" letter-spacing="2">WHOP VERIFIED ASSET</text>

  <!-- Icon / Visual Emblem -->
  <circle cx="${width / 2}" cy="${height * 0.42}" r="${height * 0.08}" fill="#0369a1" fill-opacity="0.3" stroke="#38bdf8" stroke-width="2" />
  <text x="${width / 2}" y="${height * 0.44}" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="${height * 0.07}" font-weight="900" text-anchor="middle">⚡</text>

  <!-- Title & Subtitle -->
  <text x="${width / 2}" y="${height * 0.58}" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="${height * 0.052}" font-weight="900" text-anchor="middle" letter-spacing="1">${title}</text>
  <text x="${width / 2}" y="${height * 0.64}" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="${height * 0.026}" font-weight="500" text-anchor="middle">${subtitle}</text>

  <!-- Metrics / Features Pill Strip -->
  <g transform="translate(${width * 0.18}, ${height * 0.70})">
    <rect x="0" y="0" width="${width * 0.64}" height="${height * 0.07}" rx="16" fill="#020617" fill-opacity="0.8" stroke="#334155" stroke-width="1.5" />
    <text x="${width * 0.16}" y="${height * 0.043}" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="${height * 0.022}" font-weight="700" text-anchor="middle">★ TOP SELLER</text>
    <text x="${width * 0.32}" y="${height * 0.043}" fill="#10b981" font-family="system-ui, sans-serif" font-size="${height * 0.022}" font-weight="700" text-anchor="middle">✔ INSTANT ACCESS</text>
    <text x="${width * 0.48}" y="${height * 0.043}" fill="#fbbf24" font-family="system-ui, sans-serif" font-size="${height * 0.022}" font-weight="700" text-anchor="middle">⚡ 100% ROYALTY FREE</text>
  </g>
</svg>`.trim();

  const base64Svg = Buffer.from(svgContent).toString('base64');
  return {
    imageUrl: `data:image/svg+xml;base64,${base64Svg}`,
    prompt: params.prompt,
    aspectRatio: ratio,
    style,
    purpose,
    title: params.title || params.prompt.slice(0, 40),
    createdAt: new Date().toISOString(),
  };
}

// ====================================================
// TEXT TO VIDEO STORYBOARD & SCRIPT ARCHITECT
// ====================================================

export interface GenerateVideoStoryboardParams {
  prompt: string;
  niche?: string;
  platform?: '9:16' | '16:9';
  businessGoal?: 'launch_teaser' | 'feature_demo' | 'social_proof' | 'urgency_sale' | 'faceless_hook';
  aiPersona?: AIPersonaId;
  callToAction?: string;
  whopDiscountCode?: string;
}

export async function generateVideoStoryboard(params: GenerateVideoStoryboardParams) {
  const platform = params.platform || '9:16';
  const niche = params.niche || 'Digital Products & SaaS';
  const personaId = params.aiPersona || 'aggressive_salesman';
  const persona = PERSONA_DIRECTIVES[personaId] || PERSONA_DIRECTIVES.aggressive_salesman;
  const goal = params.businessGoal || 'launch_teaser';

  const systemPrompt = `You are an elite short-form video director, motion graphics scriptwriter, and direct-response marketing master.
Target Platform: ${platform === '9:16' ? 'TikTok / Instagram Reels / YouTube Shorts (9:16 vertical)' : 'YouTube / Whop Store Banner Video (16:9 landscape)'}
Domain / Niche: ${niche}
Video Campaign Goal: ${goal}
AI Voice Persona: ${persona.name}
Writing Style Directive: ${persona.directive}

Produce an irresistible, high-retention 4-scene video script designed to stop viewers from scrolling, provoke curiosity, demonstrate massive value, and compel them to buy or sign up on Whop immediately.

Return strictly valid JSON adhering to this structure:
{
  "title": "A captivating, high-CTR video title",
  "niche": "${niche}",
  "platform": "${platform}",
  "aspectRatio": "${platform}",
  "audioTrack": "cyberpunk_synth",
  "callToAction": "${params.callToAction || 'Link in bio on Whop to claim access'}",
  "whopDiscountCode": "${params.whopDiscountCode || 'LAUNCH50'}",
  "voiceoverScript": "Complete spoken-word voiceover script read by narrator from scene 1 to 4",
  "totalDurationSeconds": 15,
  "aiPersonaUsed": "${personaId}",
  "scenes": [
    {
      "id": "scene-1",
      "sceneNumber": 1,
      "durationSeconds": 3,
      "heading": "3-5 word scroll-stopping hook",
      "subtext": "Voiceover line or on-screen caption calling out customer pain point",
      "visualPrompt": "Detailed visual description of scene imagery/motion",
      "motionStyle": "kinetic_zoom",
      "badgeOverlay": "🔥 STOP SCROLLING",
      "bgGradient": ["#0f172a", "#1e1b4b"]
    },
    {
      "id": "scene-2",
      "sceneNumber": 2,
      "durationSeconds": 4,
      "heading": "Agitate the Problem & Reveal Solution",
      "subtext": "Why manual work or outdated methods are burning cash",
      "visualPrompt": "Detailed visual description",
      "motionStyle": "glitch_strike",
      "badgeOverlay": "⚡ THE PROBLEM",
      "bgGradient": ["#1e1b4b", "#312e81"]
    },
    {
      "id": "scene-3",
      "sceneNumber": 3,
      "durationSeconds": 4,
      "heading": "The Automated System Transformation",
      "subtext": "Showing the effortless result, revenue proof, or saved time",
      "visualPrompt": "Detailed visual description",
      "motionStyle": "cyber_pulse",
      "badgeOverlay": "★ $4,200/MO PROOF",
      "bgGradient": ["#022c22", "#064e3b"]
    },
    {
      "id": "scene-4",
      "sceneNumber": 4,
      "durationSeconds": 4,
      "heading": "Urgent Whop Store Call To Action",
      "subtext": "Direct checkout CTA with scarcity and discount code",
      "visualPrompt": "Detailed visual description",
      "motionStyle": "pan_reveal",
      "badgeOverlay": "⏳ LIMITED TO 50 SPOTS",
      "bgGradient": ["#450a0a", "#7f1d1d"]
    }
  ]
}`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${systemPrompt}\n\nClient Project Brief: ${params.prompt}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);
      if (parsed.scenes && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
        return parsed;
      }
    } catch (err: any) {
      console.warn('Gemini video storyboard generation error, using fallback:', err?.message || err);
    }
  }

  // High-converting offline fallback storyboard
  return generateFallbackVideoStoryboard(params);
}

function generateFallbackVideoStoryboard(params: GenerateVideoStoryboardParams) {
  const platform = params.platform || '9:16';
  const niche = params.niche || 'Digital Products & SaaS';
  const persona = params.aiPersona || 'aggressive_salesman';
  const brief = params.prompt || 'Monetize on Whop with zero ad spend';

  return {
    title: `The 15-Second ${niche} Cashflow Sprint`,
    niche,
    platform,
    aspectRatio: platform,
    audioTrack: 'cyberpunk_synth',
    callToAction: params.callToAction || 'Tap link in bio to copy the complete Whop system',
    whopDiscountCode: params.whopDiscountCode || 'AUTOCASH50',
    voiceoverScript: `Stop wasting months building from scratch. Top creators use this exact automated pipeline to generate digital revenue on Whop. Grab the system at the link in bio today.`,
    totalDurationSeconds: 15,
    aiPersonaUsed: persona,
    scenes: [
      {
        id: 'scene-1',
        sceneNumber: 1,
        durationSeconds: 3,
        heading: 'STOP WASTING 40 HOURS A WEEK',
        subtext: 'If you are still doing this manually in 2026, you are losing money every single day.',
        visualPrompt: 'Dynamic camera zoom into high-contrast glowing dashboard with live revenue metric ticking up.',
        motionStyle: 'kinetic_zoom',
        badgeOverlay: '🔥 URGENT ALERT',
        bgGradient: ['#0f172a', '#1e1b4b'],
      },
      {
        id: 'scene-2',
        sceneNumber: 2,
        durationSeconds: 4,
        heading: 'THE AUTOMATION ENGINE',
        subtext: 'How smart operators replace 5 complex tools with 1 automated Whop checkout machine.',
        visualPrompt: 'Futuristic digital schematic with node connections lighting up in neon cyan.',
        motionStyle: 'glitch_strike',
        badgeOverlay: '⚡ ZERO CODE',
        bgGradient: ['#1e1b4b', '#312e81'],
      },
      {
        id: 'scene-3',
        sceneNumber: 3,
        durationSeconds: 4,
        heading: '14 PAYING CUSTOMERS IN 72 HOURS',
        subtext: 'Turnkey playbooks and recurring membership triggers ready to deploy this afternoon.',
        visualPrompt: 'Glowing notifications cascading on screen with Stripe and Whop transaction alerts.',
        motionStyle: 'cyber_pulse',
        badgeOverlay: '★ VERIFIED RESULTS',
        bgGradient: ['#022c22', '#064e3b'],
      },
      {
        id: 'scene-4',
        sceneNumber: 4,
        durationSeconds: 4,
        heading: 'CLAIM YOUR PASS BEFORE MIDNIGHT',
        subtext: 'Use code AUTOCASH50 at the Whop link in bio for instant commercial access.',
        visualPrompt: 'Whop verified store badge, countdown timer ticking down, and direct checkout button.',
        motionStyle: 'pan_reveal',
        badgeOverlay: '⏳ 50% OFF TODAY',
        bgGradient: ['#450a0a', '#7f1d1d'],
      },
    ],
  };
}
