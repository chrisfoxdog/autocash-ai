import React, { useState, useEffect } from 'react';
import { UserAccount, WebhookLog, WhopConfig, CreatorSettings } from '../types';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  ExternalLink,
  Key,
  Copy,
  Check,
  CheckCircle,
  XCircle,
  Clock,
  Store,
  Save,
  Link,
} from 'lucide-react';

interface WhopIntegrationModalProps {
  user: UserAccount | null;
  onUserUpdated: (user: UserAccount) => void;
}

export const WhopIntegrationModal: React.FC<WhopIntegrationModalProps> = ({
  user,
  onUserUpdated,
}) => {
  const [config, setConfig] = useState<WhopConfig | null>(null);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [simulatedEventType, setSimulatedEventType] = useState('membership.went_valid');
  const [simulatedPlan, setSimulatedPlan] = useState('pro');
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Creator store settings
  const [settings, setSettings] = useState<CreatorSettings>({
    storeName: 'AutoCash Systems Studio',
    creatorName: 'Chris',
    whopStoreUrl: 'https://whop.com',
    supportEmail: 'chrisfoxdog33@gmail.com',
    currency: 'USD',
    whopProCheckoutUrl: 'https://whop.com/checkout/plan_pro_growth_29',
    whopEmpireCheckoutUrl: 'https://whop.com/checkout/plan_empire_autopilot_79',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/whop/config');
      const data = await res.json();
      setConfig(data);
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch Whop config:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/whop/logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch webhook logs:', err);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchLogs();
  }, []);

  const handleCopyWebhookUrl = () => {
    if (config?.webhookUrl) {
      navigator.clipboard.writeText(config.webhookUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setSavedSettingsNotice(true);
        setTimeout(() => setSavedSettingsNotice(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSimulateWebhook = async () => {
    setLoading(true);
    setSimulationResult(null);

    try {
      const res = await fetch('/api/whop/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: simulatedEventType,
          planId: simulatedPlan === 'empire' ? 'plan_whop_empire_79' : 'plan_whop_pro_29',
          amount: simulatedPlan === 'empire' ? 7900 : 2900,
        }),
      });

      const data = await res.json();
      setSimulationResult(data);
      if (data.user) {
        onUserUpdated(data.user);
      }
      fetchLogs();
    } catch (err: any) {
      console.error('Webhook simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
          <span>Production Infrastructure</span>
          <span aria-hidden="true">·</span>
          <span>Whop Developer Platform</span>
          <span aria-hidden="true">·</span>
          <span className="text-cyan-400 font-medium">Server-Side Authorization</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Whop Integration & Store Engine
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Configure your Whop Creator Store profile, set custom checkout URLs, verify server-side cryptographic webhooks, and test membership entitlement transitions.
        </p>
      </div>

      {/* Creator Store Profile Settings */}
      <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <Store className="h-3.5 w-3.5" />
              <span>Creator Profile & Branding</span>
            </div>
            <h2 className="text-base font-semibold text-white">
              Your Whop Store & Checkout Profile
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              These details are automatically embedded into your generated PDF deliverables, Whop listing kits, and customer checkout links.
            </p>
          </div>

          {savedSettingsNotice && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-900 text-emerald-400 text-xs font-medium rounded-md animate-fade-in">
              <Check className="h-3.5 w-3.5" /> Saved Successfully
            </div>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Whop Store / Brand Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Creator / Founder Name
              </label>
              <input
                type="text"
                value={settings.creatorName}
                onChange={(e) => setSettings({ ...settings, creatorName: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Official Whop Store URL
              </label>
              <input
                type="url"
                value={settings.whopStoreUrl}
                onChange={(e) => setSettings({ ...settings, whopStoreUrl: e.target.value })}
                required
                placeholder="https://whop.com/@yourstore"
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-cyan-500 font-mono text-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Support & Contact Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Custom Whop Pro Checkout URL ($29/mo)
              </label>
              <input
                type="url"
                value={settings.whopProCheckoutUrl}
                onChange={(e) => setSettings({ ...settings, whopProCheckoutUrl: e.target.value })}
                placeholder="https://whop.com/checkout/plan_..."
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Custom Whop Empire Checkout URL ($79/mo)
              </label>
              <input
                type="url"
                value={settings.whopEmpireCheckoutUrl}
                onChange={(e) => setSettings({ ...settings, whopEmpireCheckoutUrl: e.target.value })}
                placeholder="https://whop.com/checkout/plan_..."
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors shadow-md"
            >
              <Save className="h-3.5 w-3.5" />
              {savingSettings ? 'Saving Profile...' : 'Save Store Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Production Environment Health Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Whop Secret Check */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300">WHOP_WEBHOOK_SECRET</span>
            {config?.whopWebhookSecretSet ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle className="h-3.5 w-3.5" /> Configured
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" /> Dev Sandbox Mode
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            {config?.whopWebhookSecretSet
              ? 'HMAC-SHA256 signature verification enforced for live Whop traffic.'
              : 'Add WHOP_WEBHOOK_SECRET to AI Studio Settings > Secrets for production verification.'}
          </p>
        </div>

        {/* Whop API Key Check */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300">WHOP_API_KEY</span>
            {config?.whopApiKeySet ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle className="h-3.5 w-3.5" /> Configured
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" /> Ready For Setup
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            {config?.whopApiKeySet
              ? 'Connected to Whop REST API for user profile and plan queries.'
              : 'Used for querying Whop member records directly from backend.'}
          </p>
        </div>

        {/* Gemini Engine Check */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300">GEMINI_API_KEY</span>
            {config?.geminiApiKeySet ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle className="h-3.5 w-3.5" /> Active (Gemini 3.8)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <CheckCircle className="h-3.5 w-3.5" /> Auto-Injected
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Server-side AI generation powered by Gemini 3.8 Flash. No browser exposure.
          </p>
        </div>
      </div>

      {/* Webhook Endpoint Box */}
      <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">
            Your Whop Production Webhook Endpoint
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Enter this URL in your Whop Developer Dashboard under <strong>Settings &gt; Developer &gt; Webhooks</strong> to receive live payment and membership events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={config?.webhookUrl || 'Loading endpoint...'}
            className="w-full px-3 py-2 text-xs font-mono bg-neutral-950 border border-neutral-800 rounded-md text-cyan-400 select-all"
          />
          <button
            onClick={handleCopyWebhookUrl}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-md shrink-0 transition-colors"
          >
            {copiedUrl ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy URL
              </>
            )}
          </button>
        </div>

        <div className="pt-2 text-xs text-neutral-400 space-y-1">
          <span className="font-semibold text-neutral-200">Whop Events Listened:</span>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono text-neutral-300">
            <span className="bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
              membership.went_valid
            </span>
            <span className="bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
              membership.went_invalid
            </span>
            <span className="bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
              payment.succeeded
            </span>
            <span className="bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
              payment.failed
            </span>
            <span className="bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
              refund.created
            </span>
          </div>
        </div>
      </div>

      {/* Live Webhook Simulator (QA & Testing Engine) */}
      <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <RotateCw className="h-3.5 w-3.5" />
            <span>End-to-End QA Testing</span>
          </div>
          <h2 className="text-base font-semibold text-white">
            Whop Webhook Simulator & Event Pipeline Tester
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Simulate real Whop webhook events to verify signature validation, server idempotency, credit allocation, and membership state transitions before going live.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Simulated Event Action
            </label>
            <select
              value={simulatedEventType}
              onChange={(e) => setSimulatedEventType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="membership.went_valid">membership.went_valid (Upgrade)</option>
              <option value="payment.succeeded">payment.succeeded (Record Payment)</option>
              <option value="membership.went_invalid">membership.went_invalid (Cancellation)</option>
              <option value="refund.created">refund.created (Revocation)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Target Whop Tier
            </label>
            <select
              value={simulatedPlan}
              onChange={(e) => setSimulatedPlan(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-md text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="pro">Pro Growth ($29/mo - 100 Credits)</option>
              <option value="empire">Autopilot Empire ($79/mo - Unlimited)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSimulateWebhook}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs rounded-md transition-colors shadow-md"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Dispatch Webhook Event
            </button>
          </div>
        </div>

        {simulationResult && (
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Webhook Dispatched & Handled Successfully</span>
            </div>
            <p className="text-neutral-300 font-mono text-[11px]">
              {simulationResult.result?.message}
            </p>
            <div className="flex items-center gap-3 text-neutral-400 text-[11px] pt-1 border-t border-neutral-900">
              <span>Updated Plan: <strong className="text-white uppercase">{simulationResult.user?.plan}</strong></span>
              <span>Available Credits: <strong className="text-white font-mono">{simulationResult.user?.credits}</strong></span>
              <span>Status: <strong className="text-white">{simulationResult.user?.status}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Webhook Audit Log Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            Server Webhook Audit Logs ({logs.length})
          </h2>
          <button
            onClick={fetchLogs}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
          >
            <RotateCw className="h-3 w-3" />
            Refresh
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="p-6 text-center rounded-lg border border-neutral-800 bg-neutral-900/30 text-xs text-neutral-500">
            No webhook logs recorded yet. Send a test webhook above or trigger a live Whop checkout to view event logs.
          </div>
        ) : (
          <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-2 px-3 font-medium">Timestamp</th>
                  <th className="py-2 px-3 font-medium">Event Type</th>
                  <th className="py-2 px-3 font-medium">Status</th>
                  <th className="py-2 px-3 font-medium">Processing Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                {logs.slice(0, 8).map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-800/30">
                    <td className="py-2 px-3 text-neutral-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-3 text-cyan-400 font-semibold">
                      {log.eventType}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                          log.status === 'processed'
                            ? 'text-emerald-400 bg-emerald-950/60'
                            : log.status === 'duplicate'
                            ? 'text-amber-400 bg-amber-950/60'
                            : 'text-rose-400 bg-rose-950/60'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-neutral-300 font-sans truncate max-w-sm">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Step-by-Step Production Credentials Guide */}
      <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-4">
        <h2 className="text-base font-semibold text-white">
          How To Connect Real Whop Credentials (Step-by-Step)
        </h2>
        <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-900/60 text-cyan-400 text-[11px] font-bold">
              1
            </span>
            <div>
              <strong className="text-white">Go to your Whop Dashboard:</strong> Open{' '}
              <a
                href="https://dash.whop.com"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 underline inline-flex items-center gap-1"
              >
                dash.whop.com <ExternalLink className="h-3 w-3" />
              </a>{' '}
              and navigate to <strong>Settings &gt; Developer</strong>.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-900/60 text-cyan-400 text-[11px] font-bold">
              2
            </span>
            <div>
              <strong className="text-white">Create an API Key:</strong> Under API Keys, generate a new key and add it to your AI Studio <strong>Settings &gt; Secrets</strong> panel as <code className="text-cyan-400 bg-neutral-950 px-1 py-0.5 rounded">WHOP_API_KEY</code>.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-900/60 text-cyan-400 text-[11px] font-bold">
              3
            </span>
            <div>
              <strong className="text-white">Set Webhook Endpoint:</strong> Under Webhooks, paste your Webhook URL (<code className="text-neutral-400 bg-neutral-950 px-1 py-0.5 rounded">{config?.webhookUrl || '/api/webhooks/whop'}</code>) and select all membership and payment events. Copy the Webhook Secret and save it in AI Studio Secrets as <code className="text-cyan-400 bg-neutral-950 px-1 py-0.5 rounded">WHOP_WEBHOOK_SECRET</code>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
