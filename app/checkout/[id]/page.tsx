"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, ShieldCheck, CheckCircle2, Zap, CreditCard, Calendar, Clock, AlertCircle } from "lucide-react";
import { Booking } from "@/lib/store";
import { stripeCheckoutUrl } from "@/lib/payment-links";

function CheckoutContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);
    const [paidSuccess, setPaidSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"paystack" | "stripe">("paystack");

    const refParam = searchParams.get("reference");
    const paystackParam = searchParams.get("paystack");

    useEffect(() => {
        if (!bookingId) return;

        // Check if returning from a Paystack redirect
        if (refParam && paystackParam) {
            fetch(`/api/paystack/verify?reference=${encodeURIComponent(refParam)}&bookingId=${bookingId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.paid) {
                        setPaidSuccess(true);
                    }
                })
                .catch(err => console.error("Paystack verification error", err));
        }

        fetch(`/api/bookings/${encodeURIComponent(bookingId)}`)
            .then(res => res.json())
            .then(data => {
                const found: Booking | undefined = data.booking;
                if (found) {
                    setBooking(found);
                    if (found.paymentStatus === 'paid') {
                        setPaidSuccess(true);
                    }
                } else {
                    setError("Booking protocol not found or link has expired.");
                }
            })
            .catch(err => {
                console.error(err);
                setError("Failed to retrieve protocol details.");
            })
            .finally(() => setLoading(false));
    }, [bookingId, refParam, paystackParam]);

    const handlePayNow = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!booking) return;
        setProcessing(true);

        try {
            if (paymentMethod === "paystack") {
                const res = await fetch("/api/paystack/initialize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        bookingId: booking.id,
                        email: booking.email,
                        name: booking.name,
                        amount: booking.price || 30,
                        currency: booking.currency || "GBP",
                        package: booking.package
                    })
                });

                const result = await res.json();

                if (result.success) {
                    if (result.authorizationUrl) {
                        window.location.href = result.authorizationUrl;
                        return;
                    } else {
                        // Instant sandbox completion
                        setPaidSuccess(true);
                    }
                } else {
                    alert(result.error || "Paystack authorization failed.");
                }
            } else {
                const stripeUrl = stripeCheckoutUrl(booking.package, booking.email, booking.id);
                if (stripeUrl) {
                    window.location.href = stripeUrl;
                    return;
                }
                alert("Card payment isn't available for this package yet. Please choose Paystack or contact your coach.");
            }
        } catch (err) {
            console.error(err);
            alert("A transmission error occurred while processing payment.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Establishing Secure Gateway...</p>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-6 text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-3xl font-black uppercase italic mb-2">Access Link Invalid</h1>
                <p className="text-gray-400 max-w-md mb-8">{error || "This checkout invoice is no longer valid."}</p>
                <Button onClick={() => router.push("/")} className="rounded-full bg-white text-black font-black uppercase tracking-widest px-8">
                    Return to Headquarters
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col selection:bg-primary selection:text-white">
            <Navbar />

            <main className="flex-1 pt-32 pb-24">
                <div className="container-custom max-w-4xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-primary/20">
                            <ShieldCheck className="h-4 w-4" />
                            Encrypted 256-Bit SSL Checkout
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
                            Authorized <span className="text-primary not-italic">Payment Gateway</span>
                        </h1>
                    </div>

                    {paidSuccess ? (
                        <Card className="bg-zinc-950 border-primary/30 p-8 md:p-12 rounded-[2.5rem] text-center shadow-[0_0_60px_rgba(255,77,0,0.2)]">
                            <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="h-10 w-10 text-primary" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight mb-4">Payment Confirmed</h2>
                            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                                Transaction processed successfully. Your training slot has been locked in the operational system.
                            </p>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-md mx-auto mb-8 text-left space-y-3">
                                <div className="flex justify-between text-xs font-black tracking-wider">
                                    <span className="text-gray-500 uppercase">Trainee</span>
                                    <span className="text-white">{booking.name}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black tracking-wider">
                                    <span className="text-gray-500 uppercase">Package</span>
                                    <span className="text-primary">{booking.package}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black tracking-wider">
                                    <span className="text-gray-500 uppercase">Session Time</span>
                                    <span className="text-white">{booking.date} at {booking.time}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black tracking-wider pt-2 border-t border-white/10">
                                    <span className="text-gray-500 uppercase">Amount Settled</span>
                                    <span className="text-xl font-black text-white italic">£{booking.price}.00</span>
                                </div>
                            </div>

                            <Button onClick={() => router.push("/")} className="rounded-full bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest px-10 h-14 cursor-pointer">
                                Back to Headquarters
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-12 gap-8 items-start">
                            {/* Summary Card */}
                            <div className="md:col-span-5 bg-zinc-950 border border-white/10 rounded-[2rem] p-6 md:p-8 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Protocol Invoice</p>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tight">{booking.package}</h3>
                                </div>

                                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                                        <span className="font-bold text-gray-300">{booking.date}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock className="h-4 w-4 text-primary shrink-0" />
                                        <span className="font-bold text-gray-300">{booking.time} BST</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Zap className="h-4 w-4 text-primary shrink-0" />
                                        <span className="font-bold text-gray-300">1-on-1 Elite Coaching</span>
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-6 space-y-3">
                                    <div className="flex justify-between text-xs font-black uppercase text-gray-400">
                                        <span>Subtotal</span>
                                        <span>£{booking.price}.00</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-black uppercase text-gray-400">
                                        <span>Processing Fee</span>
                                        <span className="text-primary">£0.00</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg font-black uppercase text-white pt-2 border-t border-white/10">
                                        <span>Total Due</span>
                                        <span className="text-3xl font-black text-primary italic">£{booking.price}.00</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <div className="md:col-span-7 bg-zinc-950 border border-white/10 rounded-[2rem] p-6 md:p-8 space-y-6">
                                <div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tight mb-3">Select Payment Method</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Paystack Option */}
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("paystack")}
                                            className={`p-4 rounded-xl border flex flex-col items-center gap-1.5 font-black uppercase text-xs tracking-wider transition-all cursor-pointer ${
                                                paymentMethod === "paystack"
                                                    ? "bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                                            }`}
                                        >
                                            <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center font-black text-xs">
                                                P
                                            </div>
                                            <span>Paystack</span>
                                            <span className="text-[8px] text-emerald-400 font-mono">Cards & Bank</span>
                                        </button>

                                        {/* Stripe Option */}
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("stripe")}
                                            className={`p-4 rounded-xl border flex flex-col items-center gap-1.5 font-black uppercase text-xs tracking-wider transition-all cursor-pointer ${
                                                paymentMethod === "stripe"
                                                    ? "bg-primary/20 border-primary text-white shadow-[0_0_20px_rgba(255,77,0,0.3)]"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                                            }`}
                                        >
                                            <CreditCard className="h-5 w-5" />
                                            <span>Card / Stripe</span>
                                            <span className="text-[8px] text-gray-400 font-mono">Apple Pay</span>
                                        </button>

                                    </div>
                                </div>

                                <form onSubmit={handlePayNow} className="space-y-4">
                                    {paymentMethod === "paystack" ? (
                                        <div className="p-6 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-3">
                                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
                                                <ShieldCheck className="h-4 w-4" />
                                                <span>Paystack Instant Checkout</span>
                                            </div>
                                            <p className="text-xs text-gray-400 leading-relaxed">
                                                You will be directed to Paystack&apos;s PCI-DSS compliant checkout to complete your payment via Mastercard, Visa, Verve, Bank Transfer, or Apple Pay.
                                            </p>
                                            <div className="pt-2 text-[11px] font-mono text-gray-400">
                                                Recipient: <strong className="text-white">TthePT Elite Conditioning</strong>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl space-y-3">
                                            <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider">
                                                <CreditCard className="h-4 w-4" />
                                                <span>Secure Stripe Checkout</span>
                                            </div>
                                            <p className="text-xs text-gray-400 leading-relaxed">
                                                You will be directed to Stripe&apos;s secure checkout to pay by card, Apple Pay or Revolut Pay.
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className={`w-full h-16 rounded-full font-black uppercase tracking-widest italic text-base mt-6 transition-all cursor-pointer ${
                                            paymentMethod === "paystack"
                                                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                                                : "bg-primary hover:bg-orange-600 text-white shadow-[0_10px_30px_rgba(255,77,0,0.3)]"
                                        }`}
                                    >
                                        {processing
                                            ? "Authorizing..."
                                            : paymentMethod === "paystack"
                                                ? `Pay £${booking.price}.00 with Paystack ↗`
                                                : `Pay £${booking.price}.00 with Stripe ↗`}
                                    </Button>

                                    <p className="text-[10px] font-bold text-center text-gray-500 uppercase tracking-widest flex items-center justify-center gap-2 mt-4">
                                        <Lock className="h-3 w-3 text-primary" /> Payments processed securely by our payment provider
                                    </p>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Loading Checkout Gateway...</p>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
