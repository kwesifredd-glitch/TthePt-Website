"use client";

import { useState } from "react";
import { X, Calendar, Clock, User, Mail, Phone, DollarSign, Shield, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookingStatus, PaymentStatus, PaymentPlatform } from "@/lib/store";

interface NewBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    prefill?: {
        name?: string;
        email?: string;
        phone?: string;
        objective?: string;
    };
}

const PRESET_PACKAGES = [
    { name: "12 Sessions a month", price: 280 },
    { name: "8 Sessions a month", price: 200 },
    { name: "Single Session", price: 30 },
    { name: "Custom Protocol", price: 150 },
];

export function NewBookingModal({ isOpen, onClose, onSuccess, prefill }: NewBookingModalProps) {
    const tomorrowStr = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split("T")[0];
    };

    const [name, setName] = useState(prefill?.name || "");
    const [email, setEmail] = useState(prefill?.email || "");
    const [phone, setPhone] = useState(prefill?.phone || "");
    const [date, setDate] = useState(tomorrowStr());
    const [time, setTime] = useState("10:00");
    const [packageName, setPackageName] = useState(PRESET_PACKAGES[0].name);
    const [price, setPrice] = useState(PRESET_PACKAGES[0].price);
    const [status, setStatus] = useState<BookingStatus>("confirmed");
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
    const [paymentMethod, setPaymentMethod] = useState<PaymentPlatform>("stripe");
    const [goals, setGoals] = useState(prefill?.objective || "");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handlePackageChange = (pName: string) => {
        setPackageName(pName);
        const found = PRESET_PACKAGES.find(p => p.name === pName);
        if (found) setPrice(found.price);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/admin/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    date,
                    time,
                    package: packageName,
                    price: Number(price),
                    status,
                    paymentStatus,
                    paymentMethod,
                    notes,
                    goals
                })
            });

            const data = await res.json();
            if (data.success) {
                onSuccess(`Client "${name}" enrolled successfully with £${price} status ${paymentStatus.toUpperCase()}`);
                onClose();
            } else {
                alert(data.error || "Failed to create client booking.");
            }
        } catch (error) {
            console.error(error);
            alert("Network error while creating booking.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-10 relative text-white">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-3 border border-primary/20">
                        <Shield className="h-3 w-3" />
                        Direct Client Enrollment
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tight">Manual Trainee Intake</h2>
                    <p className="text-gray-400 text-xs mt-1">Enroll a client directly into the command portal with payment authorization.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Trainee Identity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" /> Full Name
                            </label>
                            <Input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="E.g. Alexander Vance"
                                className="h-12 bg-white/5 border-white/10 font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5" /> Email Address
                            </label>
                            <Input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="alex@venture.com"
                                className="h-12 bg-white/5 border-white/10 font-bold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-primary" /> Phone (Optional)
                            </label>
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+44 7900 123456"
                                className="h-12 bg-white/5 border-white/10 font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-primary" /> Session Date
                            </label>
                            <Input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="h-12 bg-white/5 border-white/10 font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-primary" /> Time Slot
                            </label>
                            <select
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full h-12 bg-zinc-900 border border-white/10 rounded-xl px-3 font-bold text-sm text-white focus:outline-none focus:border-primary"
                            >
                                {["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((t) => (
                                    <option key={t} value={t}>{t} BST</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Package & Payment */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                                Package Tier
                            </label>
                            <select
                                value={packageName}
                                onChange={(e) => handlePackageChange(e.target.value)}
                                className="w-full h-12 bg-zinc-900 border border-white/10 rounded-xl px-3 font-bold text-sm text-white focus:outline-none focus:border-primary"
                            >
                                {PRESET_PACKAGES.map((p) => (
                                    <option key={p.name} value={p.name}>{p.name} (£{p.price})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5" /> Amount (£ GBP)
                            </label>
                            <Input
                                type="number"
                                required
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                className="h-12 bg-white/5 border-white/10 font-bold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Booking Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as BookingStatus)}
                                className="w-full h-12 bg-zinc-900 border border-white/10 rounded-xl px-3 font-bold text-sm text-white focus:outline-none focus:border-primary"
                            >
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Status</label>
                            <select
                                value={paymentStatus}
                                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                                className="w-full h-12 bg-zinc-900 border border-white/10 rounded-xl px-3 font-bold text-sm text-white focus:outline-none focus:border-primary"
                            >
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid / Invoice Sent</option>
                                <option value="partial">Partial</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Platform / Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value as PaymentPlatform)}
                                className="w-full h-12 bg-zinc-900 border border-white/10 rounded-xl px-3 font-bold text-sm text-white focus:outline-none focus:border-primary"
                            >
                                <option value="stripe">Stripe (Card)</option>
                                <option value="paypal">PayPal</option>
                                <option value="square">Square Terminal</option>
                                <option value="manual">Bank Transfer / Cash</option>
                                <option value="webhook">Third-Party Gateway</option>
                            </select>
                        </div>
                    </div>

                    {/* Goals & Coach Notes */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                            <Target className="h-3.5 w-3.5 text-primary" /> Trainee Focus & Fitness Goals
                        </label>
                        <Input
                            value={goals}
                            onChange={(e) => setGoals(e.target.value)}
                            placeholder="E.g. Hypertrophy, Lean Conditioning, Athletic Stamina"
                            className="h-12 bg-white/5 border-white/10 font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Operational Coach Notes</label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add private assessment observations, schedule flexibility, physical limitations..."
                            className="min-h-[80px] bg-white/5 border-white/10 rounded-xl p-3 font-medium text-sm"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-14 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs cursor-pointer"
                        >
                            Abort
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 h-14 rounded-xl bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-[0_0_25px_rgba(255,77,0,0.4)]"
                        >
                            {submitting ? "Enrolling..." : "Enroll Trainee Protocol"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
