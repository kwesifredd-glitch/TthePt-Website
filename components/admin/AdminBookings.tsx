"use client";

import { useState } from "react";
import { Search, Plus, Calendar, Clock, DollarSign, CheckCircle2, AlertCircle, Copy, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Booking, BookingStatus } from "@/lib/store";

interface AdminBookingsProps {
    bookings: Booking[];
    onOpenNewBooking: () => void;
    onSelectBooking: (booking: Booking) => void;
    onQuickUpdateStatus: (id: string, status: BookingStatus) => void;
    onQuickMarkPaid: (booking: Booking) => void;
    onDeleteBooking: (id: string, name: string) => void;
    onExportCSV: () => void;
    onCopyLink: (id: string) => void;
}

export function AdminBookings({
    bookings,
    onOpenNewBooking,
    onSelectBooking,
    onQuickUpdateStatus,
    onQuickMarkPaid,
    onDeleteBooking,
    onExportCSV,
    onCopyLink
}: AdminBookingsProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [paymentFilter, setPaymentFilter] = useState<string>("all");

    const filtered = bookings.filter((b) => {
        const matchesSearch =
            b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.email.toLowerCase().includes(search.toLowerCase()) ||
            (b.package && b.package.toLowerCase().includes(search.toLowerCase())) ||
            (b.phone && b.phone.includes(search));

        const matchesStatus = statusFilter === "all" || b.status === statusFilter;
        const matchesPayment = paymentFilter === "all" || b.paymentStatus === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
    });

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-zinc-950 border border-white/10 rounded-3xl">
                <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight">Client Protocols & Signups</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Manage trainee sessions, assign packages, and track billing synchronization.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <Button
                        onClick={onOpenNewBooking}
                        className="h-11 px-5 rounded-xl bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(255,77,0,0.3)] transition-all cursor-pointer"
                    >
                        <Plus className="h-4 w-4 mr-2" /> New Client Intake
                    </Button>
                    <Button
                        onClick={onExportCSV}
                        className="h-11 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs cursor-pointer flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search trainees by name, email, package or phone..."
                        className="h-12 pl-11 bg-zinc-950 border-white/10 rounded-xl font-bold text-sm text-white placeholder:text-gray-600"
                    />
                </div>

                <div className="sm:col-span-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-12 bg-zinc-950 border border-white/10 rounded-xl px-4 font-bold text-xs uppercase tracking-wider text-white focus:outline-none focus:border-primary"
                    >
                        <option value="all">Protocol Status: All</option>
                        <option value="confirmed">Confirmed Only</option>
                        <option value="pending">Pending Only</option>
                        <option value="completed">Completed Only</option>
                        <option value="cancelled">Cancelled Only</option>
                    </select>
                </div>

                <div className="sm:col-span-3">
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="w-full h-12 bg-zinc-950 border border-white/10 rounded-xl px-4 font-bold text-xs uppercase tracking-wider text-white focus:outline-none focus:border-primary"
                    >
                        <option value="all">Payment: All</option>
                        <option value="paid">Paid Only</option>
                        <option value="unpaid">Unpaid / Invoiced Only</option>
                        <option value="refunded">Refunded Only</option>
                    </select>
                </div>
            </div>

            {/* Bookings List */}
            {filtered.length === 0 ? (
                <div className="text-center py-24 bg-zinc-950 border border-white/10 rounded-3xl">
                    <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white mb-1">No Matching Protocols Found</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Try adjusting your search criteria or enroll a new client.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((b) => {
                        const cleanPaymentMethod = b.paymentMethod
                            ? b.paymentMethod.replace(/Live Webhook/i, "").trim()
                            : "Settled";

                        return (
                            <div
                                key={b.id}
                                className="group p-5 sm:p-6 bg-zinc-950 border border-white/10 hover:border-primary/40 rounded-2xl transition-all space-y-4 shadow-sm"
                            >
                                {/* Upper Tier: Client Identification & Action Controls */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                                    {/* Client Identity */}
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div
                                            onClick={() => onSelectBooking(b)}
                                            className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg italic border border-primary/20 cursor-pointer group-hover:bg-primary group-hover:text-white transition-all shrink-0"
                                        >
                                            {b.name.charAt(0)}
                                        </div>
                                        <div className="space-y-0.5 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4
                                                    onClick={() => onSelectBooking(b)}
                                                    className="font-black uppercase italic tracking-tight text-white hover:text-primary transition-colors cursor-pointer text-base truncate"
                                                >
                                                    {b.name}
                                                </h4>
                                                {b.source === "external_checkout" && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-full shrink-0">
                                                        Third-Party
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 font-bold truncate">
                                                {b.email} {b.phone ? `• ${b.phone}` : ""}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Selector & Protocol Actions */}
                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 flex-wrap">
                                        <select
                                            value={b.status}
                                            onChange={(e) => onQuickUpdateStatus(b.id, e.target.value as BookingStatus)}
                                            className={`h-9 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wider focus:outline-none cursor-pointer transition-colors ${
                                                b.status === "confirmed"
                                                    ? "bg-primary/10 border-primary/40 text-primary"
                                                    : b.status === "completed"
                                                    ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                                                    : b.status === "cancelled"
                                                    ? "bg-red-500/10 border-red-500/40 text-red-400"
                                                    : "bg-zinc-900 border-white/10 text-gray-400"
                                            }`}
                                        >
                                            <option value="confirmed">Confirmed</option>
                                            <option value="pending">Pending</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>

                                        <Button
                                            onClick={() => onCopyLink(b.id)}
                                            className="h-9 px-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] font-black uppercase tracking-wider cursor-pointer"
                                            title="Copy Checkout Link"
                                        >
                                            <Copy className="h-3.5 w-3.5 mr-1 text-primary" /> Link
                                        </Button>

                                        <Button
                                            onClick={() => onSelectBooking(b)}
                                            className="h-9 px-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer"
                                        >
                                            Dossier
                                        </Button>

                                        <button
                                            onClick={() => onDeleteBooking(b.id, b.name)}
                                            className="p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                            title="Delete Protocol"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Lower Tier: Protocol Specifications, Schedule & Payment Status */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                                    {/* Package & Tier */}
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                                            Selected Package
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xs font-black uppercase text-primary truncate max-w-[180px]" title={b.package}>
                                                {b.package || "Single Session"}
                                            </span>
                                            <span className="text-xs font-black text-white italic shrink-0">
                                                £{b.price}.00
                                            </span>
                                        </div>
                                    </div>

                                    {/* Operational Schedule */}
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                                            Operational Schedule
                                        </span>
                                        <div className="flex items-center gap-3 text-xs font-black text-gray-300">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" /> {b.date}
                                            </span>
                                            <span className="text-gray-500">•</span>
                                            <span className="flex items-center gap-1.5 text-gray-400 font-bold">
                                                <Clock className="h-3.5 w-3.5 text-primary shrink-0" /> {b.time} BST
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment Settlement Status */}
                                    <div className="sm:text-right flex flex-col sm:items-end">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                                            Payment Status
                                        </span>
                                        {b.paymentStatus === "paid" ? (
                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 w-fit">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                                                <span>Paid ({cleanPaymentMethod})</span>
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => onQuickMarkPaid(b)}
                                                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all cursor-pointer w-fit"
                                                title="Click to mark as paid"
                                            >
                                                <DollarSign className="h-3.5 w-3.5 shrink-0" />
                                                <span>Mark Paid</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
