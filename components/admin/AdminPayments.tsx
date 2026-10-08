"use client";

import { useState } from "react";
import { Search, CreditCard, Plus, RotateCcw, Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Payment } from "@/lib/store";

interface AdminPaymentsProps {
    payments: Payment[];
    onOpenRecordPayment: () => void;
    onRefundPayment: (id: string, clientName: string) => void;
    onExportCSV: () => void;
}

export function AdminPayments({
    payments,
    onOpenRecordPayment,
    onRefundPayment,
    onExportCSV,
}: AdminPaymentsProps) {
    const [search, setSearch] = useState("");
    const [platformFilter, setPlatformFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedTx, setSelectedTx] = useState<Payment | null>(null);

    const filtered = payments.filter((p) => {
        const matchesSearch =
            p.clientName.toLowerCase().includes(search.toLowerCase()) ||
            p.clientEmail.toLowerCase().includes(search.toLowerCase()) ||
            p.referenceId.toLowerCase().includes(search.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

        const matchesPlatform = platformFilter === "all" || p.platform === platformFilter;
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;

        return matchesSearch && matchesPlatform && matchesStatus;
    });

    const totalCollected = payments
        .filter(p => p.status === "succeeded")
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const paystackTotal = payments
        .filter(p => p.platform === "paystack" && p.status === "succeeded")
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const stripeTotal = payments
        .filter(p => p.platform === "stripe" && p.status === "succeeded")
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const paypalTotal = payments
        .filter(p => p.platform === "paypal" && p.status === "succeeded")
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const directTotal = payments
        .filter(p => (p.platform === "manual" || p.platform === "webhook") && p.status === "succeeded")
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-zinc-950 border border-white/10 rounded-3xl">
                <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight">Payments & Remittance Ledger</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Real-time ledger of inbound transactions across third-party platforms and webhooks.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <Button
                        onClick={onOpenRecordPayment}
                        className="h-11 px-5 rounded-xl bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(255,77,0,0.3)] transition-all cursor-pointer"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Record Inbound Payment
                    </Button>
                    <Button
                        onClick={onExportCSV}
                        className="h-11 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs cursor-pointer flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" /> Export Ledger
                    </Button>
                </div>
            </div>

            {/* Platform Revenue Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-5 bg-zinc-950 border border-white/10 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Total Volume</span>
                    <p className="text-2xl font-black italic tracking-tight text-white leading-none">£{totalCollected.toLocaleString()}.00</p>
                    <span className="text-[9px] text-gray-500 font-bold uppercase mt-1 block">{payments.length} Transactions</span>
                </div>
                <div className="p-5 bg-zinc-950 border border-emerald-500/20 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">Paystack Gateway</span>
                    <p className="text-2xl font-black italic tracking-tight text-emerald-400 leading-none">£{paystackTotal.toLocaleString()}.00</p>
                    <span className="text-[9px] text-gray-500 font-bold uppercase mt-1 block">Live & Webhooks</span>
                </div>
                <div className="p-5 bg-zinc-950 border border-white/10 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-1">Stripe Gateway</span>
                    <p className="text-2xl font-black italic tracking-tight text-primary leading-none">£{stripeTotal.toLocaleString()}.00</p>
                    <span className="text-[9px] text-gray-500 font-bold uppercase mt-1 block">Card / Webhooks</span>
                </div>
                <div className="p-5 bg-zinc-950 border border-white/10 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block mb-1">PayPal Orders</span>
                    <p className="text-2xl font-black italic tracking-tight text-blue-400 leading-none">£{paypalTotal.toLocaleString()}.00</p>
                    <span className="text-[9px] text-gray-500 font-bold uppercase mt-1 block">PayPal Capture</span>
                </div>
                <div className="p-5 bg-zinc-950 border border-white/10 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-400 block mb-1">Bank Settlements</span>
                    <p className="text-2xl font-black italic tracking-tight text-green-400 leading-none">£{directTotal.toLocaleString()}.00</p>
                    <span className="text-[9px] text-gray-500 font-bold uppercase mt-1 block">Direct Inflow</span>
                </div>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search reference ID, client name, email..."
                        className="h-12 pl-11 bg-zinc-950 border-white/10 rounded-xl font-bold text-sm text-white placeholder:text-gray-600"
                    />
                </div>

                <div className="sm:col-span-3">
                    <select
                        value={platformFilter}
                        onChange={(e) => setPlatformFilter(e.target.value)}
                        className="w-full h-12 bg-zinc-950 border border-white/10 rounded-xl px-4 font-bold text-xs uppercase tracking-wider text-white focus:outline-none focus:border-primary"
                    >
                        <option value="all">Platform: All</option>
                        <option value="paystack">Paystack</option>
                        <option value="stripe">Stripe</option>
                        <option value="paypal">PayPal</option>
                        <option value="square">Square</option>
                        <option value="manual">Bank Transfer / Cash</option>
                        <option value="webhook">Custom Webhook</option>
                    </select>
                </div>

                <div className="sm:col-span-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-12 bg-zinc-950 border border-white/10 rounded-xl px-4 font-bold text-xs uppercase tracking-wider text-white focus:outline-none focus:border-primary"
                    >
                        <option value="all">Status: All</option>
                        <option value="succeeded">Succeeded Only</option>
                        <option value="pending">Pending Only</option>
                        <option value="refunded">Refunded Only</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-24 bg-zinc-950 border border-white/10 rounded-3xl">
                    <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white mb-1">No Transactions Recorded</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Record an external payment or trigger a webhook simulation.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((pay) => (
                        <div
                            key={pay.id}
                            className="group p-5 sm:p-6 bg-zinc-950 border border-white/10 hover:border-primary/40 rounded-2xl transition-all space-y-4 shadow-sm"
                        >
                            {/* Upper Tier: Platform, Client, Status & Action Controls */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                                {/* Left: Platform Badge & Client Identity */}
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs uppercase border shrink-0 tracking-wider ${
                                        pay.platform === "paystack"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                            : pay.platform === "stripe"
                                            ? "bg-primary/10 text-primary border-primary/30"
                                            : pay.platform === "paypal"
                                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                            : "bg-green-500/10 text-green-400 border-green-500/30"
                                    }`}>
                                        {pay.platform}
                                    </div>

                                    <div className="space-y-0.5 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-black uppercase italic text-white tracking-tight text-base truncate">
                                                {pay.clientName}
                                            </h4>
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                                pay.status === "succeeded"
                                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                            }`}>
                                                {pay.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-bold truncate">{pay.clientEmail}</p>
                                    </div>
                                </div>

                                {/* Right: Amount & Actions */}
                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0 flex-wrap">
                                    <div className="text-left sm:text-right">
                                        <span className="text-xl sm:text-2xl font-black text-white italic block leading-none">
                                            £{pay.amount}.00 <span className="text-xs not-italic font-bold text-gray-400">{pay.currency}</span>
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            onClick={() => setSelectedTx(pay)}
                                            className="h-9 px-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer"
                                        >
                                            Receipt
                                        </Button>

                                        {pay.status === "succeeded" && (
                                            <Button
                                                onClick={() => onRefundPayment(pay.id, pay.clientName)}
                                                variant="outline"
                                                className="h-9 px-3 rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                                                title="Mark Refunded"
                                            >
                                                <RotateCcw className="h-3 w-3 mr-1" /> Refund
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Lower Tier: Transaction Telemetry (Reference ID, Timestamp, Description) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-center text-left">
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                                        Transaction Reference
                                    </span>
                                    <span className="text-xs font-mono font-bold text-gray-300 block truncate" title={pay.referenceId}>
                                        {pay.referenceId}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                                        Settlement Timestamp
                                    </span>
                                    <span className="text-xs font-bold text-gray-400 block">
                                        {new Date(pay.createdAt).toLocaleString()}
                                    </span>
                                </div>

                                <div className="sm:text-right md:text-right">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                                        Payment Context / Memo
                                    </span>
                                    <span className="text-xs font-black uppercase text-primary block truncate" title={pay.description}>
                                        {pay.description || "Verified Payment"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Transaction Receipt Modal */}
            {selectedTx && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
                    <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] w-full max-w-lg p-6 sm:p-8 relative text-white space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-2 border border-primary/20">
                                    <Shield className="h-3 w-3" /> Transaction Dossier
                                </div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tight">{selectedTx.referenceId}</h3>
                            </div>
                            <button
                                onClick={() => setSelectedTx(null)}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-400 uppercase font-black">Client Name</span>
                                <span className="font-bold text-white">{selectedTx.clientName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 uppercase font-black">Client Email</span>
                                <span className="font-bold text-white">{selectedTx.clientEmail}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 uppercase font-black">Platform Gateway</span>
                                <span className="font-bold text-primary uppercase">{selectedTx.platform}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 uppercase font-black">Amount</span>
                                <span className="font-black text-lg text-green-400 italic">£{selectedTx.amount}.00 {selectedTx.currency}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 uppercase font-black">Status</span>
                                <span className="font-black uppercase text-green-400">{selectedTx.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 uppercase font-black">Event Identifier</span>
                                <span className="font-mono text-gray-300">{selectedTx.eventType || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 uppercase font-black">Timestamp</span>
                                <span className="text-gray-300">{new Date(selectedTx.createdAt).toLocaleString()}</span>
                            </div>
                        </div>

                        {selectedTx.rawPayload && (
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Raw Webhook Telemetry</span>
                                <pre className="p-3 bg-black border border-white/10 rounded-xl text-[10px] font-mono text-gray-400 max-h-40 overflow-y-auto">
                                    {JSON.stringify(selectedTx.rawPayload, null, 2)}
                                </pre>
                            </div>
                        )}

                        <Button
                            onClick={() => setSelectedTx(null)}
                            className="w-full h-12 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black font-black uppercase tracking-widest text-xs"
                        >
                            Dismiss Dossier
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
