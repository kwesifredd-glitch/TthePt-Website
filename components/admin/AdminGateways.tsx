"use client";

import { useState } from "react";
import { Radio, ShieldCheck, Copy, CheckCircle2, Play, Terminal, RefreshCw, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GatewaySettings } from "@/lib/store";

interface AdminGatewaysProps {
    settings: GatewaySettings;
    onSaveSettings: (settings: GatewaySettings) => void;
    onWebhookSimulated: (msg: string) => void;
}

export function AdminGateways({ settings, onSaveSettings, onWebhookSimulated }: AdminGatewaysProps) {
    const [localSettings, setLocalSettings] = useState<GatewaySettings>(settings);
    const [saving, setSaving] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);

    // Simulator State
    const [simProvider, setSimProvider] = useState<"stripe" | "paypal" | "paystack" | "custom">("paystack");
    const [simClientName, setSimClientName] = useState("David Sterling");
    const [simClientEmail, setSimClientEmail] = useState("david.sterling@apex.co.uk");
    const [simAmount, setSimAmount] = useState(280);
    const [simPackage, setSimPackage] = useState("12 Sessions a month");
    const [simReferenceId, setSimReferenceId] = useState(`PAYSTACK_REF_${Date.now().toString().slice(-6)}`);
    const [simulating, setSimulating] = useState(false);
    const [simResponse, setSimResponse] = useState<Record<string, unknown> | null>(null);

    const webhookEndpoint = typeof window !== 'undefined'
        ? `${window.location.origin}/api/webhooks/payment`
        : `/api/webhooks/payment`;

    const paystackWebhookEndpoint = typeof window !== 'undefined'
        ? `${window.location.origin}/api/webhooks/paystack`
        : `/api/webhooks/paystack`;

    const [copiedPaystackUrl, setCopiedPaystackUrl] = useState(false);

    const handleCopyWebhook = () => {
        navigator.clipboard.writeText(webhookEndpoint);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    const handleCopyPaystackWebhook = () => {
        navigator.clipboard.writeText(paystackWebhookEndpoint);
        setCopiedPaystackUrl(true);
        setTimeout(() => setCopiedPaystackUrl(false), 2000);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gateway: localSettings })
            });
            const data = await res.json();
            if (data.success) {
                onSaveSettings(localSettings);
                alert("Gateway configurations saved successfully.");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const handleFireWebhookSimulation = async () => {
        setSimulating(true);
        setSimResponse(null);

        try {
            let payload: Record<string, unknown> = {};
            let endpoint = "/api/webhooks/payment";
            const customHeaders: Record<string, string> = {
                "Content-Type": "application/json"
            };

            if (simProvider === "stripe") {
                payload = {
                    id: `evt_${Date.now()}`,
                    object: "event",
                    type: "checkout.session.completed",
                    data: {
                        object: {
                            id: simReferenceId,
                            amount_total: Number(simAmount) * 100, // Stripe uses cents/pence
                            currency: "gbp",
                            customer_details: {
                                name: simClientName,
                                email: simClientEmail
                            },
                            metadata: {
                                package: simPackage,
                                email: simClientEmail,
                                name: simClientName
                            }
                        }
                    }
                };
                customHeaders["stripe-signature"] = "simulated_sig_123";
            } else if (simProvider === "paypal") {
                payload = {
                    id: `WH-EVENT-${Date.now()}`,
                    event_type: "PAYMENT.CAPTURE.COMPLETED",
                    resource_type: "capture",
                    resource: {
                        id: simReferenceId,
                        amount: {
                            value: String(simAmount),
                            currency_code: "GBP"
                        },
                        payer: {
                            email_address: simClientEmail,
                            name: {
                                given_name: simClientName.split(" ")[0] || simClientName,
                                surname: simClientName.split(" ")[1] || "Trainee"
                            }
                        }
                    }
                };
            } else if (simProvider === "paystack") {
                endpoint = "/api/webhooks/paystack";
                payload = {
                    event: "charge.success",
                    data: {
                        id: Math.floor(Math.random() * 1000000),
                        domain: "live",
                        status: "success",
                        reference: simReferenceId,
                        amount: Number(simAmount) * 100, // Paystack amounts in kobo / subunits
                        currency: "GBP",
                        paid_at: new Date().toISOString(),
                        channel: "card",
                        gateway_response: "Successful",
                        metadata: {
                            clientName: simClientName,
                            package: simPackage,
                            email: simClientEmail
                        },
                        customer: {
                            id: Math.floor(Math.random() * 90000) + 10000,
                            email: simClientEmail,
                            first_name: simClientName.split(" ")[0] || simClientName,
                            last_name: simClientName.split(" ")[1] || "Trainee",
                            customer_code: `CUS_${Math.random().toString(36).substring(2, 9)}`
                        }
                    }
                };
                customHeaders["x-paystack-signature"] = "simulated_paystack_sig_xyz";
            } else {
                payload = {
                    provider: "custom",
                    eventType: "external.payment.success",
                    clientName: simClientName,
                    clientEmail: simClientEmail,
                    amount: Number(simAmount),
                    currency: "GBP",
                    package: simPackage,
                    referenceId: simReferenceId,
                    secret: localSettings.webhookSecretKey
                };
            }

            const res = await fetch(endpoint, {
                method: "POST",
                headers: customHeaders,
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            setSimResponse(result);

            if (result.success) {
                onWebhookSimulated(`Received payment from ${simClientName} (£${simAmount}) via ${simProvider.toUpperCase()} webhook!`);
            }
        } catch (error) {
            console.error(error);
            setSimResponse({ error: "Network transmission failure" });
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="p-6 bg-zinc-950 border border-white/10 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-2 border border-primary/20">
                        <Radio className="h-3.5 w-3.5" />
                        Third-Party Inbound Synchronization
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tight">Payment Gateways & Webhooks</h2>
                    <p className="text-gray-400 text-xs mt-1">Receive automated payment notifications from Stripe, PayPal, Square, or custom endpoints.</p>
                </div>
            </div>

            {/* Live Webhook Receiver URL Displays */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Paystack Webhook Receiver */}
                <div className="bg-zinc-950 border border-emerald-500/30 p-6 sm:p-8 rounded-[2.5rem] relative overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.1)] flex flex-col justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" /> Paystack Webhook Endpoint
                            </span>
                            <a
                                href="https://dashboard.paystack.com/#/settings/developer"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 underline"
                            >
                                Paystack Dashboard ↗
                            </a>
                        </div>
                        <h3 className="text-lg sm:text-xl font-mono font-bold text-white break-all bg-black/60 p-3 rounded-xl border border-white/5">
                            {paystackWebhookEndpoint}
                        </h3>
                        <p className="text-xs text-gray-400">
                            Paste this URL into your <strong className="text-white">Paystack Dashboard → Settings → API Keys & Webhooks → Live/Test Webhook URL</strong> to automatically synchronize signups and receive payments.
                        </p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            onClick={handleCopyPaystackWebhook}
                            className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                        >
                            {copiedPaystackUrl ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            {copiedPaystackUrl ? "Copied Paystack URL" : "Copy Paystack URL"}
                        </Button>
                    </div>
                </div>

                {/* Universal Webhook Receiver */}
                <div className="bg-zinc-950 border border-primary/30 p-6 sm:p-8 rounded-[2.5rem] relative overflow-hidden shadow-[0_0_40px_rgba(255,77,0,0.1)] flex flex-col justify-between">
                    <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Universal Webhook Endpoint
                        </span>
                        <h3 className="text-lg sm:text-xl font-mono font-bold text-white break-all bg-black/60 p-3 rounded-xl border border-white/5">
                            {webhookEndpoint}
                        </h3>
                        <p className="text-xs text-gray-400">
                            Configure this URL in Stripe, PayPal, Square, or custom automated workflows to automatically intake trainees.
                        </p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            onClick={handleCopyWebhook}
                            className="h-11 px-5 rounded-xl bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(255,77,0,0.4)] cursor-pointer"
                        >
                            {copiedUrl ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            {copiedUrl ? "Copied Universal URL" : "Copy Universal URL"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Live Webhook Simulator (Test Platform Inflow) */}
            <div className="bg-zinc-950 border border-white/10 p-6 sm:p-8 rounded-[2.5rem] space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-2 border border-green-500/20">
                            <Terminal className="h-3.5 w-3.5" />
                            Live Simulator & Debugger
                        </div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tight">Test Inbound Payment Webhook</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Fire a simulated third-party platform payment to verify automatic signup & ledger synchronization.</p>
                    </div>
                </div>

                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-6">
                    {/* Platform Selector */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary block mb-2">Simulate Provider Event</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { id: "paystack", name: "Paystack", event: "charge.success", badge: "Africa & Global" },
                                { id: "stripe", name: "Stripe", event: "checkout.session.completed", badge: "Card / Apple Pay" },
                                { id: "paypal", name: "PayPal", event: "PAYMENT.CAPTURE.COMPLETED", badge: "Express Checkout" },
                                { id: "custom", name: "Custom API", event: "external.payment.success", badge: "Direct JSON" }
                            ].map((prov) => (
                                <button
                                    key={prov.id}
                                    type="button"
                                    onClick={() => {
                                        setSimProvider(prov.id as "stripe" | "paypal" | "paystack" | "custom");
                                        setSimReferenceId(`${prov.id.toUpperCase()}_REF_${Date.now().toString().slice(-6)}`);
                                    }}
                                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                        simProvider === prov.id
                                            ? "bg-primary/20 border-primary text-white shadow-[0_0_20px_rgba(255,77,0,0.2)]"
                                            : "bg-black/40 border-white/10 text-gray-400 hover:text-white"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-black uppercase text-xs block">{prov.name}</span>
                                        <span className="text-[8px] font-mono text-zinc-500">{prov.badge}</span>
                                    </div>
                                    <span className="text-[9px] font-mono text-gray-500 block truncate mt-1">{prov.event}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Simulation Parameters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trainee Full Name</label>
                            <Input
                                value={simClientName}
                                onChange={(e) => setSimClientName(e.target.value)}
                                className="h-11 bg-black border-white/10 font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trainee Email</label>
                            <Input
                                type="email"
                                value={simClientEmail}
                                onChange={(e) => setSimClientEmail(e.target.value)}
                                className="h-11 bg-black border-white/10 font-bold text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Amount (£ GBP)</label>
                            <Input
                                type="number"
                                value={simAmount}
                                onChange={(e) => setSimAmount(Number(e.target.value))}
                                className="h-11 bg-black border-white/10 font-bold text-sm text-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Package Title</label>
                            <Input
                                value={simPackage}
                                onChange={(e) => setSimPackage(e.target.value)}
                                className="h-11 bg-black border-white/10 font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction ID</label>
                            <Input
                                value={simReferenceId}
                                onChange={(e) => setSimReferenceId(e.target.value)}
                                className="h-11 bg-black border-white/10 font-mono text-xs"
                            />
                        </div>
                    </div>

                    <Button
                        type="button"
                        disabled={simulating}
                        onClick={handleFireWebhookSimulation}
                        className="w-full h-14 rounded-xl bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-[0_0_25px_rgba(255,77,0,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {simulating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
                        {simulating ? "Firing Inbound Webhook..." : `Fire ${simProvider.toUpperCase()} Webhook Simulation`}
                    </Button>

                    {/* Simulation Result Output */}
                    {simResponse && (
                        <div className="p-4 bg-black border border-white/10 rounded-xl space-y-2 animate-in fade-in">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-green-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Webhook Receiver Response (HTTP 200)
                                </span>
                                <span className="text-[9px] text-gray-500 font-mono">Synchronized</span>
                            </div>
                            <pre className="text-[11px] font-mono text-gray-300 overflow-x-auto max-h-48 p-2">
                                {JSON.stringify(simResponse, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>

            {/* Gateway Credentials Settings Form */}
            <form onSubmit={handleSave} className="bg-zinc-950 border border-white/10 p-6 sm:p-8 rounded-[2.5rem] space-y-8">
                <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tight">Gateway API Configurations</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Manage live API keys and signing secrets for production webhook verification.</p>
                </div>

                {/* Paystack Integration Config */}
                <div className="p-6 bg-white/5 border border-emerald-500/20 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-500/30">
                                P
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-black uppercase tracking-wide text-sm text-white">Paystack Integration</h4>
                                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">
                                        Active Direct Connection
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium">Accept Card, Bank, Transfer, USSD, Apple Pay via Paystack</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <a
                                href="https://dashboard.paystack.com/#/settings/developer"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 underline hidden sm:inline"
                            >
                                Get API Keys ↗
                            </a>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={localSettings.paystackEnabled}
                                    onChange={(e) => setLocalSettings({ ...localSettings, paystackEnabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Public Key (Live / Test)</label>
                                <span className="text-[9px] text-zinc-500 font-mono">pk_live_... / pk_test_...</span>
                            </div>
                            <Input
                                value={localSettings.paystackPublicKey}
                                onChange={(e) => setLocalSettings({ ...localSettings, paystackPublicKey: e.target.value })}
                                placeholder="pk_test_... or pk_live_..."
                                className="h-11 bg-black border-white/10 font-mono text-xs text-white"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Secret Key (Live / Test)</label>
                                <span className="text-[9px] text-zinc-500 font-mono">sk_live_... / sk_test_...</span>
                            </div>
                            <Input
                                type="password"
                                value={localSettings.paystackSecretKey}
                                onChange={(e) => setLocalSettings({ ...localSettings, paystackSecretKey: e.target.value })}
                                placeholder="sk_test_... or sk_live_..."
                                className="h-11 bg-black border-white/10 font-mono text-xs text-white"
                            />
                        </div>
                    </div>

                    <div className="p-3 bg-black/50 border border-white/5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px]">
                        <span className="text-gray-400">
                            Webhook Target: <code className="text-emerald-400 font-mono">{paystackWebhookEndpoint}</code>
                        </span>
                        <a
                            href="https://dashboard.paystack.com/#/settings/developer"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider"
                        >
                            Open Paystack API Dashboard ↗
                        </a>
                    </div>
                </div>

                {/* Stripe Config */}
                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                                S
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-wide text-sm text-white">Stripe Integration</h4>
                                <p className="text-[10px] text-gray-400 font-medium">Accept Card, Apple Pay, Google Pay</p>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={localSettings.stripeEnabled}
                                onChange={(e) => setLocalSettings({ ...localSettings, stripeEnabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Publishable Key</label>
                            <Input
                                value={localSettings.stripePublishableKey}
                                onChange={(e) => setLocalSettings({ ...localSettings, stripePublishableKey: e.target.value })}
                                placeholder="pk_live_..."
                                className="h-11 bg-black border-white/10 font-mono text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Secret Key</label>
                            <Input
                                type="password"
                                value={localSettings.stripeSecretKey}
                                onChange={(e) => setLocalSettings({ ...localSettings, stripeSecretKey: e.target.value })}
                                placeholder="sk_live_..."
                                className="h-11 bg-black border-white/10 font-mono text-xs"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Webhook Signing Secret</label>
                        <Input
                            type="password"
                            value={localSettings.stripeWebhookSecret}
                            onChange={(e) => setLocalSettings({ ...localSettings, stripeWebhookSecret: e.target.value })}
                            placeholder="whsec_..."
                            className="h-11 bg-black border-white/10 font-mono text-xs"
                        />
                    </div>
                </div>

                {/* PayPal Config */}
                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black text-sm">
                                P
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-wide text-sm text-white">PayPal Integration</h4>
                                <p className="text-[10px] text-gray-400 font-medium">Accept PayPal Express Orders</p>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={localSettings.paypalEnabled}
                                onChange={(e) => setLocalSettings({ ...localSettings, paypalEnabled: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">PayPal Client ID</label>
                            <Input
                                value={localSettings.paypalClientId}
                                onChange={(e) => setLocalSettings({ ...localSettings, paypalClientId: e.target.value })}
                                placeholder="client_id_..."
                                className="h-11 bg-black border-white/10 font-mono text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">PayPal Webhook ID</label>
                            <Input
                                value={localSettings.paypalWebhookId}
                                onChange={(e) => setLocalSettings({ ...localSettings, paypalWebhookId: e.target.value })}
                                placeholder="webhook_id_..."
                                className="h-11 bg-black border-white/10 font-mono text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Universal Webhook Secret Key */}
                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                        <Key className="h-3.5 w-3.5" /> Universal Webhook Authentication Secret
                    </label>
                    <Input
                        value={localSettings.webhookSecretKey}
                        onChange={(e) => setLocalSettings({ ...localSettings, webhookSecretKey: e.target.value })}
                        className="h-11 bg-black border-white/10 font-mono text-xs"
                    />
                    <p className="text-[10px] text-gray-500">
                        Include this key in your custom third-party webhook headers (<code className="text-gray-300 font-mono">x-webhook-secret</code>) for verification.
                    </p>
                </div>

                <Button
                    type="submit"
                    disabled={saving}
                    className="w-full h-14 rounded-xl bg-white hover:bg-gray-200 text-black font-black uppercase tracking-widest text-xs transition-all cursor-pointer shadow-xl"
                >
                    {saving ? "Saving Credentials..." : "Commit Gateway Settings"}
                </Button>
            </form>
        </div>
    );
}
