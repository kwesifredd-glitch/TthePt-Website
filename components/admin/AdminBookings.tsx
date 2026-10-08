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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-white border border-slate-200 shadow-sm rounded-3xl text-slate-900">
                <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight text-zinc-950">Client Protocols & Signups</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Manage trainee sessions, assign packages, and track billing synchronization.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <Button
                        onClick={onOpenNewBooking}
                        className="h-11 px-5 rounded-xl bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-md shadow-orange-500/25 transition-all cursor-pointer"
                    >
                        <Plus className="h-4 w-4 mr-2" /> New Client Intake
                    </Button>
                    <Button
                        onClick={onExportCSV}
                        className="h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-zinc-950 font-black uppercase tracking-widest text-xs cursor-pointer flex items-center gap-2 shadow-xs"
                    >
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search trainees by name, email, package or phone..."
                        className="h-12 pl-11 bg-white border-slate-300 rounded-xl font-bold text-sm text-zinc-950 placeholder:text-slate-400 shadow-xs focus:border-primary"
                    />
                </div>

                <div className="sm:col-span-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-12 bg-white border border-slate-300 rounded-xl px-4 font-bold text-xs uppercase tracking-wider text-zinc-950 focus:outline-none focus:border-primary shadow-xs"
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
                        className="w-full h-12 bg-white border border-slate-300 rounded-xl px-4 font-bold text-xs uppercase tracking-wider text-zinc-950 focus:outline-none focus:border-primary shadow-xs"
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
                <div className="text-center py-24 bg-white border border-slate-200 shadow-sm rounded-3xl">
                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-zinc-950 mb-1">No Matching Protocols Found</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Try adjusting your search criteria or enroll a new client.</p>
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
                                className="group p-5 sm:p-6 bg-white border border-slate-200 hover:border-primary/40 rounded-2xl transition-all space-y-4 shadow-sm text-slate-900"
                            >
                                {/* Upper Tier: Client Identification & Action Controls */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
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
                                                    className="font-black uppercase italic tracking-tight text-zinc-950 hover:text-primary transition-colors cursor-pointer text-base truncate"
                                                >
                                                    {b.name}
                                                </h4>
                                                {b.source === "external_checkout" && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full shrink-0">
                                                        Third-Party
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 font-bold truncate">
                                                {b.email} {b.phone ? `• ${b.phone}` : ""}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Selector & Protocol Actions */}
                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 flex-wrap">
                                        <select
                                            value={b.status}
                                            onChange={(e) => onQuickUpdateStatus(b.id, e.target.value as BookingStatus)}
                                            className={`h-9 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wider focus:outline-none cursor-pointer transition-colors shadow-2xs ${
                                                b.status === "confirmed"
                                                    ? "bg-orange-50 border-orange-200 text-orange-700"
                                                    : b.status === "completed"
                                                    ? "bg-blue-50 border-blue-200 text-blue-700"
                                                    : b.status === "cancelled"
                                                    ? "bg-rose-50 border-rose-200 text-rose-700"
                                                    : "bg-slate-50 border-slate-300 text-slate-700"
                                            }`}
                                        >
                                            <option value="confirmed">Confirmed</option>
                                            <option value="pending">Pending</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>

                                        <Button
                                            onClick={() => onCopyLink(b.id)}
                                            className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-zinc-950 text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-2xs"
                                            title="Copy Checkout Link"
                                        >
                                            <Copy className="h-3.5 w-3.5 mr-1 text-primary" /> Link
                                        </Button>

                                        <Button
                                            onClick={() => onSelectBooking(b)}
                                            className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-zinc-950 text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-2xs"
                                        >
                                            Dossier
                                        </Button>

                                        <button
                                            onClick={() => onDeleteBooking(b.id, b.name)}
                                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                                            Selected Package
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xs font-black uppercase text-primary truncate max-w-[180px]" title={b.package}>
                                                {b.package || "Single Session"}
                                            </span>
                                            <span className="text-xs font-black text-zinc-950 italic shrink-0">
                                                £{b.price}.00
                                            </span>
                                        </div>
                                    </div>

                                    {/* Operational Schedule */}
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                                            Operational Schedule
                                        </span>
                                        <div className="flex items-center gap-3 text-xs font-black text-slate-700">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" /> {b.date}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="flex items-center gap-1.5 text-slate-500 font-bold">
                                                <Clock className="h-3.5 w-3.5 text-primary shrink-0" /> {b.time} BST
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment Settlement Status */}
                                    <div className="sm:text-right flex flex-col sm:items-end">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                                            Payment Status
                                        </span>
                                        {b.paymentStatus === "paid" ? (
                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                <span>Paid ({cleanPaymentMethod})</span>
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => onQuickMarkPaid(b)}
                                                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all cursor-pointer w-fit shadow-2xs"
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
