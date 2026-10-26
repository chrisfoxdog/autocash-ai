import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { verifyWhopWebhookSignature, verifyWhopUserToken, handleWhopEvent } from './server/whop.js';
import {
  generateDigitalProduct,
  generateViralScript,
  generateAffiliateBridge,
  analyzeWhopOffer,
  generateMarketingImage,
  generateVideoStoryboard,
} from './server/gemini.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Simple HTML entity escape function to prevent stored XSS in deliverables
function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// In-memory sliding-window rate limiter per user for AI operations (max 20 req/min)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(userId: string, limit = 20): boolean {
  const now = Date.now();
  const record = rateLimits.get(userId);
  if (!record || now > record.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (record.count >= limit) {
    return false;
  }
  record.count++;
  return true;
}

// ==========================================
// 1. PUBLIC HEALTH & MONITORING ENDPOINTS
// ==========================================
app.get('/api/health', async (req, res) => {
  const dbHealth = await db.healthCheck();
  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbHealth,
    whopConfigured: Boolean(process.env.WHOP_API_KEY && process.env.WHOP_WEBHOOK_SECRET),
    whopAppIdSet: Boolean(process.env.WHOP_APP_ID),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// ==========================================
// 2. WHOP CRYPTOGRAPHIC WEBHOOK ROUTE
// ==========================================
// Must parse raw body before express.json() to perform HMAC-SHA256 signature verification
app.post(
  '/api/webhooks/whop',
  express.raw({ type: '*/*' }),
  async (req, res) => {
    try {
      const rawBody = req.body;
      const signature = (req.headers['webhook-signature'] ||
        req.headers['x-whop-signature'] ||
        req.headers['signature']) as string | undefined;
      const timestamp = (req.headers['webhook-timestamp'] ||
        req.headers['x-whop-timestamp']) as string | undefined;

      // Strict cryptographic signature verification (fails closed if secret missing)
      const verification = verifyWhopWebhookSignature(rawBody, signature, timestamp);

      if (!verification.isValid) {
        console.warn(`[Whop Webhook] Rejected unauthorized webhook: ${verification.reason}`);
        await db.recordWebhook({
          id: `unverified_${Date.now()}`,
          eventId: `unverified_${Date.now()}`,
          eventType: 'unknown',
          timestamp: new Date().toISOString(),
          status: 'rejected',
          details: `Signature verification failed: ${verification.reason}`
        });
        return res.status(401).json({ error: 'Invalid webhook signature', details: verification.reason });
      }

      // Parse validated payload
      let payload;
      try {
        const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf-8') : String(rawBody);
        payload = JSON.parse(bodyStr);
      } catch (err) {
        return res.status(400).json({ error: 'Malformed JSON payload in webhook' });
      }

      // Idempotently process event
      const result = await handleWhopEvent(payload);
      console.log(`[Whop Webhook] Successfully processed event ${payload.action || payload.type}: ${result.message}`);

      return res.status(200).json({
        received: true,
        status: result.status,
        message: result.message,
      });
    } catch (err: any) {
      console.error('[Whop Webhook Error]', err);
      return res.status(500).json({ error: 'Webhook processing error', message: err.message });
    }
  }
);

// Standard JSON parser for all subsequent API endpoints
app.use(express.json({ limit: '1mb' }));

// ==========================================
// 3. WHOP AUTHENTICATION MIDDLEWARE
// ==========================================
// Extracts and validates Whop user identity
export interface AuthRequest extends express.Request {
  userId?: string;
  isDevUser?: boolean;
}

async function requireWhopAuth(req: AuthRequest, res: express.Response, next: express.NextFunction) {
  // Reject mock headers immediately in production mode
  if (process.env.NODE_ENV === 'production') {
    if (req.headers['x-mock-user-id'] || req.headers['x-whop-dev-user-id']) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Mock authentication headers are strictly prohibited in production mode.'
      });
    }
  }

  const tokenHeader = (req.headers['x-whop-user-token'] || req.headers['authorization']) as string | undefined;

  // 1. If Whop token is provided, verify cryptographically against Whop JWKS
  if (tokenHeader) {
    const verification = await verifyWhopUserToken(tokenHeader);
    if (verification.valid && verification.userId) {
      req.userId = verification.userId;
      return next();
    }
    return res.status(401).json({
      error: 'Unauthorized',
      message: verification.error || 'Invalid or expired Whop authentication token'
    });
  }

  // 2. In Production: Strict 401 fail-closed requirement. No valid token = no access.
  if (process.env.NODE_ENV === 'production') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied: Valid Whop user token (x-whop-user-token) is required in production.'
    });
  }

  // 3. In Development Mode only: allow explicit dev user header for local prototyping
  const devHeader = (req.headers['x-whop-dev-user-id'] || req.headers['x-mock-user-id']) as string | undefined;
  if (devHeader && devHeader.trim()) {
    req.userId = devHeader.trim();
    req.isDevUser = true;
    return next();
  }

  // Default sandbox fallback identity for AI Studio Build preview only
  req.userId = 'dev_creator_preview';
  req.isDevUser = true;
  return next();
}

// ==========================================
// 4. PROTECTED USER & ACCOUNT ROUTES
// ==========================================

// Get authenticated user status and entitlements
app.get('/api/user', requireWhopAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const user = await db.getUser(userId);
  return res.json({
    user,
    whopConfigured: Boolean(process.env.WHOP_API_KEY && process.env.WHOP_WEBHOOK_SECRET),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    isDevUser: req.isDevUser || false,
  });
});

// CRITICAL SECURITY FIX: Completely disable client-side plan modification
app.post('/api/user/plan', (req, res) => {
  return res.status(403).json({
    error: 'Forbidden: Direct plan modifications disabled',
    message: 'Memberships can only be acquired or upgraded through verified Whop Checkout. Free client-side upgrades are disabled for security.'
  });
});

// ==========================================
// 5. ASSETS & WORKSPACE (USER-SCOPED)
// ==========================================

// Get all saved assets belonging to this authenticated user
app.get('/api/assets', requireWhopAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const [userAssets, catalog] = await Promise.all([
    db.getAssets(userId),
    db.getCatalogAssets(),
  ]);
  return res.json({ assets: userAssets, catalog });
});

// Get turnkey catalog templates
app.get('/api/catalog', async (req, res) => {
  const catalog = await db.getCatalogAssets();
  return res.json({ catalog });
});

// Delete asset with strict ownership check
app.delete('/api/assets/:id', requireWhopAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { id } = req.params;
  const success = await db.deleteAsset(id, userId);
  if (!success) {
    return res.status(404).json({ error: 'Asset not found or not owned by authenticated user' });
  }
  return res.json({ success: true });
});

// ==========================================
// 6. AI GENERATION STUDIOS (RATE-LIMITED & CREDIT-GATED)
// ==========================================

// Generate Digital Product
app.post('/api/assets/generate-digital-product', requireWhopAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { niche, topic, targetAudience, format, pricePoint, aiPersona } = req.body;

    // Server-side input validation
    if (!niche || typeof niche !== 'string' || niche.trim().length === 0) {
      return res.status(400).json({ error: 'Valid niche is required' });
    }
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Valid topic is required' });
    }
    const cleanPrice = Number(pricePoint);
    if (isNaN(cleanPrice) || cleanPrice <= 0 || cleanPrice > 10000) {
      return res.status(400).json({ error: 'Price point must be a valid number between $1 and $10,000' });
    }

    // Rate limit check
    if (!checkRateLimit(userId)) {
      return res.status(429).json({ error: 'Too many generation requests. Please wait a minute before generating again.' });
    }

    // Atomic credit verification and deduction
    const creditCheck = await db.deductCredit(userId, 1);
    if (!creditCheck.success) {
      return res.status(402).json({
        error: 'Insufficient generation credits',
        message: 'You have run out of AI generation credits. Please upgrade your Whop membership to Pro or Empire.',
        remainingCredits: creditCheck.remaining
      });
    }

    const content = await generateDigitalProduct({
      niche: niche.slice(0, 200),
      topic: topic.slice(0, 300),
      targetAudience: targetAudience ? String(targetAudience).slice(0, 200) : 'Aspiring entrepreneurs and creators',
      format: format || 'playbook',
      pricePoint: cleanPrice,
      aiPersona: aiPersona || undefined,
    });

    const asset = await db.saveAsset({
      userId,
      type: 'digital_product',
      title: content.title || `${niche} Income Playbook`,
      niche,
      content,
    });

    return res.json({
      success: true,
      asset,
      remainingCredits: creditCheck.remaining,
    });
  } catch (err: any) {
    if (req.userId) await db.refundCredit(req.userId, 1).catch(() => {});
    console.error('Digital product generation failed:', err);
    return res.status(500).json({ error: 'Failed to generate product', message: err.message });
  }
});

// Generate Viral Social Scripts
app.post('/api/assets/generate-viral-script', requireWhopAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { niche, productName, hookStyle, platform, callToAction, aiPersona } = req.body;

    if (!niche || typeof niche !== 'string' || !productName || typeof productName !== 'string') {
      return res.status(400).json({ error: 'Niche and product name are required' });
    }

    if (!checkRateLimit(userId)) {
      return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
    }

    const creditCheck = await db.deductCredit(userId, 1);
    if (!creditCheck.success) {
      return res.status(402).json({
        error: 'Insufficient generation credits',
        remainingCredits: creditCheck.remaining,
      });
    }

    const content = await generateViralScript({
      niche: niche.slice(0, 200),
      productName: productName.slice(0, 200),
      hookStyle: hookStyle || 'curiosity',
      platform: platform || 'reels_tiktok',
      callToAction: callToAction ? String(callToAction).slice(0, 300) : 'Click link in bio to get instant access on Whop',
      aiPersona: aiPersona || undefined,
    });

    const asset = await db.saveAsset({
      userId,
      type: 'viral_script',
      title: `Viral Script: ${productName} (${platform || 'video'})`,
      niche,
      content,
    });

    return res.json({
      success: true,
      asset,
      remainingCredits: creditCheck.remaining,
    });
  } catch (err: any) {
    if (req.userId) await db.refundCredit(req.userId, 1).catch(() => {});
    console.error('Viral script generation failed:', err);
    return res.status(500).json({ error: 'Failed to generate script', message: err.message });
  }
});

// Generate High-Yield Recurring Affiliate Bridge Page
app.post('/api/assets/generate-affiliate-bridge', requireWhopAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { niche, productOrCategory, commissionType, targetPainPoint, aiPersona } = req.body;

    if (!niche || !productOrCategory) {
      return res.status(400).json({ error: 'Niche and product/category are required' });
    }

    if (!checkRateLimit(userId)) {
      return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
    }

    const creditCheck = await db.deductCredit(userId, 1);
    if (!creditCheck.success) {
      return res.status(402).json({
        error: 'Insufficient generation credits',
        remainingCredits: creditCheck.remaining,
      });
    }

    const content = await generateAffiliateBridge({
      niche: String(niche).slice(0, 200),
      productOrCategory: String(productOrCategory).slice(0, 200),
      commissionType: commissionType ? String(commissionType).slice(0, 100) : '30% Lifetime Recurring',
      targetPainPoint: targetPainPoint ? String(targetPainPoint).slice(0, 300) : 'Lack of automated lead flow',
      aiPersona: aiPersona || undefined,
    });

    const asset = await db.saveAsset({
      userId,
      type: 'affiliate_bridge',
      title: content.pageTitle || `Affiliate Review: ${productOrCategory}`,
      niche,
      content,
    });

    return res.json({
      success: true,
      asset,
      remainingCredits: creditCheck.remaining,
    });
  } catch (err: any) {
    if (req.userId) await db.refundCredit(req.userId, 1).catch(() => {});
    console.error('Affiliate bridge generation failed:', err);
    return res.status(500).json({ error: 'Failed to generate affiliate bridge', message: err.message });
  }
});

// Whop AI Store Optimizer & Offer Conversion Radar
app.post('/api/optimizer/analyze', requireWhopAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { title, niche, pricePoint, targetAudience, descriptionOrHook } = req.body;

    if (!title || !niche) {
      return res.status(400).json({ error: 'Title and niche are required for optimization audit' });
    }

    if (!checkRateLimit(userId)) {
      return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
    }

    const creditCheck = await db.deductCredit(userId, 1);
    if (!creditCheck.success) {
      return res.status(402).json({
        error: 'Insufficient generation credits',
        remainingCredits: creditCheck.remaining,
      });
    }

    const analysis = await analyzeWhopOffer({
      title: String(title).slice(0, 300),
      niche: String(niche).slice(0, 200),
      pricePoint: Number(pricePoint) || 39,
      targetAudience: targetAudience ? String(targetAudience).slice(0, 300) : undefined,
      descriptionOrHook: descriptionOrHook ? String(descriptionOrHook).slice(0, 1000) : undefined,
    });

    return res.json({
      success: true,
      analysis,
      remainingCredits: creditCheck.remaining,
    });
  } catch (err: any) {
    if (req.userId) await db.refundCredit(req.userId, 1).catch(() => {});
    console.error('Whop offer analysis failed:', err);
    return res.status(500).json({ error: 'Failed to analyze offer', message: err.message });
  }
});

// Autonomous 1-Click Digital Business Pipeline Generator
app.post('/api/assets/generate-autonomous-bundle', requireWhopAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { niche, topic, pricePoint, aiPersona } = req.body;

    if (!niche || typeof niche !== 'string' || niche.trim().length === 0) {
      return res.status(400).json({ error: 'Valid niche is required' });
    }

    if (!checkRateLimit(userId)) {
      return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
    }

    const creditCheck = await db.deductCredit(userId, 1);
    if (!creditCheck.success) {
      return res.status(402).json({
        error: 'Insufficient generation credits',
        remainingCredits: creditCheck.remaining,
      });
    }

    const cleanPrice = Number(pricePoint) || 47;
    const cleanTopic = topic && typeof topic === 'string' && topic.trim().length > 0
      ? topic.trim()
      : `The ${niche} Autopilot Cashflow Playbook`;

    // Concurrently generate the 3 coordinated assets
    const [productContent, scriptContent, affiliateContent] = await Promise.all([
      generateDigitalProduct({
        niche: String(niche).slice(0, 100),
        topic: cleanTopic.slice(0, 200),
        targetAudience: 'Self-directed digital creators, solopreneurs, and remote operators',
        format: 'playbook',
        pricePoint: cleanPrice,
        aiPersona: aiPersona || undefined,
      }),
      generateViralScript({
        niche: String(niche).slice(0, 100),
        productName: cleanTopic.slice(0, 150),
        hookStyle: 'zero_to_hero',
        platform: 'reels_tiktok',
        callToAction: `Grab the complete ${cleanTopic} inside my Whop store`,
        aiPersona: aiPersona || undefined,
      }),
      generateAffiliateBridge({
        niche: String(niche).slice(0, 100),
        productOrCategory: `${niche} Automation Software`,
        commissionType: '30% Lifetime Recurring Monthly',
        targetPainPoint: 'Lack of automated lead flow and repeatable client systems',
        aiPersona: aiPersona || undefined,
      }),
    ]);

    // Save all 3 into database linked to the authenticated user
    const [productAsset, scriptAsset, affiliateAsset] = await Promise.all([
      db.saveAsset({
        userId,
        type: 'digital_product',
        title: productContent.title || cleanTopic,
        niche,
        content: productContent,
      }),
      db.saveAsset({
        userId,
        type: 'viral_script',
        title: `Viral Script: ${cleanTopic} (TikTok/Reels)`,
        niche,
        content: scriptContent,
      }),
      db.saveAsset({
        userId,
        type: 'affiliate_bridge',
        title: affiliateContent.pageTitle || `Top Recurring Software in ${niche}`,
        niche,
        content: affiliateContent,
      }),
    ]);

    return res.json({
      success: true,
      assets: [productAsset, scriptAsset, affiliateAsset],
      productAsset,
      scriptAsset,
      affiliateAsset,
      remainingCredits: creditCheck.remaining,
    });
  } catch (err: any) {
    if (req.userId) await db.refundCredit(req.userId, 1).catch(() => {});
    console.error('Autonomous bundle generation failed:', err);
    return res.status(500).json({ error: 'Autonomous bundle generation failed', message: err.message });
  }
});

// ========================================================
// 6B. BADASS TEXT-TO-IMAGE & TEXT-TO-VIDEO CREATION SUITE
// ========================================================

// Generate high-resolution marketing image for Whop store / social
app.post('/api/media/generate-image', requireWhopAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { prompt, aspectRatio, style, purpose, title, saveToVault } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Valid image prompt is required' });
    }

    if (!checkRateLimit(userId, 20)) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait a minute.' });
    }

    const creditCheck = await db.deductCredit(userId, 1);
    if (!creditCheck.success) {
      return res.status(403).json({
        error: 'Insufficient generation credits. Please upgrade your Whop subscription tier.',
        code: 'UPGRADE_REQUIRED',
      });
    }

    const imageResult = await generateMarketingImage({
      prompt: String(prompt).slice(0, 1000),
      aspectRatio: aspectRatio || '1:1',
      style: style ? String(style).slice(0, 100) : undefined,
      purpose: purpose || 'social_ad',
      title: title ? String(title).slice(0, 100) : undefined,
    });

    let savedAsset = null;
    if (saveToVault !== false) {
      savedAsset = await db.saveAsset({
        userId,
        type: 'marketing_image',
        title: imageResult.title || `Marketing Visual: ${prompt.slice(0, 30)}`,
        niche: purpose || 'Marketing Asset',
        content: imageResult,
      });
    }

    return res.json({
      success: true,
      image: imageResult,
      asset: savedAsset,
      remainingCredits: creditCheck.remaining,
    });
  } catch (err: any) {
    if (req.userId) await db.refundCredit(req.userId, 1).catch(() => {});
    console.error('Media image generation failed:', err);
    return res.status(500).json({ error: 'Failed to generate image', message: err.message });
  }
});

// Generate dynamic marketing video storyboard & script
app.post('/api/media/generate-video-storyboard', requireWhopAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { prompt, niche, platform, businessGoal, aiPersona, callToAction, whopDiscountCode } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Valid video concept prompt is required' });
    }

    if (!checkRateLimit(userId, 20)) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait a minute.' });
    }

    const creditCheck = await db.deductCredit(userId, 1);
    if (!creditCheck.success) {
      return res.status(403).json({
        error: 'Insufficient generation credits. Please upgrade your Whop subscription tier.',
        code: 'UPGRADE_REQUIRED',
      });
    }

    const videoProject = await generateVideoStoryboard({
      prompt: String(prompt).slice(0, 1000),
      niche: niche ? String(niche).slice(0, 100) : undefined,
      platform: platform || '9:16',
      businessGoal: businessGoal || 'launch_teaser',
      aiPersona: aiPersona || undefined,
      callToAction: callToAction ? String(callToAction).slice(0, 250) : undefined,
      whopDiscountCode: whopDiscountCode ? String(whopDiscountCode).slice(0, 50) : undefined,
    });

    return res.json({
      success: true,
      videoProject,
      remainingCredits: creditCheck.remaining,
    });
  } catch (err: any) {
    if (req.userId) await db.refundCredit(req.userId, 1).catch(() => {});
    console.error('Video storyboard generation failed:', err);
    return res.status(500).json({ error: 'Failed to generate video storyboard', message: err.message });
  }
});

// Save marketing video project to user vault
app.post('/api/media/save-video', requireWhopAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { videoProject } = req.body;

    if (!videoProject || !videoProject.title || !Array.isArray(videoProject.scenes)) {
      return res.status(400).json({ error: 'Invalid video project data' });
    }

    const savedAsset = await db.saveAsset({
      userId,
      type: 'marketing_video',
      title: videoProject.title,
      niche: videoProject.niche || 'Marketing Video',
      content: videoProject,
    });

    return res.json({
      success: true,
      asset: savedAsset,
    });
  } catch (err: any) {
    console.error('Failed to save marketing video asset:', err);
    return res.status(500).json({ error: 'Failed to save video asset', message: err.message });
  }
});

// ==========================================
// 7. STORE SETTINGS & DELIVERABLES (SCOPED)
// ==========================================

// Get creator settings for authenticated user
app.get('/api/settings', requireWhopAuth, async (req: AuthRequest, res) => {
  const settings = await db.getSettings(req.userId!);
  return res.json({ settings });
});

// Update creator settings for authenticated user
app.post('/api/settings', requireWhopAuth, async (req: AuthRequest, res) => {
  const updates = req.body;
  const updated = await db.updateSettings(req.userId!, updates);
  return res.json({ success: true, settings: updated });
});

// Affiliate Directory
app.get('/api/affiliate-directory', (req, res) => {
  import('./server/db.js').then(({ REAL_AFFILIATE_PROGRAMS }) => {
    res.json({ programs: REAL_AFFILIATE_PROGRAMS });
  });
});

// Render standalone formatted HTML / Printable PDF deliverable with XSS sanitization
app.get('/api/assets/:id/deliverable-html', async (req, res) => {
  const { id } = req.params;
  const asset = await db.getAssetById(id);

  if (!asset) {
    return res.status(404).send('<h1>Asset Not Found</h1>');
  }

  const settings = await db.getSettings(asset.userId);
  const c = asset.content || {};
  const title = escapeHtml(asset.title || 'Digital Product Masterclass');
  const subtitle = escapeHtml(c.subtitle || '');
  const summary = escapeHtml(c.summary || '');
  const price = Number(c.suggestedPrice) || 39;
  const modules = Array.isArray(c.modules) ? c.modules : [];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - Official Masterclass Deliverable</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    :root {
      --bg: #09090b; --card-bg: #121215; --text: #f4f4f5; --text-muted: #a1a1aa;
      --accent: #06b6d4; --accent-glow: rgba(6, 182, 212, 0.15); --border: #27272a; --success: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.65; padding: 40px 20px; }
    .container { max-width: 840px; margin: 0 auto; background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 48px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    .controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
    .btn { background: var(--accent); color: #09090b; font-weight: 700; font-size: 13px; padding: 10px 18px; border-radius: 8px; border: none; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
    .header-badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent); background: var(--accent-glow); border: 1px solid rgba(6, 182, 212, 0.3); padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; }
    h1 { font-size: 32px; font-weight: 800; line-height: 1.25; color: #ffffff; margin-bottom: 12px; }
    .subtitle { font-size: 16px; color: var(--text-muted); margin-bottom: 24px; }
    .meta-bar { display: flex; flex-wrap: wrap; gap: 20px; background: #09090b; border: 1px solid var(--border); border-radius: 10px; padding: 16px 20px; font-size: 12px; margin-bottom: 40px; }
    .meta-item strong { color: #fff; display: block; font-size: 13px; margin-top: 2px; }
    .summary-card { background: rgba(6, 182, 212, 0.05); border-left: 4px solid var(--accent); padding: 20px 24px; border-radius: 0 12px 12px 0; margin-bottom: 40px; font-size: 14px; color: #e4e4e7; }
    .toc { background: #09090b; border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 48px; }
    .toc h3 { font-size: 14px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 14px; }
    .toc ol { padding-left: 20px; font-size: 14px; }
    .toc li { margin-bottom: 8px; color: var(--accent); }
    .toc li span { color: var(--text); }
    .module-card { margin-bottom: 44px; padding-top: 24px; border-top: 1px solid var(--border); }
    .module-num { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; }
    .module-title { font-size: 22px; font-weight: 700; color: #fff; margin: 6px 0 12px 0; }
    .module-summary { font-size: 14px; color: var(--text-muted); margin-bottom: 20px; }
    .checklist { background: #09090b; border: 1px solid var(--border); border-radius: 10px; padding: 18px; margin: 18px 0; }
    .checklist-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--success); margin-bottom: 10px; }
    .checklist ul { list-style: none; }
    .checklist li { font-size: 13px; color: #d4d4d8; margin-bottom: 6px; display: flex; align-items: flex-start; gap: 8px; }
    .checklist li::before { content: '✓'; color: var(--success); font-weight: bold; }
    .prose { font-size: 14px; color: #d4d4d8; line-height: 1.8; margin: 20px 0; white-space: pre-line; }
    .prompt-box { background: #000000; border: 1px solid #3f3f46; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .prompt-header { display: flex; justify-content: space-between; font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--accent); text-transform: uppercase; margin-bottom: 12px; font-weight: 600; }
    .prompt-content { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #e4e4e7; line-height: 1.7; white-space: pre-wrap; word-break: break-word; }
    .deliverable-footer { margin-top: 60px; padding-top: 24px; border-top: 1px solid var(--border); font-size: 12px; color: var(--text-muted); text-align: center; }
    @media print {
      body { background: #fff !important; color: #111 !important; padding: 0 !important; }
      .container { border: none !important; box-shadow: none !important; padding: 0 !important; max-width: 100% !important; background: #fff !important; }
      .controls { display: none !important; }
      .meta-bar, .toc, .checklist, .prompt-box { background: #f4f4f5 !important; border-color: #e4e4e7 !important; color: #18181b !important; }
      h1, h2, h3, .module-title, strong { color: #000 !important; }
      .prose, .checklist li, .prompt-content { color: #27272a !important; }
      .module-card { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="controls">
      <div style="font-size: 12px; color: var(--text-muted);">
        Official Product Deliverable · Published by <strong>${escapeHtml(settings.storeName)}</strong>
      </div>
      <button class="btn" onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>
    </div>

    <div class="header-badge">Whop Verified Digital Asset</div>
    <h1>${title}</h1>
    <div class="subtitle">${subtitle}</div>

    <div class="meta-bar">
      <div class="meta-item">
        <span>AUTHOR / PUBLISHER</span>
        <strong>${escapeHtml(settings.creatorName)} · ${escapeHtml(settings.storeName)}</strong>
      </div>
      <div class="meta-item">
        <span>STORE ACCESS</span>
        <strong>${escapeHtml(settings.whopStoreUrl)}</strong>
      </div>
      <div class="meta-item">
        <span>RETAIL VALUATION</span>
        <strong style="color: var(--success);">$${price} USD</strong>
      </div>
      <div class="meta-item">
        <span>LICENSE</span>
        <strong>Full Commercial Resale Rights</strong>
      </div>
    </div>

    <div class="summary-card">
      <strong style="color: #fff; display: block; margin-bottom: 6px;">Executive Overview</strong>
      ${summary}
    </div>

    <div class="toc">
      <h3>Masterclass Curriculum & Modules</h3>
      <ol>
        ${modules.map((m: any) => `<li><span>${escapeHtml(m.title)}</span></li>`).join('')}
      </ol>
    </div>

    ${modules.map((m: any, idx: number) => `
      <div class="module-card">
        <div class="module-num">MODULE 0${idx + 1}</div>
        <h2 class="module-title">${escapeHtml(m.title)}</h2>
        <div class="module-summary">${escapeHtml(m.summary)}</div>

        ${m.actionSteps && m.actionSteps.length > 0 ? `
          <div class="checklist">
            <div class="checklist-title">Action Steps & Checklist</div>
            <ul>
              ${m.actionSteps.map((step: string) => `<li>${escapeHtml(step)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="prose">${escapeHtml(m.fullContent || '')}</div>

        ${m.copyPasteResource ? `
          <div class="prompt-box">
            <div class="prompt-header">
              <span>Ready-To-Use Production Resource / Prompt</span>
              <span>Copy-Paste Verified</span>
            </div>
            <div class="prompt-content">${escapeHtml(m.copyPasteResource)}</div>
          </div>
        ` : ''}
      </div>
    `).join('')}

    <div class="deliverable-footer">
      <p>© ${new Date().getFullYear()} ${escapeHtml(settings.storeName)}. All Rights Reserved.</p>
      <p style="margin-top: 4px;">Delivered via Whop Checkout. For member questions, contact <strong>${escapeHtml(settings.supportEmail)}</strong>.</p>
    </div>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
});

// Format Whop Product Listing Kit
app.get('/api/assets/:id/whop-listing-kit', requireWhopAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const asset = await db.getAssetById(id, req.userId!);
  const settings = await db.getSettings(req.userId!);

  if (!asset) {
    return res.status(404).json({ error: 'Asset not found or not owned by authenticated user' });
  }

  const c = asset.content || {};
  const price = c.suggestedPrice || 39;
  const whopSalesCopy = c.whopSalesCopy || {};

  const formattedHtmlDescription = `
<h2>${whopSalesCopy.headline || asset.title}</h2>
<p>${c.summary || ''}</p>

<h3>What You Get Inside:</h3>
<ul>
  ${(whopSalesCopy.bullets || []).map((b: string) => `<li>${b}</li>`).join('')}
</ul>

<h3>Guaranteed Satisfaction:</h3>
<p>${whopSalesCopy.guarantee || '14-Day 100% Action Guarantee.'}</p>

<h3>Frequently Asked Questions:</h3>
${(whopSalesCopy.faq || []).map((f: any) => `
<p><strong>Q: ${f.question}</strong><br/>A: ${f.answer}</p>
`).join('')}

<hr/>
<p><em>Instant digital fulfillment provided immediately after checkout by ${settings.storeName}.</em></p>
`.trim();

  return res.json({
    assetId: asset.id,
    title: asset.title,
    suggestedPrice: price,
    category: 'Software & Digital Guides',
    formattedHtmlDescription,
    headline: whopSalesCopy.headline,
    bullets: whopSalesCopy.bullets || [],
    guarantee: whopSalesCopy.guarantee,
    faq: whopSalesCopy.faq || [],
    instructions: [
      '1. Open dash.whop.com and navigate to Products -> Create Product.',
      '2. Enter Title: "' + asset.title + '" and Price: $' + price + ' one-time.',
      '3. Paste the formatted HTML description into your Whop product listing description.',
      '4. Attach the downloaded PDF / HTML deliverable file under Product Content.',
      '5. Click Publish to make your product checkout link live immediately.'
    ]
  });
});

// ==========================================
// 8. WEBHOOK SIMULATION (DISABLED IN PRODUCTION)
// ==========================================
app.post('/api/whop/simulate-webhook', requireWhopAuth, async (req: AuthRequest, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Forbidden in production',
      message: 'Webhook simulation is strictly disabled in production. Real webhooks must arrive at /api/webhooks/whop.'
    });
  }

  const userId = req.userId!;
  const { eventType, planId, amount } = req.body;
  const simulatedEventId = `sim_evt_${Date.now()}`;

  const payload = {
    id: simulatedEventId,
    action: eventType || 'membership.went_valid',
    timestamp: Math.floor(Date.now() / 1000),
    data: {
      user_id: userId,
      email: `${userId}@whop.user`,
      plan_id: planId || 'plan_pro',
      plan_name: planId?.includes('empire') ? 'Autopilot Empire' : 'Pro Growth',
      amount: amount || (planId?.includes('empire') ? 7900 : 2900),
      currency: 'USD',
      id: `mem_${Date.now()}`,
      membership_id: `mem_${Date.now()}`,
    }
  };

  const result = await handleWhopEvent(payload);
  const user = await db.getUser(userId);
  const logs = await db.getWebhookLogs();

  return res.json({
    success: true,
    result,
    user,
    logs: logs.slice(0, 10),
  });
});

// Get webhook logs
app.get('/api/whop/logs', requireWhopAuth, async (req: AuthRequest, res) => {
  const [logs, transactions] = await Promise.all([
    db.getWebhookLogs(),
    db.getTransactions(req.userId!),
  ]);
  return res.json({ logs, transactions });
});

// Strict Whop Checkout URL Validator: prevents open-redirect and protocol injection
export function isValidWhopCheckoutUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return false;
    return parsed.hostname === 'whop.com' || parsed.hostname.endsWith('.whop.com');
  } catch {
    return false;
  }
}

// Get Whop configuration and checkout URLs
app.get('/api/whop/config', requireWhopAuth, async (req: AuthRequest, res) => {
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const settings = await db.getSettings(req.userId!);
  const proUrl = isValidWhopCheckoutUrl(settings.whopProCheckoutUrl)
    ? settings.whopProCheckoutUrl
    : isValidWhopCheckoutUrl(process.env.WHOP_PRO_CHECKOUT_URL)
    ? process.env.WHOP_PRO_CHECKOUT_URL!
    : '';
  const empireUrl = isValidWhopCheckoutUrl(settings.whopEmpireCheckoutUrl)
    ? settings.whopEmpireCheckoutUrl
    : isValidWhopCheckoutUrl(process.env.WHOP_EMPIRE_CHECKOUT_URL)
    ? process.env.WHOP_EMPIRE_CHECKOUT_URL!
    : '';

  return res.json({
    webhookUrl: `${appUrl}/api/webhooks/whop`,
    whopApiKeySet: Boolean(process.env.WHOP_API_KEY),
    whopWebhookSecretSet: Boolean(process.env.WHOP_WEBHOOK_SECRET),
    whopAppIdSet: Boolean(process.env.WHOP_APP_ID),
    whopAppId: process.env.WHOP_APP_ID || null,
    geminiApiKeySet: Boolean(process.env.GEMINI_API_KEY),
    settings,
    checkoutLinks: {
      proMonthly: proUrl,
      empireMonthly: empireUrl,
    },
    tierFeatures: {
      free: {
        name: 'Starter Hustle',
        price: 0,
        credits: 5,
        features: ['5 AI generations per day', 'Basic Playbook templates', 'Community access'],
      },
      pro: {
        name: 'Pro Growth',
        price: 29,
        credits: 100,
        features: [
          '100 AI generation credits/mo',
          'Full Digital Products & Whop Store copy',
          'Viral Social Content scripts (Reels, TikTok, X)',
          'High-Yield Affiliate Bridge pages',
          'Formatted 1-Click Markdown & PDF export',
        ],
      },
      empire: {
        name: 'Autopilot Empire',
        price: 79,
        credits: Number(process.env.EMPIRE_TIER_CREDITS) || 500,
        features: [
          '500 High-Volume Generation Credits/mo',
          'Priority Gemini Engine',
          'Direct Whop Webhook automation sync',
          'Reseller Rights on all generated digital assets',
          'VIP Private Mastermind access',
        ],
      },
    },
  });
});

// Resolve specific checkout link with validation and open-redirect protection
app.get('/api/whop/checkout-url', requireWhopAuth, async (req: AuthRequest, res) => {
  const { plan } = req.query;
  const settings = await db.getSettings(req.userId!);
  let targetUrl: string | undefined;

  if (plan === 'empire') {
    targetUrl = isValidWhopCheckoutUrl(settings.whopEmpireCheckoutUrl)
      ? settings.whopEmpireCheckoutUrl
      : process.env.WHOP_EMPIRE_CHECKOUT_URL;
  } else {
    targetUrl = isValidWhopCheckoutUrl(settings.whopProCheckoutUrl)
      ? settings.whopProCheckoutUrl
      : process.env.WHOP_PRO_CHECKOUT_URL;
  }

  if (!targetUrl || !isValidWhopCheckoutUrl(targetUrl)) {
    return res.status(400).json({
      error: `Checkout link for ${plan || 'requested plan'} is not configured or is not an official https://whop.com URL. Please set WHOP_${plan === 'empire' ? 'EMPIRE' : 'PRO'}_CHECKOUT_URL in your environment.`,
    });
  }

  return res.json({ url: targetUrl });
});

// ==========================================
// 9. SERVER BOOTSTRAP (PROD STATIC VS DEV MIDDLEWARE)
// ==========================================
async function startServer() {
  const distDir = path.resolve(process.cwd(), 'dist');

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoCash AI Whop Server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test' && !process.env.TEST_MODE) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
