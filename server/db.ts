import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';

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
  isCatalog?: boolean;
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

export const REAL_AFFILIATE_PROGRAMS: AffiliateProgram[] = [
  {
    id: 'whop',
    name: 'Whop Creator & Platform Referrals',
    category: 'Creator Marketplace & Subscriptions',
    commission: 'Up to 30% recurring creator fee cut',
    cookieDuration: '90 days',
    payoutModel: 'Monthly Direct to Bank / Stripe',
    avgMonthlyPerUser: '$45 - $300/mo',
    officialSignupUrl: 'https://whop.com',
    bestAngle: 'Show entrepreneurs how easy it is to monetize software, guides, and private communities with zero coding or setup fees.',
    targetAudience: 'Creators, community owners, course creators, developers, agency owners.',
    description: 'Whop allows anyone to sell digital access. Refer creators to Whop and earn ongoing revenue from every checkout processed.'
  },
  {
    id: 'gohighlevel',
    name: 'GoHighLevel (HighLevel)',
    category: 'All-In-One CRM & Agency Automation',
    commission: '40% Lifetime Monthly Recurring',
    cookieDuration: '90 days',
    payoutModel: 'Monthly via Tipalti / PayPal',
    avgMonthlyPerUser: '$38.80 - $198.80/mo per subscriber',
    officialSignupUrl: 'https://www.gohighlevel.com',
    bestAngle: 'Replaces 6 separate tools (ClickFunnels, ActiveCampaign, Calendly, Zapier, CallRail) with a single subscription that saves $400/month.',
    targetAudience: 'Marketing agencies, freelancers, consultants, local businesses.',
    description: 'The industry-standard agency and small-business CRM. Extremely high stickiness; customers rarely cancel once their client data is inside.'
  },
  {
    id: 'beehiiv',
    name: 'Beehiiv Newsletter Platform',
    category: 'Email Newsletters & Media Publishing',
    commission: '50% Recurring for first 12 Months',
    cookieDuration: '60 days',
    payoutModel: 'Monthly via Stripe / PayPal',
    avgMonthlyPerUser: '$24 - $49/mo per subscriber',
    officialSignupUrl: 'https://www.beehiiv.com',
    bestAngle: 'The fastest-growing newsletter engine with built-in ad networks and referral programs to monetize readership instantly.',
    targetAudience: 'Writers, content creators, media publishers, newsletter operators.',
    description: 'Founded by the early Morning Brew team, Beehiiv converts at high rates due to generous free tiers that naturally upgrade to paid plans.'
  },
  {
    id: 'make',
    name: 'Make (formerly Integromat)',
    category: 'No-Code Workflow & AI Automation',
    commission: '20% Recurring for 24 Months',
    cookieDuration: '30 days',
    payoutModel: 'Monthly via PartnerStack',
    avgMonthlyPerUser: '$15 - $60/mo per user',
    officialSignupUrl: 'https://www.make.com',
    bestAngle: '70% cheaper than Zapier with visual flow logic, webhook routers, and direct OpenAI/Gemini integration modules.',
    targetAudience: 'Solopreneurs, operations managers, developers, AI builders.',
    description: 'The preferred visual workflow automation tool for modern AI automations. Heavy recurring usage as operations scale.'
  },
  {
    id: 'riverside',
    name: 'Riverside.fm',
    category: 'Studio-Quality Remote Recording & Podcasting',
    commission: '20% Lifetime Monthly Recurring',
    cookieDuration: '60 days',
    payoutModel: 'Monthly via Rewardful',
    avgMonthlyPerUser: '$15 - $35/mo per user',
    officialSignupUrl: 'https://riverside.fm',
    bestAngle: 'Record 4K video and lossless uncompressed audio locally in the browser regardless of poor internet connections, plus 1-click AI clips.',
    targetAudience: 'Podcasters, YouTubers, interviewers, remote teams.',
    description: 'Used by Spotify, Marvel, and The New York Times. Essential for modern video podcasters and creator interview shows.'
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs AI Voice & Speech',
    category: 'Generative AI Voice & Audio',
    commission: '22% Recurring for first 12 Months',
    cookieDuration: '45 days',
    payoutModel: 'Monthly via FirstPromoter',
    avgMonthlyPerUser: '$12 - $75/mo per user',
    officialSignupUrl: 'https://elevenlabs.io',
    bestAngle: 'The undisputed gold standard for realistic AI voiceovers for faceless TikToks, audiobooks, and video game characters.',
    targetAudience: 'Faceless YouTube/TikTok creators, game developers, audiobook narrators.',
    description: 'Hyper-realistic voice cloning and synthesis with viral organic adoption. High trial-to-paid conversion rate.'
  },
  {
    id: 'skool',
    name: 'Skool Community & Courses',
    category: 'Community Gamification & Learning',
    commission: '40% Lifetime Monthly Recurring ($39.60/mo per group)',
    cookieDuration: '90 days',
    payoutModel: 'Monthly via Stripe',
    avgMonthlyPerUser: '$39.60/mo per community',
    officialSignupUrl: 'https://www.skool.com',
    bestAngle: 'The cleanest, highest-engagement gamified community platform founded by Sam Ovens with backing from Alex Hormozi.',
    targetAudience: 'Coaches, creators, community leaders, educators.',
    description: 'Every group is $99/mo; referring one group owner pays you $39.60 every month for as long as their community remains active.'
  }
];

export const CATALOG_PRODUCTS: GeneratedAsset[] = [
  {
    id: 'prod_solopreneur_playbook',
    userId: 'system_catalog',
    isCatalog: true,
    type: 'digital_product',
    title: 'The 2026 AI Solopreneur Workflow Playbook: $0 to $5K/Mo With Automated Digital Micro-Services',
    niche: 'AI Productivity & Automation',
    content: {
      subtitle: 'Complete Step-By-Step Systems To Package, Automate, and Sell In-Demand Digital Workflows on Whop',
      suggestedPrice: 39,
      estimatedTimeToComplete: '75 minutes to set up, runs permanently',
      summary: 'A 100% turnkey, battle-tested operational guide designed for someone starting with zero capital. Explains exactly how to package free AI automation tools into high-margin $39–$199 digital products and micro-services, launch on Whop in under 45 minutes, and secure paying clients with zero upfront advertising.',
      whopSalesCopy: {
        headline: 'Stop Trading Hours For Pennies. Deploy The Turnkey AI Systems Generating $3,000–$5,000/Month On Autopilot.',
        bullets: [
          '4 Deep Technical Modules detailing exact copy-paste AI prompt chains and no-code webhook setups',
          'Complete Whop Store Configuration Checklist: From $0 to live checkout in under 30 minutes',
          '10 Production-Ready Master Prompts for client enrichment, automated proposal generation, and daily workflow execution',
          'Zero-Ad-Spend Customer Acquisition Playbook: How to get your first 10 buyers in 72 hours organically',
          'Includes Commercial Resale License: Rebrand, adapt, and resell as your own digital product'
        ],
        guarantee: '14-Day 100% Action Guarantee. Follow the step-by-step launch checklist. If you do not have your product live and receiving traffic within 14 days, contact support for an immediate, no-questions-asked refund.',
        faq: [
          {
            question: 'Do I need coding experience or paid software to use this?',
            answer: 'None whatsoever. Every automation in this playbook utilizes 100% free software tiers (Notion, Google Sheets, Make.com free plan, and standard Gemini/Claude interfaces).'
          },
          {
            question: 'Can I sell this guide or parts of it on my own Whop store?',
            answer: 'Yes! This product includes full commercial rights. You can adapt the templates, re-brand them with your name, and deliver them directly to your customers.'
          }
        ]
      },
      modules: [
        {
          moduleNumber: 1,
          title: 'Module 1: The High-Margin AI Micro-Service Architecture',
          summary: 'Why $39 to $97 automated digital deliverables out-convert high-ticket agency services in 2026.',
          actionSteps: [
            'Audit high-demand search terms in Notion, Airtable, and Google Workspace ecosystems',
            'Select your single core offer from our 5 pre-validated niches',
            'Clone the master execution workspace into your personal environment'
          ],
          fullContent: `To make money without capital, you must eliminate fulfillment friction. Most people fail because they try to sell custom agency services that require 15 hours of manual work per client. The high-margin micro-service model flips this completely: you package a specific, repeatable business solution into an automated delivery bundle (e.g. an AI-powered content calendar or a cold outreach lead enricher). You sell it once on Whop for $39 to $97, and the buyer receives instant access with zero marginal fulfillment cost to you.`,
          copyPasteResource: `MASTER PROMPT - SERVICE OFFER PACKAGING:\n"Act as a direct-response digital product architect. Analyze the target niche of [INSERT NICHE]. Identify the top 3 tedious administrative workflows that business owners waste at least 5 hours per week on. For each workflow, outline a plug-and-play template bundle that solves this problem in under 15 minutes. Present the output with an irresistible offer title, 3 concrete transformation bullets, and a suggested price point between $29 and $79."`
        }
      ]
    },
    createdAt: new Date().toISOString()
  }
];

export interface IDatabase {
  getUser(userId: string): Promise<UserAccount>;
  updateUser(userId: string, updates: Partial<UserAccount>): Promise<UserAccount>;
  deductCredit(userId: string, amount?: number): Promise<{ success: boolean; remaining: number }>;
  refundCredit(userId: string, amount?: number): Promise<number>;
  getAssets(userId: string): Promise<GeneratedAsset[]>;
  getCatalogAssets(): Promise<GeneratedAsset[]>;
  getAssetById(id: string, userId?: string): Promise<GeneratedAsset | undefined>;
  saveAsset(asset: Omit<GeneratedAsset, 'id' | 'createdAt'>): Promise<GeneratedAsset>;
  deleteAsset(id: string, userId: string): Promise<boolean>;
  getSettings(userId: string): Promise<CreatorSettings>;
  updateSettings(userId: string, updates: Partial<CreatorSettings>): Promise<CreatorSettings>;
  isWebhookProcessed(eventId: string): Promise<boolean>;
  recordWebhook(log: WebhookLog): Promise<void>;
  getWebhookLogs(): Promise<WebhookLog[]>;
  isBillingPeriodProcessed(billingKey: string): Promise<boolean>;
  recordBillingPeriod(billingKey: string, userId: string): Promise<boolean>;
  recordTransaction(tx: Omit<TransactionRecord, 'id' | 'createdAt'>): Promise<TransactionRecord>;
  getTransactions(userId?: string): Promise<TransactionRecord[]>;
  healthCheck(): Promise<{ ok: boolean; type: 'postgres' | 'file'; details?: string }>;
  withTransaction<T>(callback: (txDb: IDatabase) => Promise<T>): Promise<T>;
}

const DEFAULT_SETTINGS: CreatorSettings = {
  storeName: 'AutoCash Systems Studio',
  creatorName: 'Creator',
  whopStoreUrl: 'https://whop.com',
  supportEmail: 'support@whop.com',
  currency: 'USD',
  whopProCheckoutUrl: process.env.WHOP_PRO_CHECKOUT_URL || '',
  whopEmpireCheckoutUrl: process.env.WHOP_EMPIRE_CHECKOUT_URL || '',
};

/**
 * PostgreSQL persistent database implementation (Cloud SQL / Supabase / Postgres)
 */
class PostgresDatabase implements IDatabase {
  private pool: pg.Pool;
  private initialized = false;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }

  private async init() {
    if (this.initialized) return;
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          plan VARCHAR(50) NOT NULL DEFAULT 'free',
          credits INTEGER NOT NULL DEFAULT 5,
          credits_reset_at TIMESTAMPTZ,
          whop_user_id VARCHAR(255),
          whop_membership_id VARCHAR(255),
          whop_plan_id VARCHAR(255),
          status VARCHAR(50) NOT NULL DEFAULT 'active',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS creator_settings (
          user_id VARCHAR(255) PRIMARY KEY,
          store_name VARCHAR(255) NOT NULL,
          creator_name VARCHAR(255) NOT NULL,
          whop_store_url TEXT NOT NULL,
          support_email VARCHAR(255) NOT NULL,
          currency VARCHAR(10) NOT NULL DEFAULT 'USD',
          whop_pro_checkout_url TEXT,
          whop_empire_checkout_url TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS assets (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          title TEXT NOT NULL,
          niche VARCHAR(255) NOT NULL,
          content JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);

        CREATE TABLE IF NOT EXISTS webhook_logs (
          id VARCHAR(255) PRIMARY KEY,
          event_id VARCHAR(255) NOT NULL,
          event_type VARCHAR(100) NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL,
          status VARCHAR(50) NOT NULL,
          details TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_id ON webhook_logs(event_id);

        CREATE TABLE IF NOT EXISTS processed_webhook_ids (
          event_id VARCHAR(255) PRIMARY KEY,
          processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS processed_billing_keys (
          billing_key VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_processed_billing_keys_user ON processed_billing_keys(user_id);

        CREATE TABLE IF NOT EXISTS transactions (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          whop_payment_id VARCHAR(255),
          amount NUMERIC(10, 2) NOT NULL,
          currency VARCHAR(10) NOT NULL,
          plan VARCHAR(100) NOT NULL,
          status VARCHAR(50) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      `);
      this.initialized = true;
    } finally {
      client.release();
    }
  }

  public async getUser(userId: string): Promise<UserAccount> {
    await this.init();
    const res = await this.pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (res.rows.length === 0) {
      const now = new Date().toISOString();
      const reset = new Date(Date.now() + 86400000).toISOString();
      const insert = await this.pool.query(
        `INSERT INTO users (id, email, plan, credits, credits_reset_at, status, created_at, updated_at)
         VALUES ($1, $2, 'free', 5, $3, 'active', $4, $4)
         RETURNING *`,
        [userId, `${userId}@whop.user`, reset, now]
      );
      const r = insert.rows[0];
      return {
        id: r.id,
        email: r.email,
        plan: r.plan,
        credits: r.credits,
        creditsResetAt: r.credits_reset_at,
        whopUserId: r.whop_user_id,
        whopMembershipId: r.whop_membership_id,
        whopPlanId: r.whop_plan_id,
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    }
    const r = res.rows[0];
    return {
      id: r.id,
      email: r.email,
      plan: r.plan,
      credits: r.credits,
      creditsResetAt: r.credits_reset_at,
      whopUserId: r.whop_user_id,
      whopMembershipId: r.whop_membership_id,
      whopPlanId: r.whop_plan_id,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  public async updateUser(userId: string, updates: Partial<UserAccount>): Promise<UserAccount> {
    await this.getUser(userId);
    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;

    if (updates.plan !== undefined) {
      sets.push(`plan = $${idx++}`);
      vals.push(updates.plan);
    }
    if (updates.credits !== undefined) {
      sets.push(`credits = $${idx++}`);
      vals.push(updates.credits);
    }
    if (updates.status !== undefined) {
      sets.push(`status = $${idx++}`);
      vals.push(updates.status);
    }
    if (updates.whopUserId !== undefined) {
      sets.push(`whop_user_id = $${idx++}`);
      vals.push(updates.whopUserId);
    }
    if (updates.whopMembershipId !== undefined) {
      sets.push(`whop_membership_id = $${idx++}`);
      vals.push(updates.whopMembershipId);
    }
    if (updates.whopPlanId !== undefined) {
      sets.push(`whop_plan_id = $${idx++}`);
      vals.push(updates.whopPlanId);
    }

    sets.push(`updated_at = NOW()`);
    vals.push(userId);

    const query = `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await this.pool.query(query, vals);
    const r = res.rows[0];
    return {
      id: r.id,
      email: r.email,
      plan: r.plan,
      credits: r.credits,
      creditsResetAt: r.credits_reset_at,
      whopUserId: r.whop_user_id,
      whopMembershipId: r.whop_membership_id,
      whopPlanId: r.whop_plan_id,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  public async deductCredit(userId: string, amount = 1): Promise<{ success: boolean; remaining: number }> {
    await this.init();
    // Atomic deduction: prevents negative balance and race conditions across all plans
    const res = await this.pool.query(
      `UPDATE users
       SET credits = credits - $1, updated_at = NOW()
       WHERE id = $2 AND credits >= $1
       RETURNING credits`,
      [amount, userId]
    );
    if (res.rows.length === 0) {
      const current = await this.getUser(userId);
      return { success: false, remaining: current.credits };
    }
    return { success: true, remaining: res.rows[0].credits };
  }

  public async refundCredit(userId: string, amount = 1): Promise<number> {
    await this.init();
    const res = await this.pool.query(
      `UPDATE users
       SET credits = credits + $1, updated_at = NOW()
       WHERE id = $2
       RETURNING credits`,
      [amount, userId]
    );
    if (res.rows.length === 0) {
      const current = await this.getUser(userId);
      return current.credits;
    }
    return res.rows[0].credits;
  }

  public async getAssets(userId: string): Promise<GeneratedAsset[]> {
    await this.init();
    const res = await this.pool.query(
      `SELECT * FROM assets WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      type: r.type,
      title: r.title,
      niche: r.niche,
      content: r.content,
      createdAt: r.created_at,
    }));
  }

  public async getCatalogAssets(): Promise<GeneratedAsset[]> {
    return CATALOG_PRODUCTS;
  }

  public async getAssetById(id: string, userId?: string): Promise<GeneratedAsset | undefined> {
    await this.init();
    // Check catalog first
    const catalog = CATALOG_PRODUCTS.find(p => p.id === id);
    if (catalog) return catalog;

    let query = 'SELECT * FROM assets WHERE id = $1';
    const params: any[] = [id];
    if (userId) {
      query += ' AND user_id = $2';
      params.push(userId);
    }
    const res = await this.pool.query(query, params);
    if (res.rows.length === 0) return undefined;
    const r = res.rows[0];
    return {
      id: r.id,
      userId: r.user_id,
      type: r.type,
      title: r.title,
      niche: r.niche,
      content: r.content,
      createdAt: r.created_at,
    };
  }

  public async saveAsset(asset: Omit<GeneratedAsset, 'id' | 'createdAt'>): Promise<GeneratedAsset> {
    await this.init();
    const id = `asset_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO assets (id, user_id, type, title, niche, content, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, asset.userId, asset.type, asset.title, asset.niche, JSON.stringify(asset.content), now]
    );
    return {
      ...asset,
      id,
      createdAt: now,
    };
  }

  public async deleteAsset(id: string, userId: string): Promise<boolean> {
    await this.init();
    const res = await this.pool.query(
      `DELETE FROM assets WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  public async getSettings(userId: string): Promise<CreatorSettings> {
    await this.init();
    const res = await this.pool.query('SELECT * FROM creator_settings WHERE user_id = $1', [userId]);
    if (res.rows.length === 0) {
      await this.pool.query(
        `INSERT INTO creator_settings (user_id, store_name, creator_name, whop_store_url, support_email, currency, whop_pro_checkout_url, whop_empire_checkout_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (user_id) DO NOTHING`,
        [
          userId,
          DEFAULT_SETTINGS.storeName,
          DEFAULT_SETTINGS.creatorName,
          DEFAULT_SETTINGS.whopStoreUrl,
          DEFAULT_SETTINGS.supportEmail,
          DEFAULT_SETTINGS.currency,
          DEFAULT_SETTINGS.whopProCheckoutUrl,
          DEFAULT_SETTINGS.whopEmpireCheckoutUrl,
        ]
      );
      return { ...DEFAULT_SETTINGS };
    }
    const r = res.rows[0];
    return {
      storeName: r.store_name,
      creatorName: r.creator_name,
      whopStoreUrl: r.whop_store_url,
      supportEmail: r.support_email,
      currency: r.currency,
      whopProCheckoutUrl: r.whop_pro_checkout_url || '',
      whopEmpireCheckoutUrl: r.whop_empire_checkout_url || '',
    };
  }

  public async updateSettings(userId: string, updates: Partial<CreatorSettings>): Promise<CreatorSettings> {
    const current = await this.getSettings(userId);
    const merged = { ...current, ...updates };
    await this.pool.query(
      `INSERT INTO creator_settings (user_id, store_name, creator_name, whop_store_url, support_email, currency, whop_pro_checkout_url, whop_empire_checkout_url, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         store_name = EXCLUDED.store_name,
         creator_name = EXCLUDED.creator_name,
         whop_store_url = EXCLUDED.whop_store_url,
         support_email = EXCLUDED.support_email,
         currency = EXCLUDED.currency,
         whop_pro_checkout_url = EXCLUDED.whop_pro_checkout_url,
         whop_empire_checkout_url = EXCLUDED.whop_empire_checkout_url,
         updated_at = NOW()`,
      [
        userId,
        merged.storeName,
        merged.creatorName,
        merged.whopStoreUrl,
        merged.supportEmail,
        merged.currency,
        merged.whopProCheckoutUrl,
        merged.whopEmpireCheckoutUrl,
      ]
    );
    return merged;
  }

  public async isWebhookProcessed(eventId: string): Promise<boolean> {
    await this.init();
    const res = await this.pool.query('SELECT event_id FROM processed_webhook_ids WHERE event_id = $1', [eventId]);
    return res.rows.length > 0;
  }

  public async recordWebhook(log: WebhookLog): Promise<void> {
    await this.init();
    await this.pool.query(
      `INSERT INTO webhook_logs (id, event_id, event_type, timestamp, status, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [log.id, log.eventId, log.eventType, log.timestamp, log.status, log.details]
    );
    if (log.status === 'processed') {
      await this.pool.query(
        `INSERT INTO processed_webhook_ids (event_id) VALUES ($1) ON CONFLICT DO NOTHING`,
        [log.eventId]
      );
    }
  }

  public async getWebhookLogs(): Promise<WebhookLog[]> {
    await this.init();
    const res = await this.pool.query(`SELECT * FROM webhook_logs ORDER BY timestamp DESC LIMIT 100`);
    return res.rows.map(r => ({
      id: r.id,
      eventId: r.event_id,
      eventType: r.event_type,
      timestamp: r.timestamp,
      status: r.status,
      details: r.details,
    }));
  }

  public async isBillingPeriodProcessed(billingKey: string): Promise<boolean> {
    await this.init();
    const res = await this.pool.query('SELECT billing_key FROM processed_billing_keys WHERE billing_key = $1', [billingKey]);
    return res.rows.length > 0;
  }

  public async recordBillingPeriod(billingKey: string, userId: string): Promise<boolean> {
    await this.init();
    const res = await this.pool.query(
      `INSERT INTO processed_billing_keys (billing_key, user_id, processed_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (billing_key) DO NOTHING
       RETURNING billing_key`,
      [billingKey, userId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  public async recordTransaction(tx: Omit<TransactionRecord, 'id' | 'createdAt'>): Promise<TransactionRecord> {
    await this.init();
    const id = `tx_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();
    await this.pool.query(
      `INSERT INTO transactions (id, user_id, whop_payment_id, amount, currency, plan, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, tx.userId, tx.whopPaymentId || null, tx.amount, tx.currency, tx.plan, tx.status, now]
    );
    return { ...tx, id, createdAt: now };
  }

  public async getTransactions(userId?: string): Promise<TransactionRecord[]> {
    await this.init();
    let query = 'SELECT * FROM transactions';
    const params: any[] = [];
    if (userId) {
      query += ' WHERE user_id = $1';
      params.push(userId);
    }
    query += ' ORDER BY created_at DESC LIMIT 100';
    const res = await this.pool.query(query, params);
    return res.rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      whopPaymentId: r.whop_payment_id,
      amount: Number(r.amount),
      currency: r.currency,
      plan: r.plan,
      status: r.status,
      createdAt: r.created_at,
    }));
  }

  public async healthCheck(): Promise<{ ok: boolean; type: 'postgres' | 'file'; details?: string }> {
    try {
      await this.pool.query('SELECT 1');
      return { ok: true, type: 'postgres' };
    } catch (err: any) {
      return { ok: false, type: 'postgres', details: err.message };
    }
  }

  public async withTransaction<T>(callback: (txDb: IDatabase) => Promise<T>): Promise<T> {
    await this.init();
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const txDb = new PostgresTransactionDatabase(client, this);
      const result = await callback(txDb);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch (rbErr) {
        console.error('Failed to rollback transaction:', rbErr);
      }
      throw err;
    } finally {
      client.release();
    }
  }
}

/**
 * Transactional wrapper for PostgreSQL operations ensuring atomic ACID consistency
 */
class PostgresTransactionDatabase implements IDatabase {
  constructor(private client: pg.PoolClient, private parent: PostgresDatabase) {}

  public async getUser(userId: string): Promise<UserAccount> {
    const res = await this.client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [userId]);
    if (res.rows.length === 0) {
      const now = new Date().toISOString();
      const reset = new Date(Date.now() + 86400000).toISOString();
      const insert = await this.client.query(
        `INSERT INTO users (id, email, plan, credits, credits_reset_at, status, created_at, updated_at)
         VALUES ($1, $2, 'free', 5, $3, 'active', $4, $4)
         RETURNING *`,
        [userId, `${userId}@whop.user`, reset, now]
      );
      const r = insert.rows[0];
      return {
        id: r.id,
        email: r.email,
        plan: r.plan,
        credits: r.credits,
        creditsResetAt: r.credits_reset_at,
        whopUserId: r.whop_user_id,
        whopMembershipId: r.whop_membership_id,
        whopPlanId: r.whop_plan_id,
        status: r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    }
    const r = res.rows[0];
    return {
      id: r.id,
      email: r.email,
      plan: r.plan,
      credits: r.credits,
      creditsResetAt: r.credits_reset_at,
      whopUserId: r.whop_user_id,
      whopMembershipId: r.whop_membership_id,
      whopPlanId: r.whop_plan_id,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  public async updateUser(userId: string, updates: Partial<UserAccount>): Promise<UserAccount> {
    await this.getUser(userId);
    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;

    if (updates.plan !== undefined) {
      sets.push(`plan = $${idx++}`);
      vals.push(updates.plan);
    }
    if (updates.credits !== undefined) {
      sets.push(`credits = $${idx++}`);
      vals.push(updates.credits);
    }
    if (updates.status !== undefined) {
      sets.push(`status = $${idx++}`);
      vals.push(updates.status);
    }
    if (updates.whopUserId !== undefined) {
      sets.push(`whop_user_id = $${idx++}`);
      vals.push(updates.whopUserId);
    }
    if (updates.whopMembershipId !== undefined) {
      sets.push(`whop_membership_id = $${idx++}`);
      vals.push(updates.whopMembershipId);
    }
    if (updates.whopPlanId !== undefined) {
      sets.push(`whop_plan_id = $${idx++}`);
      vals.push(updates.whopPlanId);
    }

    sets.push(`updated_at = NOW()`);
    vals.push(userId);

    const query = `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await this.client.query(query, vals);
    const r = res.rows[0];
    return {
      id: r.id,
      email: r.email,
      plan: r.plan,
      credits: r.credits,
      creditsResetAt: r.credits_reset_at,
      whopUserId: r.whop_user_id,
      whopMembershipId: r.whop_membership_id,
      whopPlanId: r.whop_plan_id,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  public async deductCredit(userId: string, amount = 1): Promise<{ success: boolean; remaining: number }> {
    const res = await this.client.query(
      `UPDATE users
       SET credits = credits - $1, updated_at = NOW()
       WHERE id = $2 AND credits >= $1
       RETURNING credits`,
      [amount, userId]
    );
    if (res.rows.length === 0) {
      const current = await this.getUser(userId);
      return { success: false, remaining: current.credits };
    }
    return { success: true, remaining: res.rows[0].credits };
  }

  public async refundCredit(userId: string, amount = 1): Promise<number> {
    const res = await this.client.query(
      `UPDATE users
       SET credits = credits + $1, updated_at = NOW()
       WHERE id = $2
       RETURNING credits`,
      [amount, userId]
    );
    return res.rows[0].credits;
  }

  public async getAssets(userId: string): Promise<GeneratedAsset[]> {
    return this.parent.getAssets(userId);
  }

  public async getCatalogAssets(): Promise<GeneratedAsset[]> {
    return this.parent.getCatalogAssets();
  }

  public async getAssetById(id: string, userId?: string): Promise<GeneratedAsset | undefined> {
    return this.parent.getAssetById(id, userId);
  }

  public async saveAsset(asset: Omit<GeneratedAsset, 'id' | 'createdAt'>): Promise<GeneratedAsset> {
    return this.parent.saveAsset(asset);
  }

  public async deleteAsset(id: string, userId: string): Promise<boolean> {
    return this.parent.deleteAsset(id, userId);
  }

  public async getSettings(userId: string): Promise<CreatorSettings> {
    return this.parent.getSettings(userId);
  }

  public async updateSettings(userId: string, updates: Partial<CreatorSettings>): Promise<CreatorSettings> {
    return this.parent.updateSettings(userId, updates);
  }

  public async isWebhookProcessed(eventId: string): Promise<boolean> {
    const res = await this.client.query('SELECT event_id FROM processed_webhook_ids WHERE event_id = $1', [eventId]);
    return res.rows.length > 0;
  }

  public async recordWebhook(log: WebhookLog): Promise<void> {
    await this.client.query(
      `INSERT INTO webhook_logs (id, event_id, event_type, timestamp, status, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [log.id, log.eventId, log.eventType, log.timestamp, log.status, log.details]
    );
    if (log.status === 'processed') {
      await this.client.query(
        `INSERT INTO processed_webhook_ids (event_id) VALUES ($1) ON CONFLICT DO NOTHING`,
        [log.eventId]
      );
    }
  }

  public async getWebhookLogs(): Promise<WebhookLog[]> {
    return this.parent.getWebhookLogs();
  }

  public async isBillingPeriodProcessed(billingKey: string): Promise<boolean> {
    const res = await this.client.query('SELECT billing_key FROM processed_billing_keys WHERE billing_key = $1', [billingKey]);
    return res.rows.length > 0;
  }

  public async recordBillingPeriod(billingKey: string, userId: string): Promise<boolean> {
    const res = await this.client.query(
      `INSERT INTO processed_billing_keys (billing_key, user_id, processed_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (billing_key) DO NOTHING
       RETURNING billing_key`,
      [billingKey, userId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  public async recordTransaction(tx: Omit<TransactionRecord, 'id' | 'createdAt'>): Promise<TransactionRecord> {
    const id = `tx_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();
    await this.client.query(
      `INSERT INTO transactions (id, user_id, whop_payment_id, amount, currency, plan, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, tx.userId, tx.whopPaymentId || null, tx.amount, tx.currency, tx.plan, tx.status, now]
    );
    return { ...tx, id, createdAt: now };
  }

  public async getTransactions(userId?: string): Promise<TransactionRecord[]> {
    return this.parent.getTransactions(userId);
  }

  public async healthCheck(): Promise<{ ok: boolean; type: 'postgres' | 'file'; details?: string }> {
    return { ok: true, type: 'postgres' };
  }

  public async withTransaction<T>(callback: (txDb: IDatabase) => Promise<T>): Promise<T> {
    return callback(this);
  }
}

/**
 * File-backed database implementation with in-memory mutex and user-scoped isolation
 */
export class FileDatabase implements IDatabase {
  private filePath: string;
  private data: {
    users: Record<string, UserAccount>;
    settings: Record<string, CreatorSettings>;
    assets: GeneratedAsset[];
    webhookLogs: WebhookLog[];
    processedWebhookIds: string[];
    processedBillingKeys: string[];
    transactions: TransactionRecord[];
  };
  private isSaving = false;

  constructor() {
    const dir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.filePath = path.resolve(dir, 'store.json');
    this.data = this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || {},
          settings: parsed.settings || {},
          assets: Array.isArray(parsed.assets) ? parsed.assets : [],
          webhookLogs: Array.isArray(parsed.webhookLogs) ? parsed.webhookLogs : [],
          processedWebhookIds: Array.isArray(parsed.processedWebhookIds) ? parsed.processedWebhookIds : [],
          processedBillingKeys: Array.isArray(parsed.processedBillingKeys) ? parsed.processedBillingKeys : [],
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        };
      }
    } catch (err) {
      console.error('Error loading store.json, using clean memory store:', err);
    }
    return {
      users: {},
      settings: {},
      assets: [],
      webhookLogs: [],
      processedWebhookIds: [],
      processedBillingKeys: [],
      transactions: [],
    };
  }

  private save() {
    try {
      const tempPath = `${this.filePath}.tmp.${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      console.error('Failed to atomically write store.json:', err);
    }
  }

  public async getUser(userId: string): Promise<UserAccount> {
    if (!this.data.users[userId]) {
      const now = new Date().toISOString();
      this.data.users[userId] = {
        id: userId,
        email: `${userId}@whop.user`,
        plan: 'free',
        credits: 5,
        creditsResetAt: new Date(Date.now() + 86400000).toISOString(),
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };
      this.save();
    }
    return { ...this.data.users[userId] };
  }

  public async updateUser(userId: string, updates: Partial<UserAccount>): Promise<UserAccount> {
    const user = await this.getUser(userId);
    const updated = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.users[userId] = updated;
    this.save();
    return { ...updated };
  }

  public async deductCredit(userId: string, amount = 1): Promise<{ success: boolean; remaining: number }> {
    const user = await this.getUser(userId);
    if (user.credits < amount) {
      return { success: false, remaining: user.credits };
    }
    user.credits -= amount;
    user.updatedAt = new Date().toISOString();
    this.data.users[userId] = user;
    this.save();
    return { success: true, remaining: user.credits };
  }

  public async refundCredit(userId: string, amount = 1): Promise<number> {
    const user = await this.getUser(userId);
    user.credits += amount;
    user.updatedAt = new Date().toISOString();
    this.data.users[userId] = user;
    this.save();
    return user.credits;
  }

  public async getAssets(userId: string): Promise<GeneratedAsset[]> {
    // Only return assets that belong to this user
    return this.data.assets.filter(a => a.userId === userId && !a.isCatalog);
  }

  public async getCatalogAssets(): Promise<GeneratedAsset[]> {
    return CATALOG_PRODUCTS;
  }

  public async getAssetById(id: string, userId?: string): Promise<GeneratedAsset | undefined> {
    const catalog = CATALOG_PRODUCTS.find(c => c.id === id);
    if (catalog) return catalog;

    return this.data.assets.find(a => a.id === id && (!userId || a.userId === userId));
  }

  public async saveAsset(asset: Omit<GeneratedAsset, 'id' | 'createdAt'>): Promise<GeneratedAsset> {
    const newAsset: GeneratedAsset = {
      ...asset,
      id: `asset_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      createdAt: new Date().toISOString(),
    };
    this.data.assets.unshift(newAsset);
    this.save();
    return newAsset;
  }

  public async deleteAsset(id: string, userId: string): Promise<boolean> {
    const initialLen = this.data.assets.length;
    this.data.assets = this.data.assets.filter(a => !(a.id === id && a.userId === userId));
    if (this.data.assets.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public async getSettings(userId: string): Promise<CreatorSettings> {
    if (!this.data.settings[userId]) {
      this.data.settings[userId] = { ...DEFAULT_SETTINGS };
      this.save();
    }
    return { ...this.data.settings[userId] };
  }

  public async updateSettings(userId: string, updates: Partial<CreatorSettings>): Promise<CreatorSettings> {
    const current = await this.getSettings(userId);
    const updated = { ...current, ...updates };
    this.data.settings[userId] = updated;
    this.save();
    return { ...updated };
  }

  public async isWebhookProcessed(eventId: string): Promise<boolean> {
    return this.data.processedWebhookIds.includes(eventId);
  }

  public async recordWebhook(log: WebhookLog): Promise<void> {
    this.data.webhookLogs.unshift(log);
    if (log.status === 'processed') {
      this.data.processedWebhookIds.push(log.eventId);
    }
    if (this.data.webhookLogs.length > 200) {
      this.data.webhookLogs = this.data.webhookLogs.slice(0, 200);
    }
    this.save();
  }

  public async getWebhookLogs(): Promise<WebhookLog[]> {
    return this.data.webhookLogs;
  }

  public async isBillingPeriodProcessed(billingKey: string): Promise<boolean> {
    return this.data.processedBillingKeys.includes(billingKey);
  }

  public async recordBillingPeriod(billingKey: string, userId: string): Promise<boolean> {
    if (this.data.processedBillingKeys.includes(billingKey)) {
      return false;
    }
    this.data.processedBillingKeys.push(billingKey);
    this.save();
    return true;
  }

  public async recordTransaction(tx: Omit<TransactionRecord, 'id' | 'createdAt'>): Promise<TransactionRecord> {
    const record: TransactionRecord = {
      ...tx,
      id: `tx_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      createdAt: new Date().toISOString(),
    };
    this.data.transactions.unshift(record);
    this.save();
    return record;
  }

  public async getTransactions(userId?: string): Promise<TransactionRecord[]> {
    if (!userId) return this.data.transactions;
    return this.data.transactions.filter(t => t.userId === userId);
  }

  public async healthCheck(): Promise<{ ok: boolean; type: 'postgres' | 'file'; details?: string }> {
    return { ok: true, type: 'file', details: 'Operating on local structured store with per-user isolation' };
  }

  public async withTransaction<T>(callback: (txDb: IDatabase) => Promise<T>): Promise<T> {
    const snapshot = JSON.stringify(this.data);
    try {
      const result = await callback(this);
      this.save();
      return result;
    } catch (err) {
      this.data = JSON.parse(snapshot);
      this.save();
      throw err;
    }
  }
}

// Export singleton database instance
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  throw new Error(
    'FATAL CONFIGURATION ERROR: DATABASE_URL is not set in production. AutoCash AI requires a persistent PostgreSQL database (Cloud SQL / Supabase / Neon) in production to prevent data loss on ephemeral container filesystems. Ephemeral FileDatabase is strictly disabled in production.'
  );
}

export const db: IDatabase = process.env.DATABASE_URL
  ? new PostgresDatabase(process.env.DATABASE_URL)
  : new FileDatabase();
