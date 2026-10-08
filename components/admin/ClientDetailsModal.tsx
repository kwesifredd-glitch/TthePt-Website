"use client";

import { useState } from "react";
import { X, Calendar, Clock, Target, Copy, ExternalLink, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Booking, BookingStatus, PaymentStatus } from "@/lib/store";

interface ClientDetailsModalProps {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedBooking: Booking, message: string) => void;
    onDelete: (id: string, message: string) => void;
}

export function ClientDetailsModal({ booking, isOpen, onClose, onUpdate, onDelete }: ClientDetailsModalProps) {
    const [notes, setNotes] = useState(booking?.notes || "");
    const [status, setStatus] = useState<BookingStatus>(booking?.status || "confirmed");
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(booking?.paymentStatus || "unpaid");
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!isOpen || !booking) return null;

    const checkoutUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/checkout/${booking.id}`
        : `/checkout/${booking.id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(checkoutUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: booking.id,
                    notes,
                    status,
                    paymentStatus
                })
            });

            const data = await res.json();
            if (data.success) {
                onUpdate(data.booking, `Updated protocol dossier for ${booking.name}`);
                onClose();
            } else {
                alert(data.error || "Failed to update record.");
            }
        } catch (e) {
            console.error(e);
            alert("Network error.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteBooking = async () => {
        if (!confirm(`Are you sure you want to permanently delete ${booking.name}'s protocol?`)) return;
        try {
            const res = await fetch(`/api/admin/bookings?id=${booking.id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                onDelete(booking.id, `Protocol for ${booking.name} purged from database.`);
                onClose();
            }
        } catch (e) {
            console.error(e);
            alert("Failed to delete booking.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-10 relative text-white">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl italic border border-primary/20 shrink-0">
                        {booking.name.charAt(0)}
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-primary border border-white/10 mb-2">
                            Dossier Ref: {booking.id.slice(0, 8)}
                        </div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tight">{booking.name}</h2>
                        <p className="text-xs text-gray-400 font-bold">{booking.email} {booking.phone ? `• ${booking.phone}` : ''}</p>
                    </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 mb-6">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1">Package</span>
                        <span className="text-xs font-black uppercase text-primary block truncate">{booking.package || 'Single Session'}</span>
                    </div>
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1">Amount</span>
                        <span className="text-sm font-black text-white italic block">£{booking.price}.00</span>
                    </div>
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1">Session Date</span>
                        <span className="text-xs font-black uppercase text-white block flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-primary" /> {booking.date}
                        </span>
                    </div>
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1">Time Slot</span>
                        <span className="text-xs font-black uppercase text-white block flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary" /> {booking.time} BST
                        </span>
                    </div>
                </div>

                {/* Status Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Protocol Status</label>
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
                            <option value="unpaid">Unpaid</option>
                            <option value="partial">Partial</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                </div>

                {/* Payment Reference Details if any */}
                {booking.paymentRef && (
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary block">Transaction Reference</span>
                            <span className="text-xs font-mono font-bold text-white">{booking.paymentRef}</span>
                            {booking.paidAt && (
                                <span className="text-[9px] text-gray-400 block mt-0.5">Paid: {new Date(booking.paidAt).toLocaleString()}</span>
                            )}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-primary text-white rounded-full">
                            {booking.paymentMethod || 'Third-Party Platform'}
                        </div>
                    </div>
                )}

                {/* Client Payment Checkout Link */}
                <div className="space-y-2 mb-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center justify-between">
                        <span>Payment & Invoicing Gateway Link</span>
                        <a href={`/checkout/${booking.id}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-[9px]">
                            Open Gateway <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                    </label>
                    <div className="flex gap-2">
                        <input
                            readOnly
                            value={checkoutUrl}
                            className="flex-1 h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-xs font-mono text-gray-400"
                        />
                        <Button
                            type="button"
                            onClick={handleCopyLink}
                            className="h-11 px-4 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black font-black uppercase tracking-widest text-xs transition-colors shrink-0"
                        >
                            {copied ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                            <span className="ml-1.5">{copied ? "Copied" : "Copy"}</span>
                        </Button>
                    </div>
                </div>

                {/* Goals */}
                {booking.goals && (
                    <div className="space-y-1 mb-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                            <Target className="h-3 w-3" /> Trainee Focus & Objectives
                        </label>
                        <p className="text-xs text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5">{booking.goals}</p>
                    </div>
                )}

                {/* Coach Notes */}
                <div className="space-y-2 mb-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Operational Coach Notes</label>
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Log trainee progress, session notes, physical assessment..."
                        className="min-h-[100px] bg-white/5 border-white/10 rounded-xl p-3 text-sm font-medium"
                    />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/10">
                    <Button
                        type="button"
                        onClick={handleDeleteBooking}
                        className="w-full sm:w-auto h-12 border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-xs rounded-xl cursor-pointer"
                    >
                        <Trash2 className="h-4 w-4 mr-2" /> Purge Protocol
                    </Button>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-initial h-12 px-6 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs cursor-pointer"
                        >
                            Close
                        </Button>
                        <Button
                            type="button"
                            disabled={saving}
                            onClick={handleSaveChanges}
                            className="flex-1 sm:flex-initial h-12 px-6 rounded-xl bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(255,77,0,0.3)]"
                        >
                            {saving ? "Saving..." : "Save Dossier"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
