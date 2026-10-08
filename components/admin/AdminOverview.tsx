"use client";

import { DollarSign, Users, AlertCircle, ArrowUpRight, Plus, CreditCard, MessageSquare, Calendar, Download, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Booking, Payment, Inquiry } from "@/lib/store";

interface AdminOverviewProps {
    stats: {
        totalRevenue: number;
        totalBookings: number;
        confirmedBookings: number;
        paidBookings: number;
        pendingPaymentsCount: number;
        pendingPaymentAmount: number;
        totalInquiries: number;
        newInquiries: number;
        totalTransactions: number;
    };
    bookings: Booking[];
    payments: Payment[];
    inquiries: Inquiry[];
    onOpenNewBooking: () => void;
    onOpenRecordPayment: () => void;
    onSelectTab: (tab: "bookings" | "payments" | "inquiries" | "schedule") => void;
    onSelectBooking: (booking: Booking) => void;
    onExportCSV: () => void;
}

export function AdminOverview({
    stats,
    bookings,
    payments,
    inquiries,
    onOpenNewBooking,
    onOpenRecordPayment,
    onSelectTab,
    onSelectBooking,
    onExportCSV,
}: AdminOverviewProps) {
    return (
        <div className="space-y-10">
            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-zinc-900/60 border border-white/10 rounded-3xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-black uppercase tracking-widest text-white">Live Operational Feed</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">• Webhooks Active</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        onClick={onOpenNewBooking}
                        className="h-11 px-5 rounded-xl bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(255,77,0,0.3)] transition-all cursor-pointer"
                    >
                        <Plus className="h-4 w-4 mr-2" /> New Client Intake
                    </Button>
                    <Button
                        onClick={onOpenRecordPayment}
                        className="h-11 px-5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs cursor-pointer"
                    >
                        <CreditCard className="h-4 w-4 mr-2 text-primary" /> Record Payment
                    </Button>
                    <Button
                        onClick={() => onSelectTab("inquiries")}
                        className="h-11 px-5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs cursor-pointer"
                    >
                        <MessageSquare className="h-4 w-4 mr-2 text-primary" /> Website Leads
                    </Button>
                    <Button
                        onClick={onExportCSV}
                        className="h-11 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-black uppercase tracking-widest text-xs aspect-square p-0 cursor-pointer"
                        title="Export CSV"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue */}
                <div className="p-6 bg-zinc-950 border border-white/10 rounded-[2rem] relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="h-20 w-20 text-primary" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Settled Revenue</span>
                        <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                            {stats.paidBookings} PAID
                        </span>
                    </div>
                    <p className="text-4xl font-black italic tracking-tighter text-white mb-2 leading-none">
                        £{stats.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-400" /> Across Stripe, PayPal & Direct
                    </p>
                </div>

                {/* Trainee Signups */}
                <div className="p-6 bg-zinc-950 border border-white/10 rounded-[2rem] relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="h-20 w-20 text-white" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Signups</span>
                        <span className="text-[10px] font-black bg-white/10 text-white px-2 py-0.5 rounded-full">
                            {stats.confirmedBookings} CONFIRMED
                        </span>
                    </div>
                    <p className="text-4xl font-black italic tracking-tighter text-white mb-2 leading-none">
                        {stats.totalBookings}
                    </p>
                    <button
                        onClick={() => onSelectTab("bookings")}
                        className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
                    >
                        View roster <ArrowUpRight className="h-3 w-3" />
                    </button>
                </div>

                {/* Pending Invoices */}
                <div className="p-6 bg-zinc-950 border border-white/10 rounded-[2rem] relative overflow-hidden group hover:border-yellow-500/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle className="h-20 w-20 text-yellow-500" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Pending Receivables</span>
                        <span className="text-[10px] font-black bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/20">
                            {stats.pendingPaymentsCount} UNPAID
                        </span>
                    </div>
                    <p className="text-4xl font-black italic tracking-tighter text-white mb-2 leading-none">
                        £{stats.pendingPaymentAmount.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="h-3 w-3 text-yellow-500" /> Payment links sent
                    </p>
                </div>

                {/* Leads / Inquiries */}
                <div className="p-6 bg-zinc-950 border border-white/10 rounded-[2rem] relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <MessageSquare className="h-20 w-20 text-primary" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Incoming Leads</span>
                        {stats.newInquiries > 0 ? (
                            <span className="text-[10px] font-black bg-primary text-white px-2 py-0.5 rounded-full animate-pulse">
                                {stats.newInquiries} NEW
                            </span>
                        ) : (
                            <span className="text-[10px] font-black bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">
                                {stats.totalInquiries} TOTAL
                            </span>
                        )}
                    </div>
                    <p className="text-4xl font-black italic tracking-tighter text-white mb-2 leading-none">
                        {stats.totalInquiries}
                    </p>
                    <button
                        onClick={() => onSelectTab("inquiries")}
                        className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
                    >
                        Review inquiries <ArrowUpRight className="h-3 w-3" />
                    </button>
                </div>
            </div>

            {/* Split Feed: Recent Bookings vs Recent Third-Party Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Bookings Roster */}
                <div className="lg:col-span-7 bg-zinc-950 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Operational Roster</span>
                            <h3 className="text-2xl font-black uppercase italic tracking-tight">Recent Client Signups</h3>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => onSelectTab("bookings")}
                            className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white"
                        >
                            View All ({bookings.length})
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {bookings.slice(0, 5).map((booking) => (
                            <div
                                key={booking.id}
                                onClick={() => onSelectBooking(booking)}
                                className="group p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-base italic group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                                        {booking.name.charAt(0)}
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black uppercase italic tracking-tight text-white">{booking.name}</p>
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                booking.paymentStatus === 'paid'
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                            }`}>
                                                {booking.paymentStatus.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-bold">{booking.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 sm:text-right">
                                    <div>
                                        <span className="text-xs font-black text-white italic block">£{booking.price}.00</span>
                                        <span className="text-[10px] text-gray-500 font-bold block uppercase">{booking.package}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 bg-black/40 px-3 py-1 rounded-lg border border-white/5 shrink-0 flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-primary" /> {booking.date}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Payments Ledger */}
                <div className="lg:col-span-5 bg-zinc-950 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Financial Inflow</span>
                            <h3 className="text-2xl font-black uppercase italic tracking-tight">Recent Payments</h3>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => onSelectTab("payments")}
                            className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white"
                        >
                            Ledger ({payments.length})
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {payments.length === 0 ? (
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider py-8 text-center">No payment transactions recorded yet.</p>
                        ) : (
                            payments.slice(0, 5).map((pay) => (
                                <div
                                    key={pay.id}
                                    className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center font-black text-xs uppercase border border-green-500/20 shrink-0">
                                            {pay.platform.slice(0, 3)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase italic">{pay.clientName}</p>
                                            <p className="text-[10px] text-gray-500 font-mono truncate max-w-[140px]">{pay.referenceId}</p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm font-black text-green-400 italic leading-none">+£{pay.amount}.00</p>
                                        <span className="text-[9px] text-gray-500 font-black uppercase tracking-wider block mt-1">
                                            {new Date(pay.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Recent Inquiries Quick Snippet */}
                    <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">Incoming Trainee Signals</span>
                            <button
                                onClick={() => onSelectTab("inquiries")}
                                className="text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-wider"
                            >
                                All ({inquiries.length})
                            </button>
                        </div>
                        {inquiries.slice(0, 2).map((inq) => (
                            <div key={inq.id} className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs mb-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-black uppercase text-white">{inq.name}</span>
                                    <span className="text-[9px] font-bold text-gray-500">{new Date(inq.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-[11px] text-gray-400 truncate">{inq.objective}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
