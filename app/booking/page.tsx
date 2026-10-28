"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Calendar } from "@/components/booking/Calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle,
    CreditCard,
    Calendar as CalendarIcon,
    User,
    ShieldCheck,
    Zap,
    ChevronRight,
    Lock,
    Activity,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STRIPE_PAYMENT_LINKS, stripeCheckoutUrl } from "@/lib/payment-links";

const packages = [
    {
        id: "single",
        name: "1-to-1 session",
        price: 30,
        desc: "Single precise tactical deployment.",
        highlight: false
    },
    {
        id: "biweekly",
        name: "2 days a week",
        price: 55,
        desc: "Strategic dual-day rhythm for sustained progression.",
        highlight: false
    },
    {
        id: "weekly",
        name: "3x a week",
        price: 75,
        desc: "High-frequency operational rhythm.",
        highlight: true
    },
    {
        id: "monthly",
        name: "12 Sessions a month",
        price: 280,
        desc: "Elite sustained detached command.",
        highlight: false
    }
];

export default function BookingPage() {
    const [selectedPackage, setSelectedPackage] = useState(packages.find(p => p.highlight) || packages[2]);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [step, setStep] = useState<"tier" | "calendar" | "details" | "payment" | "success">("tier");
    const [formData, setFormData] = useState({ name: "", email: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const hasStripeLink = Boolean(STRIPE_PAYMENT_LINKS[selectedPackage.name]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch slots when date changes
    useEffect(() => {
        setSelectedSlot(null);
        if (date) {
            const dateStr = format(date, "yyyy-MM-dd");
            fetch(`/api/availability?date=${dateStr}`)
                .then((res) => res.json())
                .then((data) => setSlots(data.slots || []))
                .catch((err) => console.error("Failed to fetch slots", err));
        } else {
            setSlots([]);
        }
    }, [date]);

    const handleSlotSelect = (slot: string) => {
        setSelectedSlot(slot);
    };

    const handleNextToCalendar = () => {
        setStep("calendar");
    };

    const handleNextToDetails = () => {
        if (date && selectedSlot) setStep("details");
    };

    const handleNextToPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.email) setStep("payment");
    };

    const handleConfirmBooking = async () => {
        if (!date || !selectedSlot) return;
        setIsLoading(true);

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    date: format(date, "yyyy-MM-dd"),
                    time: selectedSlot,
                    package: selectedPackage.name,
                    price: selectedPackage.price
                })
            });

            if (res.ok) {
                const { booking } = await res.json();
                if (typeof window !== "undefined") {
                    localStorage.setItem("tthept_client_signed_up", "true");
                    localStorage.setItem("tthept_client_email", formData.email);
                    localStorage.setItem("tthept_client_name", formData.name);
                }
                // Hand off to Stripe; client_reference_id ties the payment back to this booking
                const stripeUrl = stripeCheckoutUrl(selectedPackage.name, formData.email, booking.id);
                if (stripeUrl) {
                    window.location.href = stripeUrl;
                    return;
                }
                setStep("success");
            } else {
                alert("Booking failed. Please try again.");
            }
        } catch (error) {
            console.error("Booking failed", error);
            alert("An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const steps = [
        { id: "tier", label: "01. TIER", icon: Zap },
        { id: "calendar", label: "02. TIMING", icon: CalendarIcon },
        { id: "details", label: "03. IDENTITY", icon: User },
        { id: "payment", label: "04. ACCESS", icon: Lock },
    ];

    const stepOrder = ["tier", "calendar", "details", "payment", "success"];
    const currentStepIdx = stepOrder.indexOf(step);
    const progressStepIdx = Math.min(currentStepIdx, steps.length - 1);

    return (
        <div className="flex flex-col min-h-screen bg-black text-white selection:bg-primary selection:text-white overflow-x-hidden">
            <Navbar />

            <main className="flex-1 py-12 md:py-24 relative overflow-hidden flex flex-col items-center">
                {/* Immersive Background Element */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/hero-new.jpg')] bg-cover bg-center opacity-10 grayscale pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black pointer-events-none"></div>

                <div className="container-custom max-w-6xl relative z-10 w-full pt-16 md:pt-20">
                    {/* Header Protocol */}
                    <div className="flex flex-col items-center text-center mb-12 md:mb-16 px-4">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.4em] uppercase mb-4 md:mb-6 border border-primary/20 backdrop-blur-md">
                            <Activity className="h-3 w-3 animate-pulse" />
                            Secure Intake Protocol Active
                        </div>
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 sm:mb-6 leading-none">
                            INTAKE <span className="text-primary not-italic">SESSION</span>
                        </h1>
                        <p className="text-gray-400 text-base md:text-xl font-bold max-w-2xl mx-auto italic leading-relaxed">
                            Selection of serious applicants only. Precise data entry required for biomechanical evaluation.
                        </p>
                    </div>

                    {/* Progress Monitor */}
                    <div className="max-w-4xl mx-auto mb-12 md:mb-16 px-2 sm:px-4">
                        <div className="flex justify-between relative">
                            {/* Connectors */}
                            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/10 -translate-y-1/2 -z-10 px-4 sm:px-8"></div>
                            <div
                                className="absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 -z-10 transition-all duration-700 ease-in-out px-4 sm:px-8"
                                style={{ width: `${(progressStepIdx / (steps.length - 1)) * 100}%` }}
                            ></div>

                            {steps.map((s, idx) => {
                                const isActive = s.id === (step === "success" ? "payment" : step);
                                const isCompleted = stepOrder.indexOf(step) > idx;

                                return (
                                    <div key={s.id} className="flex flex-col items-center">
                                        <div className={cn(
                                            "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
                                            isActive ? "bg-primary border-primary text-white shadow-[0_0_25px_rgba(255,77,0,0.6)] scale-110" :
                                                isCompleted ? "bg-white border-white text-black" : "bg-zinc-900 border-white/10 text-gray-500"
                                        )}>
                                            <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                        <span className={cn(
                                            "mt-2 sm:mt-4 text-[9px] sm:text-[10px] font-black tracking-[0.15em] sm:tracking-[0.2em] transition-colors duration-500",
                                            isActive ? "text-primary" : isCompleted ? "text-white" : "text-gray-500"
                                        )}>
                                            {s.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Stage */}
                    <div className="max-w-5xl mx-auto">
                        <Card className="bg-zinc-900/60 border-white/10 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden min-h-[550px] md:min-h-[650px] flex flex-col">
                            {/* Top Accent Line */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"></div>

                            <CardContent className="flex-1 p-6 sm:p-10 md:p-16 relative">
                                {/* Atmospheric Elements */}
                                <div className="absolute top-8 right-8 flex gap-4 opacity-30 hidden md:flex">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                                        LATENCY: 12ms<br />STATUS: ENCRYPTED
                                    </div>
                                    <ShieldCheck className="h-8 w-8 text-white" />
                                </div>

                                <AnimatePresence mode="wait">
                                    {step === "tier" && (
                                        <motion.div
                                            key="step-tier"
                                            initial={isMounted ? { opacity: 0, y: 15 } : false}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -15 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="text-center mb-10 md:mb-16 space-y-3">
                                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter">SELECT <span className="text-primary not-italic">COMMAND</span> TIER</h2>
                                                <p className="text-gray-400 font-bold text-xs sm:text-sm tracking-tight italic max-w-xl mx-auto">
                                                    Choose the intensity of your detachment protocol. High-performing results require specific operational frequency.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 md:mb-16">
                                                {packages.map((pkg) => (
                                                    <button
                                                        key={pkg.id}
                                                        onClick={() => setSelectedPackage(pkg)}
                                                        className={cn(
                                                            "relative p-6 sm:p-7 lg:p-5 xl:p-7 rounded-[2rem] border-2 transition-all duration-500 flex flex-col text-left group overflow-hidden active:scale-98",
                                                            selectedPackage.id === pkg.id
                                                                ? "bg-primary/20 border-primary shadow-[0_0_30px_rgba(255,77,0,0.25)] bg-gradient-to-br from-primary/15 to-transparent scale-[1.02]"
                                                                : "bg-black/40 border-white/10 hover:border-white/20"
                                                        )}
                                                    >
                                                        {pkg.highlight && (
                                                            <div className="absolute top-4 right-4 bg-primary text-white text-[8px] font-black tracking-widest px-2.5 py-1 rounded-full italic shadow-md">MOST ACTIVE</div>
                                                        )}

                                                        <h4 className={cn(
                                                            "text-lg sm:text-xl lg:text-base xl:text-xl font-black uppercase italic tracking-tight mb-2 transition-colors",
                                                            selectedPackage.id === pkg.id ? "text-primary" : "text-white"
                                                        )}>
                                                            {pkg.name}
                                                        </h4>
                                                        <p className="text-gray-400 text-xs font-bold leading-relaxed mb-6 flex-1">
                                                            {pkg.desc}
                                                        </p>
                                                        <div className="mt-auto">
                                                            <p className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white">£{pkg.price}</p>
                                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Protocol Valuation</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex justify-center">
                                                <Button
                                                    onClick={handleNextToCalendar}
                                                    className="w-full sm:w-auto h-16 px-12 md:px-16 rounded-full font-black uppercase tracking-[0.25em] bg-white text-black hover:bg-primary hover:text-white transition-all hover:scale-105 shadow-xl group"
                                                >
                                                    Lock Choice <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === "calendar" && (
                                        <motion.div
                                            key="step-calendar"
                                            initial={isMounted ? { opacity: 0, x: 20 } : false}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-start">
                                                <div className="space-y-6">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => setStep("tier")}
                                                                className="text-xs font-black text-primary hover:underline uppercase tracking-widest flex items-center"
                                                            >
                                                                &larr; Change Tier
                                                            </button>
                                                            <div className="h-[1px] flex-1 bg-white/10"></div>
                                                        </div>
                                                        <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter">SELECT <br /><span className="text-primary not-italic">DEPLOYMENT</span></h2>
                                                        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-xl">
                                                            <Zap className="h-3 w-3 text-primary" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{selectedPackage.name} SELECTED</span>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 sm:p-6 bg-black/40 rounded-[2rem] border border-white/10 w-full shadow-inner flex justify-center">
                                                        <Calendar
                                                            mode="single"
                                                            selected={date}
                                                            onSelect={setDate}
                                                            disabled={(day) => {
                                                                const today = new Date();
                                                                today.setHours(0, 0, 0, 0);
                                                                return day < today;
                                                            }}
                                                            className="w-full max-w-[350px]"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Windows Detected</h3>
                                                        {date && <span className="text-xs font-bold text-white/50 uppercase tracking-widest">{format(date, "MMMM dd")}</span>}
                                                    </div>

                                                    {!date ? (
                                                        <div className="h-[280px] sm:h-[350px] flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[2rem] text-center p-6">
                                                            <CalendarIcon className="h-10 w-10 text-white/10 mb-3" />
                                                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Awaiting Date Selection</p>
                                                        </div>
                                                    ) : slots.length === 0 ? (
                                                        <div className="h-[280px] sm:h-[350px] flex flex-col items-center justify-center bg-red-500/5 border border-red-500/10 rounded-[2rem] text-center p-6">
                                                            <Activity className="h-10 w-10 text-red-500/30 mb-3" />
                                                            <p className="text-xs font-black text-red-400 uppercase tracking-widest">Protocol Capacity Full</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-h-[350px] overflow-y-auto pr-1">
                                                            {slots.map((slot) => (
                                                                <button
                                                                    key={slot}
                                                                    onClick={() => handleSlotSelect(slot)}
                                                                    className={cn(
                                                                        "h-16 sm:h-20 rounded-2xl font-black text-lg sm:text-xl transition-all duration-300 border-2 group relative overflow-hidden active:scale-95",
                                                                        selectedSlot === slot
                                                                            ? "bg-primary border-primary text-white shadow-[0_5px_20px_rgba(255,77,0,0.4)]"
                                                                            : "bg-black/40 border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                                                                    )}
                                                                >
                                                                    <span className="relative z-10 italic uppercase">{slot}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="pt-4">
                                                        <Button
                                                            onClick={handleNextToDetails}
                                                            disabled={!date || !selectedSlot}
                                                            className="w-full h-16 rounded-full font-black uppercase tracking-[0.25em] bg-white text-black hover:bg-primary hover:text-white transition-all hover:scale-[1.02] shadow-xl group"
                                                        >
                                                            Initialize Profile <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === "details" && (
                                        <motion.div
                                            key="step-details"
                                            initial={isMounted ? { opacity: 0, x: 20 } : false}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="max-w-2xl mx-auto"
                                        >
                                            <div className="text-center mb-8 sm:mb-12 space-y-3">
                                                <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter">Identity <span className="text-primary not-italic">Hash</span></h2>
                                                <p className="text-gray-400 font-bold text-xs sm:text-sm tracking-tight italic">
                                                    All intake data is processed through our secure encryption layer.
                                                </p>
                                            </div>

                                            <form onSubmit={handleNextToPayment} className="space-y-6 sm:space-y-8">
                                                <div className="space-y-5">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Legal Designation</label>
                                                        <Input
                                                            required
                                                            placeholder="MARCUS AURELIUS"
                                                            className="h-16 sm:h-20 bg-black/40 border-white/10 rounded-2xl focus:ring-primary focus:border-primary font-black text-xl sm:text-2xl placeholder:text-white/10 uppercase italic px-6 sm:px-8"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Communication Signal</label>
                                                        <Input
                                                            required
                                                            type="email"
                                                            placeholder="YOU@ELITE.PT"
                                                            className="h-16 sm:h-20 bg-black/40 border-white/10 rounded-2xl focus:ring-primary focus:border-primary font-black text-xl sm:text-2xl placeholder:text-white/10 uppercase italic px-6 sm:px-8"
                                                            value={formData.email}
                                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="p-6 sm:p-8 bg-primary/5 border border-primary/20 rounded-[2rem] flex items-start gap-4 sm:gap-6 relative overflow-hidden">
                                                    <Target className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0 mt-0.5" />
                                                    <div className="space-y-1 sm:space-y-2">
                                                        <p className="text-xs font-black uppercase tracking-widest text-primary">Intake Terminus</p>
                                                        <p className="text-xs sm:text-sm text-gray-400 font-bold leading-relaxed italic">
                                                            You acknowledge that elite performance requires 100% adherence to our physiological protocols.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                                    <Button type="button" variant="ghost" className="h-14 sm:h-16 px-6 rounded-full text-white/40 hover:text-white font-black uppercase tracking-widest order-2 sm:order-1" onClick={() => setStep("calendar")}>Recalibrate</Button>
                                                    <Button type="submit" className="flex-1 h-14 sm:h-16 rounded-full font-black uppercase tracking-[0.25em] bg-primary text-white hover:bg-orange-600 shadow-xl order-1 sm:order-2">Secure Slot</Button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    )}

                                    {step === "payment" && (
                                        <motion.div
                                            key="step-payment"
                                            initial={isMounted ? { opacity: 0, x: 20 } : false}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="max-w-3xl mx-auto"
                                        >
                                            <div className="grid md:grid-cols-12 gap-8 md:gap-12">
                                                <div className="md:col-span-12 text-center mb-4 md:mb-8">
                                                    <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter">ACCESS <span className="text-primary not-italic">AUTHORIZATION</span></h2>
                                                </div>

                                                <div className="md:col-span-5 space-y-4 sm:space-y-6">
                                                    <div className="p-6 sm:p-8 bg-black/60 rounded-[2rem] border border-white/10 relative overflow-hidden shadow-2xl">
                                                        <div className="absolute top-0 right-0 p-3 bg-primary text-white text-[8px] font-black tracking-[0.2em] rounded-bl-xl italic">INTAKE FEE</div>
                                                        <div className="space-y-1 mt-2">
                                                            <p className="text-4xl sm:text-5xl font-black text-white italic tracking-tighter leading-none">£{selectedPackage.price}.00</p>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedPackage.name.toUpperCase()}</p>
                                                        </div>

                                                        <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
                                                            <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-gray-400">
                                                                <span>VALUATION</span>
                                                                <span className="text-white">£{selectedPackage.price}.00</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-gray-400">
                                                                <span>SECURE CHANNEL</span>
                                                                <span className="text-primary">FREE</span>
                                                            </div>
                                                            <div className="pt-3 flex justify-between items-center">
                                                                <span className="text-[10px] font-black tracking-widest text-white">TOTAL</span>
                                                                <span className="text-xl sm:text-2xl font-black text-primary italic">£{selectedPackage.price}.00</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                                                        <Zap className="h-5 w-5 text-primary shrink-0" />
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Instant synchronization post-access</p>
                                                    </div>
                                                </div>

                                                <form onSubmit={(e) => { e.preventDefault(); handleConfirmBooking(); }} className="md:col-span-7 space-y-6">
                                                    <div className="p-6 bg-black/40 border border-white/10 rounded-2xl space-y-3">
                                                        <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                                                            <CreditCard className="h-4 w-4" />
                                                            <span>{hasStripeLink ? "Secure Stripe Checkout" : "Pay In Person"}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-400 leading-relaxed">
                                                            {hasStripeLink
                                                                ? "You'll be taken to Stripe's secure checkout to pay by card, Apple Pay or Revolut Pay. Your slot is reserved as soon as you continue."
                                                                : "Your slot will be reserved now and payment is settled with your coach at your first session."}
                                                        </p>
                                                    </div>

                                                    <div className="pt-4 space-y-3">
                                                        <Button
                                                            type="submit"
                                                            disabled={isLoading}
                                                            className="w-full h-16 sm:h-20 rounded-full bg-white text-black font-black uppercase tracking-[0.3em] italic hover:bg-primary hover:text-white transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] cursor-pointer"
                                                        >
                                                            {isLoading
                                                                ? "Synchronizing..."
                                                                : hasStripeLink
                                                                    ? `PAY £${selectedPackage.price}.00 WITH STRIPE ↗`
                                                                    : "ACTIVATE COMMITMENT"}
                                                        </Button>
                                                        <button
                                                            type="button"
                                                            className="w-full text-white/30 hover:text-white text-[10px] font-black tracking-widest uppercase transition-colors cursor-pointer"
                                                            onClick={() => setStep("details")}
                                                            disabled={isLoading}
                                                        >
                                                            Revise Profile Identity
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === "success" && (
                                        <motion.div
                                            key="step-success"
                                            initial={isMounted ? { opacity: 0, scale: 0.95 } : false}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5 }}
                                            className="flex flex-col items-center justify-center h-full text-center py-8"
                                        >
                                            <div className="relative mb-8 sm:mb-12">
                                                <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-150 animate-pulse"></div>
                                                <div className="relative bg-primary p-6 sm:p-8 rounded-[2rem] text-white shadow-[0_0_50px_rgba(255,77,0,0.6)] rotate-12">
                                                    <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20" />
                                                </div>
                                            </div>

                                            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 sm:mb-6 leading-none">
                                                PROTOCOL <span className="text-primary not-italic">LIVE</span>
                                            </h2>

                                            <div className="bg-black/50 backdrop-blur-md p-6 sm:p-10 rounded-[2.5rem] border border-white/10 max-w-xl w-full mb-8 sm:mb-12 shadow-inner relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                                                <p className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-4 sm:mb-6">INTAKE CONFIRMED</p>

                                                <div className="flex justify-center gap-8 sm:gap-12 items-baseline mb-6 sm:mb-8">
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">DATE</p>
                                                        <p className="text-2xl sm:text-3xl font-black text-white italic">{date && format(date, "MMM dd")}</p>
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">TIME</p>
                                                        <p className="text-2xl sm:text-3xl font-black text-white italic">{selectedSlot}</p>
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t border-white/10 text-center">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">OPERATIONAL TIER</p>
                                                    <p className="text-xl sm:text-2xl font-black text-primary italic uppercase">{selectedPackage.name}</p>
                                                </div>

                                                <div className="pt-6 border-t border-white/10">
                                                    <p className="text-xs sm:text-sm font-bold text-gray-400 leading-relaxed italic">
                                                        Deployment packet dispatched to <span className="text-white font-black underline decoration-primary decoration-2 sm:decoration-4">{formData.email}</span>.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
                                                <Button asChild className="w-full sm:w-auto h-16 px-8 sm:px-10 rounded-full bg-primary text-white font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl group">
                                                    <Link href="/meal-plans" className="flex items-center gap-2">
                                                        <span>View Protocols & Recon</span>
                                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" className="w-full sm:w-auto h-16 px-8 rounded-full border-white/20 bg-transparent text-white font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                                                    <Link href="/">Return to Ops</Link>
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>

                            {/* Decorative Bottom Bar */}
                            <div className="bg-black/80 border-t border-white/5 p-4 sm:p-6 md:px-16 flex justify-between items-center mt-auto">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                                    <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-gray-400 uppercase">System Secure</span>
                                </div>
                                <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-gray-500 uppercase hidden sm:block italic">
                                    TthePT // Biomechanical Intake Protocol v4.2.0
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

