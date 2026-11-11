import crypto from 'crypto';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { db, type IDatabase } from './db.js';

export interface WhopWebhookEvent {
  action?: string;
  type?: string;
  id?: string;
  data?: any;
  timestamp?: number | string;
  [key: string]: any;
}

export interface VerificationResult {
  isValid: boolean;
  reason?: string;
  mode: 'production';
}

// Remote JWKS set pointing to official Whop public keys
const WHOP_JWKS_URL = 'https://api.whop.com/.well-known/jwks.json';
const remoteJWKSet = createRemoteJWKSet(new URL(WHOP_JWKS_URL));

/**
 * Validates the Whop iframe JWT authentication token sent in x-whop-user-token or Authorization header
 */
export async function verifyWhopUserToken(token: string): Promise<{
  valid: boolean;
  userId?: string;
  error?: string;
}> {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Missing authentication token' };
  }

  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  if (!cleanToken) {
    return { valid: false, error: 'Empty token string' };
  }

  try {
    // Verify cryptographic signature and expiration against Whop JWKS
    const { payload } = await jwtVerify(cleanToken, remoteJWKSet);

    // Whop token standard payload contains user id in 'sub' or 'user_id'
    const userId = (payload.sub || (payload as any).user_id) as string | undefined;

    if (!userId) {
      return { valid: false, error: 'Token missing user identity subject claim' };
    }

    return { valid: true, userId };
  } catch (err: any) {
    return { valid: false, error: `Invalid or expired Whop user token: ${err.message}` };
  }
}

/**
 * Cryptographically verifies Whop webhook signatures using HMAC SHA-256.
 * CRITICAL: Fails closed. If WHOP_WEBHOOK_SECRET is absent, rejects with error.
 */
export function verifyWhopWebhookSignature(
  rawBody: Buffer | string,
  signatureHeader: string | undefined,
  timestampHeader?: string | undefined
): VerificationResult {
  const secret = process.env.WHOP_WEBHOOK_SECRET;

  if (!secret) {
    return {
      isValid: false,
      mode: 'production',
      reason: 'WHOP_WEBHOOK_SECRET is not configured in environment. Webhook rejected for security.'
    };
  }

  if (!signatureHeader) {
    return {
      isValid: false,
      mode: 'production',
      reason: 'Missing webhook signature header'
    };
  }

  let extractedSignature = signatureHeader;
  let signatureTimestamp = timestampHeader;

  // Handle standard t=...,v1=... format
  if (signatureHeader.includes('t=') || signatureHeader.includes('v1=')) {
    const parts = signatureHeader.split(',');
    for (const part of parts) {
      const [k, v] = part.split('=');
      if (k && v) {
        if (k.trim() === 't') signatureTimestamp = v.trim();
        if (k.trim() === 'v1') extractedSignature = v.trim();
      }
    }
  } else if (signatureHeader.startsWith('v1,')) {
    extractedSignature = signatureHeader.slice(3).trim();
  }

  // Replay attack protection: tolerance of 300 seconds (5 minutes)
  if (signatureTimestamp) {
    const tsNumber = Number(signatureTimestamp);
    if (!isNaN(tsNumber)) {
      const now = Math.floor(Date.now() / 1000);
      const eventTs = tsNumber > 1e11 ? Math.floor(tsNumber / 1000) : tsNumber;
      if (Math.abs(now - eventTs) > 300) {
        return {
          isValid: false,
          mode: 'production',
          reason: 'Webhook timestamp expired (replay attack protection triggered)'
        };
      }
    }
  }

  try {
    const bodyBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf-8');

    // Compute expected HMAC SHA-256
    const hmac = crypto.createHmac('sha256', secret);
    if (signatureTimestamp && signatureHeader.includes('t=')) {
      hmac.update(`${signatureTimestamp}.`);
    }
    hmac.update(bodyBuffer);
    const expectedHex = hmac.digest('hex');

    // Also support base64 digest for standardwebhooks format
    const hmacB64 = crypto.createHmac('sha256', secret);
    if (signatureTimestamp && signatureHeader.includes('t=')) {
      hmacB64.update(`${signatureTimestamp}.`);
    }
    hmacB64.update(bodyBuffer);
    const expectedBase64 = hmacB64.digest('base64');

    // Constant-time comparison for hex
    try {
      const sigBuf = Buffer.from(extractedSignature, 'hex');
      const expBuf = Buffer.from(expectedHex, 'hex');
      if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
        return { isValid: true, mode: 'production' };
      }
    } catch {
      // not hex
    }

    // Direct comparison for base64 or raw string
    if (extractedSignature === expectedHex || extractedSignature === expectedBase64) {
      return { isValid: true, mode: 'production' };
    }

    return {
      isValid: false,
      mode: 'production',
      reason: 'Signature mismatch'
    };
  } catch (err: any) {
    return {
      isValid: false,
      mode: 'production',
      reason: `Signature verification error: ${err.message}`
    };
  }
}

/**
 * Processes verified Whop webhook events and updates persistent state idempotently.
 */
export async function handleWhopEvent(
  payload: WhopWebhookEvent,
  database: IDatabase = db
): Promise<{
  success: boolean;
  status: 'processed' | 'duplicate' | 'reconciliation_needed' | 'ignored' | 'error';
  message: string;
}> {
  const eventId = payload.id;
  const eventType = payload.action || payload.type || 'unknown';

  if (!eventId) {
    return { success: false, status: 'ignored', message: 'Missing event ID in payload' };
  }

  // Quick idempotency check before transaction
  const alreadyProcessed = await database.isWebhookProcessed(eventId);
  if (alreadyProcessed) {
    await database.recordWebhook({
      id: crypto.randomUUID(),
      eventId,
      eventType,
      timestamp: new Date().toISOString(),
      status: 'duplicate',
      details: `Duplicate event ${eventId} safely ignored.`
    });
    return { success: true, status: 'duplicate', message: 'Event already processed' };
  }

  const data = payload.data || payload;
  const whopUserId = data.user_id || data.userId || data.user?.id;
  // Whop's current v1 membership payloads carry the purchased plan as
  // `variant_id` (flat legacy payloads used `plan_id`; some events nest it
  // under `plan.id`). The product arrives as `product_id` / `product.id`.
  const planId =
    data.plan_id ||
    data.planId ||
    data.variant_id ||
    data.variantId ||
    data.plan?.id ||
    data.variant?.id;
  const productId = data.product_id || data.productId || data.product?.id;
  // For payment/refund events data.id is the payment's own ID, not a
  // membership ID — never store it as the membership ID.
  const membershipId =
    data.membership_id ||
    data.membership?.id ||
    (typeof data.id === 'string' && data.id.startsWith('mem_') ? data.id : undefined) ||
    (eventType.startsWith('membership.') ? data.id : undefined);

  if (!whopUserId) {
    return { success: false, status: 'ignored', message: 'No user ID present in event data' };
  }

  // Tier architecture — Chris's real Whop offers:
  //   free     = unpaid free trial (NOT a Whop offer), 5 credits
  //   starter  = Starter, $9.99/month, 50 credits per period
  //   pro      = Pro, $29.99/month, 100 credits per period
  //   founders = Lifetime Founders, $99.99 ONE-TIME, 500 credits per period (top tier)
  // FOUNDERS_TIER_CREDITS is the current override; EMPIRE_TIER_CREDITS is a deprecated fallback.
  const foundersCredits =
    Number(process.env.FOUNDERS_TIER_CREDITS) || Number(process.env.EMPIRE_TIER_CREDITS) || 500;
  const PLAN_QUOTAS: Record<string, number> = {
    free: 5,
    starter: 50,
    pro: 100,
    founders: foundersCredits,
  };
  const PLAN_PRICES: Record<string, number> = {
    starter: 9.99,
    pro: 29.99,
    founders: 99.99,
  };

  // Resolve the paid plan. Real Whop plan IDs are opaque (they carry no tier
  // keywords), so exact ID matches against the verified production plans and
  // products win first; keyword matching on plan/product names is the
  // fallback for legacy or simulated payloads.
  const PLAN_ID_TIERS: Record<string, 'starter' | 'pro' | 'founders'> = {
    plan_z8zyXrQ4JZmYs: 'starter', // AutoCash AI Starter $9.99/mo
    plan_kXOcm7vv6lU0y: 'pro', // AutoCash AI Pro $29.99/mo
    plan_9uwm7lipebyma: 'pro', // Main AutoCash AI product $29/mo
    plan_Hp3tLtknQ45rJ: 'founders', // Lifetime Founders $99.99 one-time
  };
  const PRODUCT_ID_TIERS: Record<string, 'starter' | 'pro' | 'founders'> = {
    prod_nHSHb7ywUTXCZ: 'starter',
    prod_pxGdCam3Jyk8B: 'pro',
    prod_2Nn1Eur3xFfyw: 'pro',
    prod_DaADqEe5QIBfB: 'founders',
  };
  const planHaystack =
    `${planId || ''} ${data.plan_name || ''} ${data.plan?.title || data.plan?.name || ''} ${data.product?.title || ''}`.toLowerCase();
  const targetPlan: 'starter' | 'pro' | 'founders' =
    (planId && PLAN_ID_TIERS[planId]) ||
    (productId && PRODUCT_ID_TIERS[productId]) ||
    (planHaystack.includes('founder') || planHaystack.includes('lifetime')
      ? 'founders'
      : planHaystack.includes('starter')
        ? 'starter'
        : 'pro');

  // Whop v1 money fields arrive as objects ({ amount: "29.99", currency });
  // legacy flat payloads used integer cents. Normalise both to dollars.
  const parseAmountDollars = (value: any): number | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'object') {
      const n = Number(value.amount);
      return Number.isNaN(n) ? undefined : n;
    }
    const n = Number(value);
    return Number.isNaN(n) ? undefined : n / 100;
  };
  const tierQuota = PLAN_QUOTAS[targetPlan];

  // Normalise a legacy stored plan value to its current tier name.
  const normalizeStoredPlan = (plan: string): string =>
    plan === 'empire' ? 'founders' : plan;

  try {
    return await database.withTransaction(async (txDb) => {
      // Re-verify eventId in transaction to avoid race conditions
      if (await txDb.isWebhookProcessed(eventId)) {
        return { success: true, status: 'duplicate', message: 'Event already processed' };
      }

      let handledMessage = '';
      let resultStatus: 'processed' | 'duplicate' | 'reconciliation_needed' = 'processed';

      switch (eventType) {
        case 'membership.activated':
        case 'membership.went_valid':
        case 'membership.created': {
          // Authoritative activation billing key
          const activationKey = `act_${membershipId || whopUserId}`;
          const paymentId = data.payment_id || data.initial_payment_id;
          const billingKey = paymentId ? `pay_${paymentId}` : activationKey;

          const alreadyBilled = (await txDb.isBillingPeriodProcessed(activationKey)) ||
                                (paymentId ? await txDb.isBillingPeriodProcessed(billingKey) : false);
          const user = await txDb.getUser(whopUserId);

          // If membership is already active on this plan, preserve balance without replenishing
          if ((alreadyBilled || (user.plan === targetPlan && user.status === 'active')) && user.plan !== 'free') {
            handledMessage = `Membership valid confirmation for user ${whopUserId}: ${targetPlan.toUpperCase()} tier (already activated; balance preserved at ${user.credits}).`;
            resultStatus = 'duplicate';
            await txDb.updateUser(whopUserId, {
              status: 'active',
              whopUserId,
              whopMembershipId: membershipId || user.whopMembershipId,
              whopPlanId: planId || user.whopPlanId,
            });
          } else {
            await txDb.recordBillingPeriod(activationKey, whopUserId);
            if (paymentId) {
              await txDb.recordBillingPeriod(billingKey, whopUserId);
            }
            await txDb.recordTransaction({
              userId: whopUserId,
              amount: PLAN_PRICES[targetPlan],
              currency: 'USD',
              plan: targetPlan,
              status: 'succeeded',
              whopPaymentId: paymentId || `init_${membershipId || Date.now()}`
            });
            handledMessage = `Membership activated for user ${whopUserId}: ${targetPlan.toUpperCase()} tier with ${tierQuota} credits.`;

            await txDb.updateUser(whopUserId, {
              plan: targetPlan,
              status: 'active',
              whopUserId,
              whopMembershipId: membershipId || user.whopMembershipId,
              whopPlanId: planId || user.whopPlanId,
              credits: tierQuota,
            });
          }
          break;
        }

        case 'membership.updated': {
          const user = await txDb.getUser(whopUserId);
          const oldPlan = user.plan;

          // Out-of-order protection: an ordinary non-billing membership.updated must not reactivate a cancelled or past_due user
          if (user.status === 'cancelled' || user.status === 'past_due') {
            handledMessage = `Out-of-order membership update ignored for inactive user ${whopUserId} (status: ${user.status}). Paid access not reactivated.`;
            resultStatus = 'duplicate';
            break;
          }

          if (oldPlan === targetPlan) {
            // Non-billing update (metadata, Discord username, profile update, email change)
            // CRITICAL: Do NOT replenish or overwrite credits! Preserve user's existing balance.
            await txDb.updateUser(whopUserId, {
              status: 'active',
              whopUserId,
              whopMembershipId: membershipId || user.whopMembershipId,
              whopPlanId: planId || user.whopPlanId,
            });
            handledMessage = `Non-billing membership update for user ${whopUserId}. Plan ${targetPlan} and balance of ${user.credits} credits preserved.`;
          } else {
            // Plan change (upgrade or downgrade)
            const oldPlanKey = normalizeStoredPlan(oldPlan);
            const oldQuota = PLAN_QUOTAS[oldPlanKey] ?? 5;

            if (tierQuota > oldQuota) {
              // Upgrade: ensure upgrade delta is not applied twice via upgrade billing key
              const upgradePaymentId = data.payment_id || data.id;
              const upgradeKey = upgradePaymentId
                ? `upg_${upgradePaymentId}`
                : `upg_${whopUserId}_${oldPlan}_to_${targetPlan}_${membershipId || user.whopMembershipId || ''}`;

              const claimed = await txDb.recordBillingPeriod(upgradeKey, whopUserId);
              if (!claimed) {
                handledMessage = `Upgrade event for user ${whopUserId} (${oldPlan} -> ${targetPlan}) already processed under key ${upgradeKey}; balance preserved at ${user.credits}.`;
                resultStatus = 'duplicate';
              } else {
                const delta = tierQuota - oldQuota;
                const newCredits = user.credits + delta;

                await txDb.recordTransaction({
                  userId: whopUserId,
                  amount: Math.max(
                    0,
                    (PLAN_PRICES[targetPlan] ?? 0) - (PLAN_PRICES[oldPlanKey] ?? 0)
                  ),
                  currency: 'USD',
                  plan: `Upgrade: ${targetPlan.toUpperCase()}`,
                  status: 'succeeded',
                  whopPaymentId: upgradePaymentId
                });

                await txDb.updateUser(whopUserId, {
                  plan: targetPlan,
                  status: 'active',
                  whopUserId,
                  whopMembershipId: membershipId || user.whopMembershipId,
                  whopPlanId: planId || user.whopPlanId,
                  credits: newCredits,
                });
                handledMessage = `Plan upgraded for user ${whopUserId} from ${oldPlan} to ${targetPlan}. Added +${delta} credits (new balance: ${newCredits}).`;
              }
            } else {
              // Downgrade: retain balance up to new plan quota
              const newCredits = Math.min(user.credits, tierQuota);
              await txDb.updateUser(whopUserId, {
                plan: targetPlan,
                status: 'active',
                whopUserId,
                whopMembershipId: membershipId || user.whopMembershipId,
                whopPlanId: planId || user.whopPlanId,
                credits: newCredits,
              });
              handledMessage = `Plan downgraded for user ${whopUserId} from ${oldPlan} to ${targetPlan}. Balance adjusted to ${newCredits} credits.`;
            }
          }
          break;
        }

        case 'payment.succeeded': {
          const paymentId = data.id || data.payment_id;
          const billingPeriodEnd = data.billing_period_end;

          // Rule 2.A: Do NOT grant credits based solely on an event ID when no reliable payment/billing-period identity exists
          if (!paymentId && !billingPeriodEnd) {
            handledMessage = `Payment succeeded for user ${whopUserId} lacks reliable payment or billing-period identifier. Flagged for reconciliation without speculative credit allocation.`;
            resultStatus = 'reconciliation_needed';
            await txDb.recordTransaction({
              userId: whopUserId,
              amount:
                parseAmountDollars(data.final_amount) ??
                parseAmountDollars(data.amount) ??
                parseAmountDollars(data.total) ??
                parseAmountDollars(data.subtotal) ??
                29.99,
              currency: data.currency || 'USD',
              plan: data.plan_name || 'Unidentified Payment',
              status: 'pending_reconciliation',
              whopPaymentId: undefined
            });
            break;
          }

          const billingKey = paymentId
            ? `pay_${paymentId}`
            : `period_${membershipId || whopUserId}_${billingPeriodEnd}`;

          const amount =
            parseAmountDollars(data.final_amount) ??
            parseAmountDollars(data.amount) ??
            parseAmountDollars(data.total) ??
            parseAmountDollars(data.subtotal) ??
            29.99;

          // Atomically claim the billing key
          const claimed = await txDb.recordBillingPeriod(billingKey, whopUserId);

          if (!claimed) {
            handledMessage = `Payment succeeded: $${amount} for user ${whopUserId}. Billing key ${billingKey} already credited; duplicate credit grant prevented.`;
            resultStatus = 'duplicate';
          } else {
            const user = await txDb.getUser(whopUserId);
            // Prefer the plan named by this event; when the event carries no plan
            // signal, fall back to the paid plan already on the account (a renewal
            // keeps the member on their existing tier and refreshes its quota).
            const storedPlan = normalizeStoredPlan(user.plan);
            const hasPlanSignal = Boolean(planId || productId || data.plan_name || data.product?.title);
            const renewalPlan: 'starter' | 'pro' | 'founders' = hasPlanSignal
              ? targetPlan
              : storedPlan === 'starter' || storedPlan === 'founders'
                ? storedPlan
                : 'pro';
            const renewalQuota = PLAN_QUOTAS[renewalPlan] ?? 100;

            await txDb.recordTransaction({
              userId: whopUserId,
              amount,
              currency: data.currency || 'USD',
              plan: data.plan_name || renewalPlan,
              status: 'succeeded',
              whopPaymentId: paymentId
            });

            await txDb.updateUser(whopUserId, {
              plan: renewalPlan,
              status: 'active',
              credits: renewalQuota,
              whopUserId,
              whopMembershipId: membershipId || user.whopMembershipId,
              whopPlanId: planId || user.whopPlanId,
            });
            handledMessage = `Renewal payment succeeded: $${amount} for user ${whopUserId}. Quota refreshed to ${renewalQuota} credits.`;
          }
          break;
        }

        case 'payment.failed': {
          await txDb.updateUser(whopUserId, { status: 'past_due' });
          handledMessage = `Payment failed for user ${whopUserId}. Account flagged as past_due.`;
          break;
        }

        case 'membership.deactivated':
        case 'membership.went_invalid':
        case 'membership.cancelled':
        case 'membership.terminated': {
          await txDb.updateUser(whopUserId, {
            plan: 'free',
            status: 'cancelled',
            credits: 5,
            whopMembershipId: undefined
          });
          handledMessage = `Membership cancelled for user ${whopUserId}. Plan downgraded to free tier with 5 credits.`;
          break;
        }

        case 'refund.created': {
          const refundId = data.id || data.refund_id || data.payment_id;
          const refundKey = refundId ? `refund_${refundId}` : `refund_${whopUserId}_${data.amount || 'full'}`;
          const claimed = await txDb.recordBillingPeriod(refundKey, whopUserId);

          if (!claimed) {
            handledMessage = `Refund event for user ${whopUserId} already processed under key ${refundKey}; duplicate refund prevented.`;
            resultStatus = 'duplicate';
          } else {
            const refundAmount =
              parseAmountDollars(data.amount) ?? parseAmountDollars(data.total) ?? 29.99;
            await txDb.updateUser(whopUserId, { plan: 'free', status: 'cancelled', credits: 5 });
            await txDb.recordTransaction({
              userId: whopUserId,
              amount: -refundAmount,
              currency: data.currency || 'USD',
              plan: 'Refund',
              status: 'refunded',
              whopPaymentId: data.payment_id || data.id
            });
            handledMessage = `Refund processed for user ${whopUserId}. Downgraded to free tier.`;
          }
          break;
        }

        default:
          handledMessage = `Event ${eventType} recorded and acknowledged.`;
          break;
      }

      // Record audit log inside transaction
      await txDb.recordWebhook({
        id: crypto.randomUUID(),
        eventId,
        eventType,
        timestamp: new Date().toISOString(),
        status: resultStatus === 'duplicate' ? 'duplicate' : 'processed',
        details: handledMessage
      });

      return { success: true, status: resultStatus, message: handledMessage };
    });
  } catch (err: any) {
    console.error(`[handleWhopEvent Transaction Error] Event ${eventId}:`, err);
    return {
      success: false,
      status: 'error',
      message: `Transaction failed and safely rolled back: ${err.message}`
    };
  }
}
