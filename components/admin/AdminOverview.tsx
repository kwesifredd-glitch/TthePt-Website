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
            <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white border border-slate-200 shadow-sm rounded-3xl">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-950">Live Operational Feed</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">• Webhooks Active</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        onClick={onOpenNewBooking}
                        className="h-11 px-5 rounded-xl bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-md shadow-orange-500/25 transition-all cursor-pointer"
                    >
                        <Plus className="h-4 w-4 mr-2" /> New Client Intake
                    </Button>
                    <Button
                        onClick={onOpenRecordPayment}
                        className="h-11 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-zinc-950 font-black uppercase tracking-widest text-xs shadow-xs cursor-pointer"
                    >
                        <CreditCard className="h-4 w-4 mr-2 text-primary" /> Record Payment
                    </Button>
                    <Button
                        onClick={() => onSelectTab("inquiries")}
                        className="h-11 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-zinc-950 font-black uppercase tracking-widest text-xs shadow-xs cursor-pointer"
                    >
                        <MessageSquare className="h-4 w-4 mr-2 text-primary" /> Website Leads
                    </Button>
                    <Button
                        onClick={onExportCSV}
                        className="h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-zinc-950 font-black uppercase tracking-widest text-xs aspect-square p-0 cursor-pointer shadow-xs"
                        title="Export CSV"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue */}
                <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-[2rem] relative overflow-hidden group hover:border-primary/40 hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-slate-900 pointer-events-none">
                        <DollarSign className="h-20 w-20 text-primary" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Settled Revenue</span>
                        <span className="text-[10px] font-black bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                            {stats.paidBookings} PAID
                        </span>
                    </div>
                    <p className="text-4xl font-black italic tracking-tighter text-zinc-950 mb-2 leading-none">
                        £{stats.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Across Stripe & Direct
                    </p>
                </div>

                {/* Trainee Signups */}
                <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-[2rem] relative overflow-hidden group hover:border-primary/40 hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-slate-900 pointer-events-none">
                        <Users className="h-20 w-20 text-zinc-950" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Signups</span>
                        <span className="text-[10px] font-black bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-full">
                            {stats.confirmedBookings} CONFIRMED
                        </span>
                    </div>
                    <p className="text-4xl font-black italic tracking-tighter text-zinc-950 mb-2 leading-none">
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
                <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-[2rem] relative overflow-hidden group hover:border-amber-400 hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-slate-900 pointer-events-none">
                        <AlertCircle className="h-20 w-20 text-amber-500" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pending Receivables</span>
                        <span className="text-[10px] font-black bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                            {stats.pendingPaymentsCount} UNPAID
                        </span>
                    </div>
                    <p className="text-4xl font-black italic tracking-tighter text-zinc-950 mb-2 leading-none">
                        £{stats.pendingPaymentAmount.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amber-500" /> Payment links sent
                    </p>
                </div>

                {/* Leads / Inquiries */}
                <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-[2rem] relative overflow-hidden group hover:border-primary/40 hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-slate-900 pointer-events-none">
                        <MessageSquare className="h-20 w-20 text-primary" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Incoming Leads</span>
                        {stats.newInquiries > 0 ? (
                            <span className="text-[10px] font-black bg-primary text-white px-2.5 py-0.5 rounded-full animate-pulse">
                                {stats.newInquiries} NEW
                            </span>
                        ) : (
                            <span className="text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full">
                                {stats.totalInquiries} TOTAL
                            </span>
                        )}
                    </div>
                    <p className="text-4xl font-black italic tracking-tighter text-zinc-950 mb-2 leading-none">
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
                <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm rounded-[2.5rem] p-6 sm:p-8 space-y-6 text-slate-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Operational Roster</span>
                            <h3 className="text-2xl font-black uppercase italic tracking-tight text-zinc-950">Recent Client Signups</h3>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => onSelectTab("bookings")}
                            className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-zinc-950 hover:bg-slate-100"
                        >
                            View All ({bookings.length})
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {bookings.slice(0, 5).map((booking) => (
                            <div
                                key={booking.id}
                                onClick={() => onSelectBooking(booking)}
                                className="group p-4 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 hover:border-primary/40 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all cursor-pointer shadow-2xs"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-base italic group-hover:bg-primary group-hover:text-white transition-all shrink-0 border border-primary/20">
                                        {booking.name.charAt(0)}
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black uppercase italic tracking-tight text-zinc-950">{booking.name}</p>
                                            <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                                booking.paymentStatus === 'paid'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                            }`}>
                                                {booking.paymentStatus.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-bold">{booking.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 sm:text-right">
                                    <div>
                                        <span className="text-xs font-black text-zinc-950 italic block">£{booking.price}.00</span>
                                        <span className="text-[10px] text-slate-400 font-bold block uppercase">{booking.package}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 shrink-0 flex items-center gap-1 shadow-2xs">
                                        <Calendar className="h-3 w-3 text-primary" /> {booking.date}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Payments Ledger */}
                <div className="lg:col-span-5 bg-white border border-slate-200 shadow-sm rounded-[2.5rem] p-6 sm:p-8 space-y-6 text-slate-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Financial Inflow</span>
                            <h3 className="text-2xl font-black uppercase italic tracking-tight text-zinc-950">Recent Payments</h3>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => onSelectTab("payments")}
                            className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-zinc-950 hover:bg-slate-100"
                        >
                            Ledger ({payments.length})
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {payments.length === 0 ? (
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider py-8 text-center">No payment transactions recorded yet.</p>
                        ) : (
                            payments.slice(0, 5).map((pay) => (
                                <div
                                    key={pay.id}
                                    className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-2xs"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs uppercase border border-emerald-200 shrink-0">
                                            {pay.platform.slice(0, 3)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-zinc-950 uppercase italic">{pay.clientName}</p>
                                            <p className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">{pay.referenceId}</p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm font-black text-emerald-600 italic leading-none">+£{pay.amount}.00</p>
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mt-1">
                                            {new Date(pay.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Recent Inquiries Quick Snippet */}
                    <div className="pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">Incoming Trainee Signals</span>
                            <button
                                onClick={() => onSelectTab("inquiries")}
                                className="text-[10px] font-black text-slate-500 hover:text-zinc-950 uppercase tracking-wider"
                            >
                                All ({inquiries.length})
                            </button>
                        </div>
                        {inquiries.slice(0, 2).map((inq) => (
                            <div key={inq.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-black uppercase text-zinc-950">{inq.name}</span>
                                    <span className="text-[9px] font-bold text-slate-400">{new Date(inq.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 truncate">{inq.objective}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
