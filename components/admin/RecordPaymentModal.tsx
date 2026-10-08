"use client";

import { useState } from "react";
import { X, DollarSign, CreditCard, User, Mail, Shield, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Booking, PaymentPlatform } from "@/lib/store";

interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    bookings: Booking[];
}

export function RecordPaymentModal({ isOpen, onClose, onSuccess, bookings }: RecordPaymentModalProps) {
    const [selectedBookingId, setSelectedBookingId] = useState<string>("none");
    const [clientName, setClientName] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [amount, setAmount] = useState(280);
    const [currency, setCurrency] = useState("GBP");
    const [platform, setPlatform] = useState<PaymentPlatform>("stripe");
    const [referenceId, setReferenceId] = useState(`TX_EXT_${Date.now().toString().slice(-6)}`);
    const [description, setDescription] = useState("External Third-Party Settlement");
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSelectBooking = (id: string) => {
        setSelectedBookingId(id);
        if (id !== "none") {
            const b = bookings.find(item => item.id === id);
            if (b) {
                setClientName(b.name);
                setClientEmail(b.email);
                setAmount(b.price || 30);
                setDescription(`${b.package || 'Session'} - Paid via ${platform.toUpperCase()}`);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/admin/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingId: selectedBookingId !== "none" ? selectedBookingId : undefined,
                    clientName,
                    clientEmail,
                    amount: Number(amount),
                    currency,
                    platform,
                    referenceId,
                    description
                })
            });

            const data = await res.json();
            if (data.success) {
                onSuccess(`Payment of £${amount} from ${clientName} (${platform.toUpperCase()}) recorded in ledger.`);
                onClose();
            } else {
                alert(data.error || "Failed to record payment.");
            }
        } catch (error) {
            console.error(error);
            alert("Network error while recording payment.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-10 relative text-white">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-3 border border-primary/20">
                        <CreditCard className="h-3 w-3" />
                        Third-Party Inflow
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tight">Record Payment</h2>
                    <p className="text-gray-400 text-xs mt-1">Register external remittance from Stripe, PayPal, Square, or Bank Settlement.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Link to Unpaid Booking */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                            <LinkIcon className="h-3.5 w-3.5" /> Associate With Client Protocol
                        </label>
                        <select
                            value={selectedBookingId}
                            onChange={(e) => handleSelectBooking(e.target.value)}
                            className="w-full h-12 bg-zinc-900 border border-white/10 rounded-xl px-3 font-bold text-sm text-white focus:outline-none focus:border-primary"
                        >
                            <option value="none">— Direct Ledger Entry (No Booking Associated) —</option>
                            {bookings.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name} ({b.email}) - {b.package} (£{b.price}) [{b.paymentStatus.toUpperCase()}]
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-primary" /> Client Name
                            </label>
                            <Input
                                required
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="E.g. Alfred Kwesi"
                                className="h-12 bg-white/5 border-white/10 font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-primary" /> Client Email
                            </label>
                            <Input
                                type="email"
                                required
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                                placeholder="alfred@domain.com"
                                className="h-12 bg-white/5 border-white/10 font-bold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5" /> Amount
                            </label>
                            <Input
                                type="number"
                                required
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="h-12 bg-white/5 border-white/10 font-bold text-lg text-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Currency</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full h-12 bg-zinc-900 border border-white/10 rounded-xl px-3 font-bold text-sm text-white focus:outline-none focus:border-primary"
                            >
                                <option value="GBP">GBP (£)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="NGN">NGN (₦)</option>
                                <option value="GHS">GHS (GH₵)</option>
                                <option value="ZAR">ZAR (R)</option>
                                <option value="KES">KES (KSh)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Platform Gateway</label>
                            <select
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value as PaymentPlatform)}
                                className="w-full h-12 bg-zinc-900 border border-white/10 rounded-xl px-3 font-bold text-sm text-white focus:outline-none focus:border-primary"
                            >
                                <option value="paystack">Paystack</option>
                                <option value="stripe">Stripe</option>
                                <option value="paypal">PayPal</option>
                                <option value="square">Square</option>
                                <option value="manual">Bank Transfer</option>
                                <option value="webhook">External Webhook</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5 text-primary" /> Reference / Transaction ID
                        </label>
                        <Input
                            required
                            value={referenceId}
                            onChange={(e) => setReferenceId(e.target.value)}
                            placeholder="ch_3N... or PAYID-..."
                            className="h-12 bg-white/5 border-white/10 font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description / Memo</label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="12 Sessions a month settlement"
                            className="h-12 bg-white/5 border-white/10 font-medium"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-14 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 h-14 rounded-xl bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-[0_0_25px_rgba(255,77,0,0.4)]"
                        >
                            {submitting ? "Committing..." : "Commit Transaction"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
