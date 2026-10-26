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
  const whopUserId = data.user_id || data.userId;
  const planId = data.plan_id || data.planId;
  const membershipId = data.id || data.membership_id;

  if (!whopUserId) {
    return { success: false, status: 'ignored', message: 'No user ID present in event data' };
  }

  const defaultEmpireCredits = Number(process.env.EMPIRE_TIER_CREDITS) || 500;
  const isEmpire = Boolean(
    (planId && String(planId).toLowerCase().includes('empire')) ||
    (data.plan_name && String(data.plan_name).toLowerCase().includes('empire'))
  );
  const targetPlan = isEmpire ? 'empire' : 'pro';
  const tierQuota = isEmpire ? defaultEmpireCredits : 100;

  try {
    return await database.withTransaction(async (txDb) => {
      // Re-verify eventId in transaction to avoid race conditions
      if (await txDb.isWebhookProcessed(eventId)) {
        return { success: true, status: 'duplicate', message: 'Event already processed' };
      }

      let handledMessage = '';
      let resultStatus: 'processed' | 'duplicate' | 'reconciliation_needed' = 'processed';

      switch (eventType) {
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
              amount: isEmpire ? 79 : 29,
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
            const oldQuota = oldPlan === 'empire' ? defaultEmpireCredits : (oldPlan === 'pro' ? 100 : 5);

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
                  amount: isEmpire ? 50 : 20,
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
              amount: (data.final_amount || data.amount || 2900) / 100,
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

          const amount = (data.final_amount || data.amount || 2900) / 100;

          // Atomically claim the billing key
          const claimed = await txDb.recordBillingPeriod(billingKey, whopUserId);

          if (!claimed) {
            handledMessage = `Payment succeeded: $${amount} for user ${whopUserId}. Billing key ${billingKey} already credited; duplicate credit grant prevented.`;
            resultStatus = 'duplicate';
          } else {
            const user = await txDb.getUser(whopUserId);
            const isEmpireUser = isEmpire || user.plan === 'empire';
            const renewalPlan = isEmpireUser ? 'empire' : 'pro';
            const renewalQuota = isEmpireUser ? defaultEmpireCredits : 100;

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
            const refundAmount = (data.amount || 2900) / 100;
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
