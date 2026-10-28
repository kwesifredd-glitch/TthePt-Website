"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Lock,
    LayoutDashboard,
    Calendar,
    CreditCard,
    MessageSquare,
    Clock,
    LogOut,
    RefreshCw,
    Shield,
    ExternalLink
} from "lucide-react";
import { Booking, Payment, Inquiry, BookingStatus } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ToastContainer, ToastMessage } from "@/components/admin/Toast";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminBookings } from "@/components/admin/AdminBookings";
import { AdminPayments } from "@/components/admin/AdminPayments";
import { AdminInquiries } from "@/components/admin/AdminInquiries";
import { AdminSchedule } from "@/components/admin/AdminSchedule";
import { NewBookingModal } from "@/components/admin/NewBookingModal";
import { RecordPaymentModal } from "@/components/admin/RecordPaymentModal";
import { ClientDetailsModal } from "@/components/admin/ClientDetailsModal";

type AdminTab = "overview" | "bookings" | "payments" | "inquiries" | "schedule";

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [activeTab, setActiveTab] = useState<AdminTab>("overview");

    // Data State
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);

    const [availableHours, setAvailableHours] = useState<string[]>([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        confirmedBookings: 0,
        paidBookings: 0,
        pendingPaymentsCount: 0,
        pendingPaymentAmount: 0,
        totalInquiries: 0,
        newInquiries: 0,
        totalTransactions: 0
    });
    const [loading, setLoading] = useState(false);

    // Modals
    const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
    const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
    const [selectedBookingForModal, setSelectedBookingForModal] = useState<Booking | null>(null);
    const [bookingPrefill, setBookingPrefill] = useState<{ name?: string; email?: string; phone?: string; objective?: string } | undefined>(undefined);

    // Toasts
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (text: string, type: "success" | "error" | "info" = "success") => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        setToasts((prev) => [...prev, { id, text, type }]);
    };

    const dismissToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [bRes, pRes, iRes, sRes] = await Promise.all([
                fetch("/api/admin/bookings").then((r) => r.json()),
                fetch("/api/admin/payments").then((r) => r.json()),
                fetch("/api/admin/inquiries").then((r) => r.json()),
                fetch("/api/admin/settings").then((r) => r.json())
            ]);

            if (bRes.bookings) setBookings(bRes.bookings);
            if (bRes.stats) setStats(bRes.stats);
            if (pRes.payments) setPayments(pRes.payments);
            if (iRes.inquiries) setInquiries(iRes.inquiries);

            if (sRes.settings?.availableHours) setAvailableHours(sRes.settings.availableHours);
        } catch (error) {
            console.error("Failed to load admin intelligence data", error);
            addToast("Failed to synchronize database records.", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch("/api/auth")
            .then((r) => r.json())
            .then((data) => setIsAuthenticated(Boolean(data.authenticated)))
            .catch(() => setIsAuthenticated(false));
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAllData();
        }
    }, [isAuthenticated, fetchAllData]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password })
            });
            if (res.ok) {
                setPassword("");
                setIsAuthenticated(true);
                addToast("Command Center connection established.", "success");
            } else {
                addToast("Authentication rejected. Invalid protocol key.", "error");
            }
        } catch {
            addToast("Login service unavailable. Try again.", "error");
        }
    };

    const handleLogout = async () => {
        await fetch("/api/auth", { method: "DELETE" }).catch(() => {});
        setIsAuthenticated(false);
    };

    // Quick Update Booking Status
    const handleQuickUpdateStatus = async (id: string, status: BookingStatus) => {
        try {
            const res = await fetch("/api/admin/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status })
            });
            const data = await res.json();
            if (data.success) {
                setBookings((prev) => prev.map((b) => (b.id === id ? data.booking : b)));
                if (data.stats) setStats(data.stats);
                addToast(`Protocol status set to ${status.toUpperCase()}`);
            }
        } catch (err) {
            console.error(err);
            addToast("Failed to update status", "error");
        }
    };

    // Quick Mark as Paid
    const handleQuickMarkPaid = async (booking: Booking) => {
        try {
            const res = await fetch("/api/admin/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: booking.id,
                    paymentStatus: "paid",
                    paymentMethod: "manual"
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchAllData();
                addToast(`Marked £${booking.price} as settled for ${booking.name}`);
            }
        } catch (err) {
            console.error(err);
            addToast("Failed to mark as paid", "error");
        }
    };

    // Delete Booking
    const handleDeleteBooking = async (id: string, name: string) => {
        if (!confirm(`Confirm purging protocol for ${name}?`)) return;
        try {
            const res = await fetch(`/api/admin/bookings?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setBookings((prev) => prev.filter((b) => b.id !== id));
                if (data.stats) setStats(data.stats);
                addToast(`Purged ${name} from roster.`);
            }
        } catch (err) {
            console.error(err);
            addToast("Failed to delete booking", "error");
        }
    };

    // Refund Payment
    const handleRefundPayment = async (id: string, clientName: string) => {
        if (!confirm(`Initiate refund record for transaction ${id} (${clientName})?`)) return;
        try {
            const res = await fetch("/api/admin/payments", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: "refunded" })
            });
            const data = await res.json();
            if (data.success) {
                fetchAllData();
                addToast(`Transaction ${id} marked as refunded.`);
            }
        } catch (err) {
            console.error(err);
            addToast("Failed to refund payment", "error");
        }
    };

    // Inquiry Updates
    const handleUpdateInquiryStatus = async (id: string, status: Inquiry["status"]) => {
        try {
            const res = await fetch("/api/admin/inquiries", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status })
            });
            const data = await res.json();
            if (data.success) {
                setInquiries((prev) => prev.map((inq) => (inq.id === id ? data.inquiry : inq)));
                addToast(`Lead marked as ${status.toUpperCase()}`);
            }
        } catch (err) {
            console.error(err);
            addToast("Failed to update inquiry", "error");
        }
    };

    const handleDeleteInquiry = async (id: string, name: string) => {
        if (!confirm(`Purge lead from ${name}?`)) return;
        try {
            const res = await fetch(`/api/admin/inquiries?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                setInquiries((prev) => prev.filter((inq) => inq.id !== id));
                addToast(`Purged lead from ${name}`);
            }
        } catch (err) {
            console.error(err);
            addToast("Failed to delete inquiry", "error");
        }
    };

    // Convert Lead to Booking
    const handleConvertToBooking = (inquiry: Inquiry) => {
        setBookingPrefill({
            name: inquiry.name,
            email: inquiry.email,
            phone: inquiry.phone,
            objective: inquiry.objective
        });
        setIsNewBookingOpen(true);
    };

    // Copy Payment Link
    const handleCopyLink = (bookingId: string) => {
        const url = `${window.location.origin}/checkout/${bookingId}`;
        navigator.clipboard.writeText(url);
        addToast("Payment checkout link copied to clipboard!");
    };

    // CSV Export
    const handleExportCSV = () => {
        if (activeTab === "payments") {
            const headers = "ID,Date,Client,Email,Amount,Currency,Platform,ReferenceID,Status\n";
            const rows = payments
                .map(
                    (p) =>
                        `"${p.id}","${p.createdAt}","${p.clientName}","${p.clientEmail}",${p.amount},"${p.currency}","${p.platform}","${p.referenceId}","${p.status}"`
                )
                .join("\n");
            const blob = new Blob([headers + rows], { type: "text/csv" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `tthept-payments-${Date.now()}.csv`;
            link.click();
            addToast("Payments ledger exported to CSV.");
        } else {
            const headers = "ID,Date,Time,Client,Email,Phone,Package,Price,Currency,Status,PaymentStatus,PaymentMethod,PaymentRef,CreatedAt\n";
            const rows = bookings
                .map(
                    (b) =>
                        `"${b.id}","${b.date}","${b.time}","${b.name}","${b.email}","${b.phone || ""}","${b.package || ""}",${b.price || 30},"${b.currency || "GBP"}","${b.status}","${b.paymentStatus}","${b.paymentMethod || ""}","${b.paymentRef || ""}","${b.createdAt}"`
                )
                .join("\n");
            const blob = new Blob([headers + rows], { type: "text/csv" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `tthept-signups-${Date.now()}.csv`;
            link.click();
            addToast("Client signups exported to CSV.");
        }
    };

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 relative overflow-hidden text-slate-900 selection:bg-primary selection:text-white">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[130px] rounded-full pointer-events-none"></div>

                <Card className="w-full max-w-md bg-white border-slate-200 relative z-10 shadow-xl p-2 rounded-[2.5rem]">
                    <CardHeader className="text-center pb-8 pt-8">
                        <div className="mx-auto bg-primary/10 p-5 rounded-3xl w-fit mb-4 border border-primary/20 shadow-md shadow-orange-500/10">
                            <Lock className="h-10 w-10 text-primary" />
                        </div>
                        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mx-auto mb-2 border border-slate-200">
                            <Shield className="h-3 w-3 text-primary" /> Level 4 Clearance
                        </div>
                        <CardTitle className="text-3xl font-black uppercase italic tracking-tighter text-zinc-950">System Access</CardTitle>
                        <CardDescription className="text-slate-500 font-medium text-xs mt-1">Authentication required for command & billing portal.</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-8">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Protocol Key</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-14 bg-slate-50 border-slate-300 rounded-2xl focus:ring-primary focus:border-primary font-bold placeholder:text-slate-300 text-center text-2xl tracking-[0.4em] text-zinc-950"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-14 rounded-2xl bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-orange-500/25"
                            >
                                Establish Connection
                            </Button>
                        </form>
                        <p className="text-[10px] text-center text-slate-400 mt-6 font-mono font-bold uppercase tracking-widest">
                            Encrypted 256-Bit SSL Gateway
                        </p>
                    </CardContent>
                </Card>

                <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            </div>
        );
    }

    const navigationItems: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }> = [
        { id: "overview", label: "Command Center", icon: LayoutDashboard },
        { id: "bookings", label: "Client Signups", icon: Calendar, badge: stats.totalBookings },
        { id: "payments", label: "Payments Ledger", icon: CreditCard, badge: stats.totalTransactions },
        { id: "inquiries", label: "Website Leads", icon: MessageSquare, badge: stats.newInquiries || undefined },
        { id: "schedule", label: "Daily Schedule", icon: Clock },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-primary selection:text-white">
            {/* Dedicated Light Admin Header */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
                <div className="container-custom py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="group flex items-center gap-2">
                            <span className="text-2xl font-black italic tracking-tighter text-zinc-950 group-hover:text-primary transition-colors">
                                TTHE<span className="text-primary not-italic">PT</span>
                            </span>
                        </Link>
                        <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                            Staff Operations Portal
                        </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            href="/"
                            target="_blank"
                            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-zinc-950 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                        >
                            <span>Live Website</span>
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                        <Button
                            onClick={fetchAllData}
                            disabled={loading}
                            className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                            <span>Sync</span>
                        </Button>
                        <Button
                            onClick={handleLogout}
                            className="h-9 px-3.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 font-bold uppercase tracking-wider text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                        >
                            <LogOut className="h-3.5 w-3.5 text-primary" />
                            <span>Disconnect</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 py-10 sm:py-12">
                <div className="container-custom">
                    {/* Top Executive Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-200 pb-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-3 border border-primary/20">
                                <LayoutDashboard className="h-3 w-3" />
                                Central Intelligence Portal
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-zinc-950">
                                Tactical <span className="text-primary not-italic">Command & Finance</span>
                            </h1>
                            <p className="text-slate-500 text-xs font-medium mt-1">
                                Operations console for trainee signups, payments ledger, and schedule management.
                            </p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        {/* Sidebar Navigation */}
                        <aside className="lg:col-span-3 space-y-2 sticky top-24 z-20">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-black uppercase tracking-wider text-xs border text-left cursor-pointer",
                                            isActive
                                                ? "bg-primary border-primary text-white shadow-md shadow-orange-500/25 scale-[1.02]"
                                                : "bg-white border-slate-200 text-slate-700 hover:text-zinc-950 hover:bg-slate-100 shadow-xs"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                        </div>
                                        {item.badge !== undefined && item.badge > 0 && (
                                            <span
                                                className={cn(
                                                    "text-[9px] font-black px-2 py-0.5 rounded-full",
                                                    isActive ? "bg-black/25 text-white" : "bg-primary/10 text-primary"
                                                )}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </aside>

                        {/* Main View Area */}
                        <div className="lg:col-span-9 min-h-[600px]">
                            {activeTab === "overview" && (
                                <AdminOverview
                                    stats={stats}
                                    bookings={bookings}
                                    payments={payments}
                                    inquiries={inquiries}
                                    onOpenNewBooking={() => {
                                        setBookingPrefill(undefined);
                                        setIsNewBookingOpen(true);
                                    }}
                                    onOpenRecordPayment={() => setIsRecordPaymentOpen(true)}
                                    onSelectTab={(tab) => setActiveTab(tab)}
                                    onSelectBooking={(b) => setSelectedBookingForModal(b)}
                                    onExportCSV={handleExportCSV}
                                />
                            )}

                            {activeTab === "bookings" && (
                                <AdminBookings
                                    bookings={bookings}
                                    onOpenNewBooking={() => {
                                        setBookingPrefill(undefined);
                                        setIsNewBookingOpen(true);
                                    }}
                                    onSelectBooking={(b) => setSelectedBookingForModal(b)}
                                    onQuickUpdateStatus={handleQuickUpdateStatus}
                                    onQuickMarkPaid={handleQuickMarkPaid}
                                    onDeleteBooking={handleDeleteBooking}
                                    onExportCSV={handleExportCSV}
                                    onCopyLink={handleCopyLink}
                                />
                            )}

                            {activeTab === "payments" && (
                                <AdminPayments
                                    payments={payments}
                                    onOpenRecordPayment={() => setIsRecordPaymentOpen(true)}
                                    onRefundPayment={handleRefundPayment}
                                    onExportCSV={handleExportCSV}
                                />
                            )}

                            {activeTab === "inquiries" && (
                                <AdminInquiries
                                    inquiries={inquiries}
                                    onConvertToBooking={handleConvertToBooking}
                                    onUpdateStatus={handleUpdateInquiryStatus}
                                    onDeleteInquiry={handleDeleteInquiry}
                                />
                            )}

                            {activeTab === "schedule" && (
                                <AdminSchedule
                                    availableHours={availableHours}
                                    onSave={(h) => setAvailableHours(h)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <NewBookingModal
                isOpen={isNewBookingOpen}
                onClose={() => setIsNewBookingOpen(false)}
                prefill={bookingPrefill}
                onSuccess={(msg) => {
                    fetchAllData();
                    addToast(msg);
                }}
            />

            <RecordPaymentModal
                isOpen={isRecordPaymentOpen}
                onClose={() => setIsRecordPaymentOpen(false)}
                bookings={bookings}
                onSuccess={(msg) => {
                    fetchAllData();
                    addToast(msg);
                }}
            />

            <ClientDetailsModal
                booking={selectedBookingForModal}
                isOpen={!!selectedBookingForModal}
                onClose={() => setSelectedBookingForModal(null)}
                onUpdate={(b, msg) => {
                    setBookings((prev) => prev.map((item) => (item.id === b.id ? b : item)));
                    addToast(msg);
                }}
                onDelete={(id, msg) => {
                    setBookings((prev) => prev.filter((item) => item.id !== id));
                    addToast(msg);
                }}
            />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs font-medium text-slate-500">
                <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p>© {new Date().getFullYear()} TthePT Performance. Staff Operations Portal.</p>
                    <p className="font-mono text-[11px] text-slate-400">Encrypted 256-Bit SSL Session • Operations v2.4</p>
                </div>
            </footer>
        </div>
    );
}
