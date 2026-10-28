"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/animated-section";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Utensils,
    Zap,
    Target,
    Flame,
    Droplets,
    Scale,
    Lock,
    Unlock as LockOpen,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    X,
    Mail,
    User,
    ChevronRight,
    KeyRound
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const mealProtocols = [
    {
        id: "protocol-1",
        title: "REFINEMENT 1.0",
        category: "LEAN CONDITIONING",
        desc: "Precision focused strategy for high-definition results and metabolic optimization.",
        macros: { protein: "40%", carbs: "30%", fats: "30%" },
        features: ["Metabolic Fire", "Lean Tissue Density", "Digestive Efficiency"],
        kcal: "2,000",
        highlight: false,
        meals: [
            "Scrambled eggs with veggies, 1 cup cooked rice, 1 apple",
            "Grilled salmon (150g), Mixed greens",
            "Chicken thighs (200g), Roasted sweet potato (1 cup), Broccoli",
            "Beef mince with rice (100g beef, 1/2 cup rice), Carrots",
            "Baked cod (150g), 1 cup potato mash, Green beans",
            "1 cup almond milk, Handful of berries"
        ]
    },
    {
        id: "protocol-2",
        title: "KINETIC 2.0",
        category: "HYPERTROPHY FUEL",
        desc: "High-volume nutrient delivery for muscle synthesis and explosive power output.",
        macros: { protein: "35%", carbs: "45%", fats: "20%" },
        features: ["Anabolic Window", "Glycogen Satiation", "Recovery Speed"],
        kcal: "2,800",
        highlight: true,
        meals: [
            "Omelet with 3 eggs, spinach, tomatoes, onions, 1 cup cooked rice, 1 pear",
            "Salmon (120g), Steamed asparagus and carrots",
            "Chicken breast (200g), 1 cup mashed sweet potato, Mixed veggies",
            "Beef mince (100g) with diced veggies, 1 small potato",
            "Grilled white fish (150g), Brown rice (1 cup), Broccoli",
            "1 cup almond milk, 1 handful of berries"
        ]
    },
    {
        id: "protocol-3",
        title: "TACTICAL 3.0",
        category: "ATHLETIC STAMINA",
        desc: "Endurance-focused protocol for sustained high-intensity operational capacity.",
        macros: { protein: "40%", carbs: "40%", fats: "20%" },
        features: ["Sustained Energy", "Electrolyte Mastery", "Micronutrient Density"],
        kcal: "2,400",
        highlight: false,
        meals: [
            "Omelet (3 eggs + veggies), 1 cup rice, 1 orange",
            "Chicken breast (150g), Sweet potato (1 cup), Mixed veggies",
            "Lean beef (150-200g), Roasted vegetables, 1 cup rice",
            "Tuna or sardines (1 can), 1 baked potato",
            "Grilled lamb (150g), Sweet potato mash (1 cup), Steamed spinach",
            "1 cup almond milk, 1 apple"
        ]
    },
    {
        id: "protocol-4",
        title: "ELITE 4.0",
        category: "MAXIMUM CAPACITY",
        desc: "The gold standard for elite athletes requiring extreme protein and volume management.",
        macros: { protein: "45%", carbs: "35%", fats: "20%" },
        features: ["Extreme Protein", "Volume Loading", "Peak Performance"],
        kcal: "3,200",
        highlight: false,
        meals: [
            "Scrambled eggs (3 whole + 3 whites), 1 cup roasted sweet potato, 1 apple, 1 glass almond milk",
            "Chicken breast (150g), 1/2 cup jasmine rice, Steamed broccoli",
            "Lean beef stir-fry with mixed veggies, 1 cup brown rice",
            "Tuna (1 can), 1 medium baked potato, 1 orange",
            "Grilled lamb (150-200g), Roasted sweet potato (1 cup), Steamed green beans",
            "White fish (cod or tilapia, 120g), Mixed vegetables, 1 glass almond milk"
        ]
    }
];

const advancedProtocols = [
    {
        id: "adv-1",
        title: "OVERSIGHT 1.0",
        category: "METABOLIC DENSITY",
        desc: "Designed for rapid metabolic adaptation and structural density maintenance.",
        macros: { protein: "45%", carbs: "30%", fats: "25%" },
        features: ["Metabolic Fire", "Lean Tissue Density", "Digestive Efficiency"],
        kcal: "2,200",
        highlight: false,
        meals: [
            "Scrambled eggs (3 eggs) with spinach, 1 cup rice, 1 pear",
            "Tuna (1 can), 1 medium potato, Mixed vegetables",
            "Chicken breast (200g), Brown rice (1 cup), Broccoli",
            "Beef stir-fry (150g), Steamed veg",
            "Grilled fish (150g), Sweet potato (1 cup), Asparagus",
            "1 cup almond milk, Small fruit salad"
        ]
    },
    {
        id: "adv-2",
        title: "VANGUARD 2.0",
        category: "ATHLETIC VOLUME",
        desc: "High-performance fueling for the elite operator requiring sustained power.",
        macros: { protein: "40%", carbs: "40%", fats: "20%" },
        features: ["Anabolic Window", "Glycogen Satiation", "Recovery Speed"],
        kcal: "2,600",
        highlight: true,
        meals: [
            "Smoothie: almond milk + frozen berries + almond butter + 1 scoop protein (optional), 2 boiled eggs",
            "Grilled chicken breast (150g), Brown rice (1 cup), Broccoli",
            "Beef strips with onions & peppers, Roasted potato (1 medium)",
            "Salmon (120g), Mixed veggies",
            "Lamb steak (200g), Sweet potato fries (1 cup), Green salad",
            "Almond milk (1 cup), Handful of fruit"
        ]
    },
    {
        id: "adv-3",
        title: "COMMANDER 3.0",
        category: "ELITE SUSTENANCE",
        desc: "The pinnacle of precision fueling for peak cognitive and physical output.",
        macros: { protein: "35%", carbs: "45%", fats: "20%" },
        features: ["Cognitive Fuel", "Sustained Power", "Peak Performance"],
        kcal: "3,000",
        highlight: false,
        meals: [
            "1 cup almond milk smoothie (protein, berries, nut butter), 2 boiled eggs, 1 small baked sweet potato",
            "Chicken breast (150g), 1 cup cooked rice, Steamed spinach",
            "Grilled lamb (150g), Roasted potato (1 medium), Salad",
            "Tuna salad with olive oil, tomato, cucumber, 1 orange",
            "Beef steak (200g), Steamed veggies, 1 cup rice",
            "Almond milk (1 cup), Mixed fruit bowl (no banana)"
        ]
    }
];

const workoutPlan = [
    {
        day: "Tuesday",
        title: "HIIT SESSION",
        warmup: "13 min Incline walk (Incline L15 / Speed 3.8)",
        exercises: [
            { name: "Row", details: "2 min Row (4 Sets) / 1 min rest EACH SET" },
            { name: "SLED PULL", details: "70KG / 60 meters" },
            { name: "Shoulder Press", details: "Military press (25KG) - Weights increase every 2 weeks" },
            { name: "Crunches", details: "60 reps (Core Blast)" }
        ]
    },
    {
        day: "Wednesday",
        title: "LEG SESSION",
        warmup: "13 min Incline walk (Incline L15 / Speed 3.8)",
        exercises: [
            { name: "Barbell Squat", details: "30KG - 40KG / 4 Sets" },
            { name: "Leg Press", details: "10/12 reps (Weights vary)" },
            { name: "Leg Extensions", details: "10/12 reps (Weights vary)" },
            { name: "Leg Curl", details: "10/12 reps (Weights vary)" },
            { name: "RDL", details: "Smith Machine / 10/12 reps" }
        ]
    },
    {
        day: "Thursday",
        title: "PULL SESSION",
        warmup: "13 min Incline walk (Incline L15 / Speed 3.8)",
        exercises: [
            { name: "Lateral Pull Down", details: "10/12 reps / 3 Sets" },
            { name: "Seated High Row", details: "10/12 reps / 3 Sets" },
            { name: "Bent-Over Row Machine", details: "15KG / 10/12 reps / 3 Sets" },
            { name: "Face Pulls", details: "10/12 reps" },
            { name: "Bicep Burnout", details: "10/12 reps / 4 Sets" }
        ]
    },
    {
        day: "Friday",
        title: "PUSH & CORE",
        warmup: "13 min Incline walk (Incline L15 / Speed 3.8)",
        exercises: [
            { name: "Incline Dumbbell Press", details: "15KG - 20KG / 3 Sets" },
            { name: "Incline Chest Press", details: "Hammer Strength Machine / 10/12 reps / 3 Sets" },
            { name: "Flat Chest Press", details: "Hammer Strength Machine / 10/12 reps / 3 Sets" },
            { name: "Pec Fly", details: "10/12 reps / 3 Sets" },
            { name: "Tricep Cable Pulls", details: "Reps to failure" },
            { name: "Crunches", details: "60 reps" }
        ]
    }
];

const ALL_PROTOCOL_IDS = [
    "protocol-1",
    "protocol-2",
    "protocol-3",
    "protocol-4",
    "adv-1",
    "adv-2",
    "adv-3"
];

export default function MealPlansPage() {
    const [isClientSignedUp, setIsClientSignedUp] = useState(false);
    const [clientInfo, setClientInfo] = useState<{ name?: string; email?: string } | null>(null);
    const [unlocked, setUnlocked] = useState<string[]>([]);
    const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState<"verify" | "signup">("verify");
    const [verifyEmail, setVerifyEmail] = useState("");
    const [signupName, setSignupName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupGoal, setSignupGoal] = useState("");
    const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const signedUp = localStorage.getItem("tthept_client_signed_up") === "true";
            const email = localStorage.getItem("tthept_client_email") || undefined;
            const name = localStorage.getItem("tthept_client_name") || undefined;
            if (signedUp) {
                setIsClientSignedUp(true);
                setClientInfo({ name, email });
                setUnlocked(ALL_PROTOCOL_IDS);
            } else {
                setIsClientSignedUp(false);
                setUnlocked([]);
            }
        }
    }, []);

    const toggleUnlock = (id: string) => {
        if (!isClientSignedUp) {
            setIsClearanceModalOpen(true);
            return;
        }
        setUnlocked(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleLockOut = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("tthept_client_signed_up");
            localStorage.removeItem("tthept_client_email");
            localStorage.removeItem("tthept_client_name");
        }
        setIsClientSignedUp(false);
        setClientInfo(null);
        setUnlocked([]);
        setStatusMessage({ text: "Clearance revoked. Protocols locked.", type: "error" });
    };

    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifyEmail) return;
        setIsSubmitting(true);
        setStatusMessage(null);

        try {
            const res = await fetch("/api/client/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: verifyEmail })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                if (typeof window !== "undefined") {
                    localStorage.setItem("tthept_client_signed_up", "true");
                    localStorage.setItem("tthept_client_email", data.client.email);
                    localStorage.setItem("tthept_client_name", data.client.name);
                }
                setIsClientSignedUp(true);
                setClientInfo({ name: data.client.name, email: data.client.email });
                setUnlocked(ALL_PROTOCOL_IDS);
                setStatusMessage({ text: data.message || "Clearance granted! Protocols live.", type: "success" });
                setTimeout(() => {
                    setIsClearanceModalOpen(false);
                    setStatusMessage(null);
                }, 1200);
            } else {
                setStatusMessage({ text: data.message || "No client profile found for that email.", type: "error" });
            }
        } catch {
            setStatusMessage({ text: "Connection error. Please try again.", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signupEmail) return;
        setIsSubmitting(true);
        setStatusMessage(null);

        try {
            const res = await fetch("/api/client/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: signupEmail,
                    name: signupName,
                    objective: signupGoal,
                    quickSignup: true
                })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                if (typeof window !== "undefined") {
                    localStorage.setItem("tthept_client_signed_up", "true");
                    localStorage.setItem("tthept_client_email", data.client.email);
                    localStorage.setItem("tthept_client_name", data.client.name);
                }
                setIsClientSignedUp(true);
                setClientInfo({ name: data.client.name, email: data.client.email });
                setUnlocked(ALL_PROTOCOL_IDS);
                setStatusMessage({ text: "Registration verified! Mission Parameters & Recon unlocked.", type: "success" });
                setTimeout(() => {
                    setIsClearanceModalOpen(false);
                    setStatusMessage(null);
                }, 1200);
            } else {
                setStatusMessage({ text: data.message || "Registration failed. Try again.", type: "error" });
            }
        } catch {
            setStatusMessage({ text: "Connection error. Please try again.", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-black text-white selection:bg-primary selection:text-white overflow-x-hidden">
            <Navbar />

            <main className="flex-1">
                {/* Header Section */}
                <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-32 overflow-hidden border-b border-white/5">
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-primary/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                    <div className="container-custom relative z-10">
                        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 md:gap-12">
                            <AnimatedSection direction="down" className="max-w-3xl">
                                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.4em] uppercase mb-6 border border-primary/20">
                                    <Utensils className="h-3 w-3" />
                                    Operational Command Center
                                </div>
                                <h1 className="text-5xl sm:text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-none mb-6">
                                    FUEL <span className="text-primary not-italic">&</span> <br />FIRE
                                </h1>
                                <p className="text-lg sm:text-xl md:text-2xl text-gray-400 font-bold max-w-2xl italic leading-tight">
                                    The synthesis of precision nutrition and elite physical conditioning. This is where human potential is reconstructed.
                                </p>
                            </AnimatedSection>
                            <div className="flex flex-col items-start md:items-end text-left md:text-right space-y-2 opacity-40">
                                <span className="text-[10px] font-black tracking-[0.3em] uppercase">SYSTEM: COMMAND v3.0</span>
                                <span className="text-[10px] font-black tracking-[0.3em] uppercase">
                                    STATUS: {isClientSignedUp ? "CLEARANCE GRANTED" : "LOCKED RESTRICTED"}
                                </span>
                                <div className="flex gap-2">
                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isClientSignedUp ? "bg-emerald-400" : "bg-primary")}></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Workout Section */}
                <section className="py-32 bg-zinc-950 relative overflow-hidden">
                    <div className="container-custom">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                            <div className="max-w-2xl">
                                <h2 className="text-xs font-black text-primary tracking-[0.5em] uppercase mb-4">Training Protocol</h2>
                                <h3 className="text-4xl md:text-7xl font-black tracking-tight italic uppercase italic leading-none">48 DAY <span className="text-primary not-italic">ULTIMATE</span> SHRED</h3>
                            </div>
                            <div className="flex items-center gap-4 bg-black/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
                                <Zap className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Operation Status</p>
                                    <p className="text-sm font-black text-white italic">HIGH INTENSITY ACTIVE</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {workoutPlan.map((session, idx) => (
                                <div key={idx} className="group relative bg-black border border-white/5 rounded-[3rem] p-10 hover:border-primary/40 transition-all duration-500">
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <p className="text-[10px] font-black text-primary tracking-[0.3em] uppercase mb-2">{session.day}</p>
                                            <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white">{session.title}</h4>
                                        </div>
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 font-black italic text-xl group-hover:bg-primary group-hover:text-white transition-all">
                                            0{idx + 1}
                                        </div>
                                    </div>

                                    <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl mb-8 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                            <Droplets className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Warm Up Protocol</p>
                                            <p className="text-xs font-bold text-white italic">{session.warmup}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {session.exercises.map((ex, eIdx) => (
                                            <div key={eIdx} className="flex flex-col p-5 bg-zinc-950 rounded-2xl border border-white/5 group/ex hover:border-white/20 transition-all">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-black uppercase italic text-white tracking-tight">{ex.name}</span>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/ex:bg-primary transition-colors"></div>
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-500 italic">{ex.details}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Subtle background day text */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-black text-white/[0.02] pointer-events-none select-none uppercase -rotate-12 z-0">
                                        {session.day.slice(0, 3)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Tactical Clearance Console */}
                <section className="py-12 bg-zinc-950/80 border-y border-white/5 relative overflow-hidden">
                    <div className="container-custom">
                        <div className={cn(
                            "p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-6",
                            isClientSignedUp
                                ? "bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                                : "bg-red-950/20 border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.1)]"
                        )}>
                            <div className="flex items-center gap-4 text-left w-full md:w-auto">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                                    isClientSignedUp
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                        : "bg-red-500/10 border-red-500/30 text-red-400"
                                )}>
                                    {isClientSignedUp ? <ShieldCheck className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.3em]",
                                            isClientSignedUp ? "text-emerald-400" : "text-red-400"
                                        )}>
                                            {isClientSignedUp ? "LEVEL 1 CLEARANCE: ACTIVE" : "SECURITY CLEARANCE REQUIRED"}
                                        </span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                                    </div>
                                    <p className="text-xs sm:text-sm font-bold text-gray-300 italic">
                                        {isClientSignedUp
                                            ? `Authenticated Trainee: ${clientInfo?.name || clientInfo?.email || 'Active Client'}. Mission Parameters & Advance Recon blueprints are fully unlocked.`
                                            : "Mission Parameters & Advance Recon are locked. Complete an intake booking or verify your client email to unlock proprietary dietary blueprints."
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
                                {isClientSignedUp ? (
                                    <Button
                                        onClick={handleLockOut}
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full border-white/20 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:border-white w-full sm:w-auto cursor-pointer"
                                    >
                                        Lock Clearance
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            asChild
                                            size="sm"
                                            className="rounded-full px-6 py-5 text-xs font-black uppercase tracking-widest bg-primary hover:bg-orange-600 text-white shadow-lg w-full sm:w-auto cursor-pointer"
                                        >
                                            <Link href="/booking">Sign Up & Unlock</Link>
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setModalTab("verify");
                                                setIsClearanceModalOpen(true);
                                            }}
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full px-6 py-5 text-xs font-black uppercase tracking-widest border-white/20 text-white hover:bg-white/10 w-full sm:w-auto cursor-pointer"
                                        >
                                            Verify Client Email
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Protocols Grid (MISSION PARAMETERS) */}
                <section className="py-32 bg-black relative">
                    <div className="container-custom">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center gap-2 mb-3">
                                {isClientSignedUp ? (
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Clearance Verified: Unlocked
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                                        <Lock className="h-3 w-3" />
                                        Restricted Access // Client Sign Up Required
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xs font-black text-primary tracking-[0.5em] uppercase mb-4">Strategic Blueprints</h2>
                            <h3 className="text-4xl md:text-6xl font-black tracking-tight italic uppercase">
                                MISSION <span className="text-primary not-italic">PARAMETERS</span>
                            </h3>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {mealProtocols.map((protocol) => (
                                <div
                                    key={protocol.id}
                                    className={cn(
                                        "group relative flex flex-col p-1 bg-zinc-950 rounded-[2.5rem] border transition-all duration-700 overflow-hidden",
                                        protocol.highlight ? "border-primary/50 shadow-[0_0_50px_rgba(255,77,0,0.1)]" : "border-white/5 hover:border-white/20"
                                    )}
                                >
                                    {/* Inner Card */}
                                    <div className="p-8 flex-1 flex flex-col rounded-[2.3rem] bg-black transition-colors">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <Flame className="h-7 w-7" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-primary tracking-widest uppercase mb-1">TARGET</p>
                                                <p className="text-lg font-black italic text-white tracking-tighter">{protocol.kcal} <span className="text-[9px] not-italic text-gray-600">KCAL</span></p>
                                            </div>
                                        </div>

                                        <h4 className="text-xl font-black italic uppercase tracking-tight text-white mb-1 group-hover:text-primary transition-colors">{protocol.title}</h4>
                                        <p className="text-[9px] font-black text-gray-500 tracking-[0.2em] mb-6 uppercase">{protocol.category}</p>

                                        {!isClientSignedUp ? (
                                            /* Locked State when client hasn't signed up */
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div className="bg-zinc-950/90 rounded-2xl p-5 border border-red-500/20 mb-6 relative overflow-hidden text-center flex flex-col items-center justify-center min-h-[220px]">
                                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.1),transparent_70%)] pointer-events-none" />
                                                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-3 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                                        <Lock className="h-6 w-6" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400 mb-1">
                                                        CLASSIFIED PROTOCOL
                                                    </span>
                                                    <p className="text-xs font-bold text-gray-400 italic max-w-[210px] mb-4 leading-relaxed">
                                                        Meal deployment sequences locked. Sign up to unlock full operational protocol.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setModalTab("verify");
                                                            setIsClearanceModalOpen(true);
                                                        }}
                                                        className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <span>Verify Registered Email</span>
                                                        <ChevronRight className="h-3 w-3" />
                                                    </button>
                                                </div>

                                                <div className="bg-zinc-950 rounded-2xl p-4 border border-white/5 mb-6 opacity-60">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[8px] font-black tracking-widest text-gray-400 uppercase">Macro Targets</span>
                                                        <span className="text-[8px] font-black text-red-400 uppercase tracking-wider">Locked</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {Object.entries(protocol.macros).map(([type, val]) => (
                                                            <div key={type}>
                                                                <p className="text-sm font-black italic text-gray-300 leading-none">{val}</p>
                                                                <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest mt-1">{type}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => {
                                                        setModalTab("signup");
                                                        setIsClearanceModalOpen(true);
                                                    }}
                                                    className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all bg-white/10 hover:bg-primary text-white border border-white/10 hover:border-primary flex items-center justify-center gap-2 cursor-pointer shadow-lg group/btn"
                                                >
                                                    <span>SIGN UP TO UNLOCK</span>
                                                    <Lock className="h-4 w-4 text-primary group-hover/btn:text-white transition-colors" />
                                                </Button>
                                            </div>
                                        ) : (
                                            /* Unlocked State for Signed-Up Clients */
                                            <>
                                                {unlocked.includes(protocol.id) ? (
                                                    <div className="space-y-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
                                                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                Clearance Active
                                                            </span>
                                                            <span className="text-[8px] font-mono text-gray-500">{protocol.meals.length} Deployments</span>
                                                        </div>
                                                        {protocol.meals.map((meal, idx) => (
                                                            <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 group/meal hover:border-primary/30 transition-colors">
                                                                <p className="text-[8px] font-black text-primary uppercase mb-1">Meal {idx + 1}</p>
                                                                <p className="text-[11px] font-bold text-white italic leading-tight">{meal}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-gray-400 font-bold text-sm italic leading-relaxed mb-8 flex-1">
                                                            {protocol.desc}
                                                        </p>

                                                        {/* Macro Split */}
                                                        <div className="bg-zinc-950 rounded-3xl p-6 border border-white/5 mb-8">
                                                            <div className="flex justify-between items-end mb-4">
                                                                <span className="text-[9px] font-black tracking-widest text-primary uppercase">Macro Split</span>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-3">
                                                                {Object.entries(protocol.macros).map(([type, val]) => (
                                                                    <div key={type}>
                                                                        <p className="text-base font-black italic text-white leading-none">{val}</p>
                                                                        <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest mt-1">{type}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <ul className="space-y-2.5 mb-10">
                                                            {protocol.features.map((feature, i) => (
                                                                <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-gray-500 italic">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                                                                    {feature}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </>
                                                )}

                                                <Button
                                                    onClick={() => toggleUnlock(protocol.id)}
                                                    className={cn(
                                                        "w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all cursor-pointer",
                                                        unlocked.includes(protocol.id)
                                                            ? "bg-primary text-white hover:bg-orange-600"
                                                            : "bg-white text-black group-hover:bg-primary group-hover:text-white"
                                                    )}
                                                >
                                                    {unlocked.includes(protocol.id) ? "LOCK PROTOCOL" : "EXPAND DEPLOYMENT"}
                                                    {unlocked.includes(protocol.id) ? <LockOpen className="ml-2 h-4 w-4" /> : <Lock className="ml-2 h-4 w-4" />}
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    {/* Highlight Glow */}
                                    {protocol.highlight && !unlocked.includes(protocol.id) && (
                                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 blur-[60px] pointer-events-none group-hover:opacity-100 transition-opacity"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Advanced Recon Grid (ADVANCED RECON) */}
                <section className="py-32 bg-zinc-950 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,77,0,0.05),transparent_70%)] pointer-events-none"></div>
                    <div className="container-custom relative z-10">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center gap-2 mb-3">
                                {isClientSignedUp ? (
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Recon Intel: Unlocked
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                                        <Lock className="h-3 w-3" />
                                        Advanced Recon // Client Sign Up Required
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xs font-black text-primary tracking-[0.5em] uppercase mb-4">Elite Intelligence</h2>
                            <h3 className="text-4xl md:text-6xl font-black tracking-tight italic uppercase">
                                ADVANCED <span className="text-primary not-italic">RECON</span>
                            </h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10">
                            {advancedProtocols.map((protocol) => (
                                <div
                                    key={protocol.id}
                                    className={cn(
                                        "group relative flex flex-col p-1 bg-zinc-950 rounded-[2.5rem] border transition-all duration-700 overflow-hidden",
                                        protocol.highlight ? "border-primary/50 shadow-[0_0_50px_rgba(255,77,0,0.1)]" : "border-white/5 hover:border-white/20"
                                    )}
                                >
                                    {/* Inner Card */}
                                    <div className="p-8 flex-1 flex flex-col rounded-[2.3rem] bg-black transition-colors">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <Target className="h-7 w-7" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-primary tracking-widest uppercase mb-1">TARGET</p>
                                                <p className="text-lg font-black italic text-white tracking-tighter">{protocol.kcal} <span className="text-[9px] not-italic text-gray-600">KCAL</span></p>
                                            </div>
                                        </div>

                                        <h4 className="text-xl font-black italic uppercase tracking-tight text-white mb-1 group-hover:text-primary transition-colors">{protocol.title}</h4>
                                        <p className="text-[9px] font-black text-gray-500 tracking-[0.2em] mb-6 uppercase">{protocol.category}</p>

                                        {!isClientSignedUp ? (
                                            /* Locked State for Non-Signed-up Clients */
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div className="bg-zinc-950/90 rounded-2xl p-5 border border-red-500/20 mb-6 relative overflow-hidden text-center flex flex-col items-center justify-center min-h-[220px]">
                                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.1),transparent_70%)] pointer-events-none" />
                                                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-3 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                                        <Lock className="h-6 w-6" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400 mb-1">
                                                        ADVANCED RECON // LOCKED
                                                    </span>
                                                    <p className="text-xs font-bold text-gray-400 italic max-w-[210px] mb-4 leading-relaxed">
                                                        High-performance recon fueling formulas require active client signup.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setModalTab("verify");
                                                            setIsClearanceModalOpen(true);
                                                        }}
                                                        className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <span>Verify Registered Email</span>
                                                        <ChevronRight className="h-3 w-3" />
                                                    </button>
                                                </div>

                                                <div className="bg-zinc-950 rounded-2xl p-4 border border-white/5 mb-6 opacity-60">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[8px] font-black tracking-widest text-gray-400 uppercase">Macro Targets</span>
                                                        <span className="text-[8px] font-black text-red-400 uppercase tracking-wider">Locked</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {Object.entries(protocol.macros).map(([type, val]) => (
                                                            <div key={type}>
                                                                <p className="text-sm font-black italic text-gray-300 leading-none">{val}</p>
                                                                <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest mt-1">{type}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => {
                                                        setModalTab("signup");
                                                        setIsClearanceModalOpen(true);
                                                    }}
                                                    className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all bg-white/10 hover:bg-primary text-white border border-white/10 hover:border-primary flex items-center justify-center gap-2 cursor-pointer shadow-lg group/btn"
                                                >
                                                    <span>SIGN UP TO UNLOCK</span>
                                                    <Lock className="h-4 w-4 text-primary group-hover/btn:text-white transition-colors" />
                                                </Button>
                                            </div>
                                        ) : (
                                            /* Unlocked State for Signed-Up Clients */
                                            <>
                                                {unlocked.includes(protocol.id) ? (
                                                    <div className="space-y-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
                                                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                Recon Intel Active
                                                            </span>
                                                            <span className="text-[8px] font-mono text-gray-500">{protocol.meals.length} Deployments</span>
                                                        </div>
                                                        {protocol.meals.map((meal, idx) => (
                                                            <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 group/meal hover:border-primary/30 transition-colors">
                                                                <p className="text-[8px] font-black text-primary uppercase mb-1">Meal {idx + 1}</p>
                                                                <p className="text-[11px] font-bold text-white italic leading-tight">{meal}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-gray-400 font-bold text-sm italic leading-relaxed mb-8 flex-1">
                                                            {protocol.desc}
                                                        </p>

                                                        {/* Macro Split */}
                                                        <div className="bg-zinc-950 rounded-3xl p-6 border border-white/5 mb-8">
                                                            <div className="flex justify-between items-end mb-4">
                                                                <span className="text-[9px] font-black tracking-widest text-primary uppercase">Macro Split</span>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-3">
                                                                {Object.entries(protocol.macros).map(([type, val]) => (
                                                                    <div key={type}>
                                                                        <p className="text-base font-black italic text-white leading-none">{val}</p>
                                                                        <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest mt-1">{type}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <ul className="space-y-2.5 mb-10">
                                                            {protocol.features.map((feature, i) => (
                                                                <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-gray-500 italic">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                                                                    {feature}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </>
                                                )}

                                                <Button
                                                    onClick={() => toggleUnlock(protocol.id)}
                                                    className={cn(
                                                        "w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all cursor-pointer",
                                                        unlocked.includes(protocol.id)
                                                            ? "bg-primary text-white hover:bg-orange-600"
                                                            : "bg-white text-black group-hover:bg-primary group-hover:text-white"
                                                    )}
                                                >
                                                    {unlocked.includes(protocol.id) ? "LOCK PROTOCOL" : "EXPAND DEPLOYMENT"}
                                                    {unlocked.includes(protocol.id) ? <LockOpen className="ml-2 h-4 w-4" /> : <Lock className="ml-2 h-4 w-4" />}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Supplements / Precision Gear */}
                <section className="py-32 relative overflow-hidden">
                    <div className="container-custom">
                        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[4rem] p-12 md:p-24 relative overflow-hidden">
                            {/* Decorative Background Text */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                                <span className="text-[25rem] font-black whitespace-nowrap">MICROS</span>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                                <div className="space-y-10">
                                    <div className="inline-block bg-primary text-white text-[10px] font-black tracking-[0.4em] uppercase px-4 py-2 rounded-xl italic">
                                        Precision Micronutrients
                                    </div>
                                    <h2 className="text-4xl md:text-7xl font-black italic uppercase leading-none tracking-tighter">
                                        BEYOND THE <br /><span className="text-primary not-italic uppercase">CALORIE.</span>
                                    </h2>
                                    <p className="text-xl text-gray-400 font-bold italic leading-relaxed">
                                        Elite performance is balanced on a razor&apos;s edge of nutrient density. Generic supplementation protocols are a waste of operational capital.
                                    </p>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="flex items-start gap-4">
                                            <Droplets className="h-6 w-6 text-primary shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-black uppercase text-white tracking-widest mb-1">Hydration</h4>
                                                <p className="text-xs text-gray-500 font-bold italic">Cellular conductivity and recovery speed management.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <Scale className="h-6 w-6 text-primary shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-black uppercase text-white tracking-widest mb-1">Recovery</h4>
                                                <p className="text-xs text-gray-500 font-bold italic">Post-mission inflammatory control and neurological repair.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative aspect-square md:aspect-auto md:h-[500px] rounded-[3rem] overflow-hidden group">
                                    <div className="absolute inset-0 bg-primary/20 group-hover:opacity-0 transition-opacity duration-700 z-10"></div>
                                    <img
                                        src="/gallery/img-5.jpg"
                                        alt="Meal Prep Precision"
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-20"></div>
                                    <div className="absolute bottom-10 left-10 z-30">
                                        <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md border border-white/10 px-6 py-4 rounded-3xl">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                                            <p className="text-xs font-black tracking-widest uppercase text-white italic">Live Protocol Monitoring active</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ / Direct Feed */}
                <section className="py-32 bg-black">
                    <div className="container-custom text-center">
                        <div className="max-w-3xl mx-auto space-y-12">
                            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                                CUSTOM <span className="text-primary not-italic">INTELLIGENCE</span> REQUIRED?
                            </h2>
                            <p className="text-gray-500 text-lg font-bold italic max-w-xl mx-auto">
                                If your physiological profile requires specific biomechanical adjustments or dietary exemptions, contact the commander directly.
                            </p>
                            <Button size="lg" className="h-20 px-16 rounded-full bg-primary hover:bg-orange-600 text-white font-black text-xl uppercase tracking-widest italic transition-all hover:scale-105" asChild>
                                <Link href="/contact">Request Custom Assessment</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Client Clearance & Signup Modal */}
            <AnimatePresence>
                {isClearanceModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsClearanceModalOpen(false)}
                            className="fixed inset-0 bg-black/85 backdrop-blur-xl"
                        />

                        {/* Modal Body */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-zinc-950 border border-white/10 rounded-[2.5rem] p-6 sm:p-10 max-w-lg w-full shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden z-10"
                        >
                            {/* Header glow */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                            <button
                                onClick={() => setIsClearanceModalOpen(false)}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                                    <KeyRound className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Trainee Access Protocol</p>
                                    <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-white">Client Clearance</h3>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="grid grid-cols-2 p-1 bg-black/60 rounded-2xl border border-white/10 mb-6">
                                <button
                                    type="button"
                                    onClick={() => { setModalTab("verify"); setStatusMessage(null); }}
                                    className={cn(
                                        "py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                                        modalTab === "verify" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    Verify Email
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setModalTab("signup"); setStatusMessage(null); }}
                                    className={cn(
                                        "py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                                        modalTab === "signup" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    Quick Sign Up
                                </button>
                            </div>

                            {statusMessage && (
                                <div className={cn(
                                    "p-4 rounded-2xl border mb-6 text-xs font-bold flex items-center gap-3",
                                    statusMessage.type === "success"
                                        ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                                        : "bg-red-950/40 border-red-500/30 text-red-300"
                                )}>
                                    {statusMessage.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                                    <span>{statusMessage.text}</span>
                                </div>
                            )}

                            {modalTab === "verify" ? (
                                <form onSubmit={handleVerifySubmit} className="space-y-4">
                                    <p className="text-xs text-gray-400 font-bold leading-relaxed italic">
                                        Already booked or enrolled? Enter the email associated with your intake session to unlock all protocols immediately.
                                    </p>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Registered Client Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                            <Input
                                                type="email"
                                                required
                                                placeholder="e.g. samuel.adebayo@lagosops.ng"
                                                value={verifyEmail}
                                                onChange={(e) => setVerifyEmail(e.target.value)}
                                                className="pl-12 h-14 bg-black/50 border-white/10 rounded-2xl text-sm text-white focus:border-primary"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-primary hover:bg-orange-600 text-white shadow-xl mt-4 cursor-pointer"
                                    >
                                        {isSubmitting ? "Verifying Telemetry..." : "Authorize & Unlock Protocols"}
                                    </Button>

                                    <div className="pt-4 border-t border-white/5 text-center">
                                        <p className="text-xs text-gray-500 font-bold">
                                            Need a 1-to-1 training deployment?{" "}
                                            <Link
                                                href="/booking"
                                                onClick={() => setIsClearanceModalOpen(false)}
                                                className="text-primary hover:underline font-black"
                                            >
                                                Book an Intake Session &rarr;
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleSignupSubmit} className="space-y-4">
                                    <p className="text-xs text-gray-400 font-bold leading-relaxed italic">
                                        Sign up instantly as a trainee to gain complete dietary clearance and activate all Mission Parameters & Advanced Recon meal blueprints.
                                    </p>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                            <Input
                                                type="text"
                                                required
                                                placeholder="e.g. Alex Morgan"
                                                value={signupName}
                                                onChange={(e) => setSignupName(e.target.value)}
                                                className="pl-12 h-14 bg-black/50 border-white/10 rounded-2xl text-sm text-white focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                            <Input
                                                type="email"
                                                required
                                                placeholder="alex.morgan@ops.com"
                                                value={signupEmail}
                                                onChange={(e) => setSignupEmail(e.target.value)}
                                                className="pl-12 h-14 bg-black/50 border-white/10 rounded-2xl text-sm text-white focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Primary Objective (Optional)</label>
                                        <Input
                                            type="text"
                                            placeholder="e.g. Lean hypertrophy, conditioning"
                                            value={signupGoal}
                                            onChange={(e) => setSignupGoal(e.target.value)}
                                            className="h-14 bg-black/50 border-white/10 rounded-2xl text-sm text-white focus:border-primary"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-primary hover:bg-orange-600 text-white shadow-xl mt-4 cursor-pointer"
                                    >
                                        {isSubmitting ? "Registering Trainee..." : "Sign Up & Unlock Clearance"}
                                    </Button>

                                    <div className="pt-4 border-t border-white/5 text-center">
                                        <p className="text-xs text-gray-500 font-bold">
                                            Or schedule a 1-to-1 deployment:{" "}
                                            <Link
                                                href="/booking"
                                                onClick={() => setIsClearanceModalOpen(false)}
                                                className="text-primary hover:underline font-black"
                                            >
                                                Select Command Tier &rarr;
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}
