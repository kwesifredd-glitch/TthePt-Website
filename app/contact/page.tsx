"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Instagram } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
    const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        objective: ""
    });
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        setSubmitError(null);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`.trim() || formData.firstName || "Inquirer",
                    email: formData.email,
                    objective: formData.objective
                })
            });
            if (res.ok) {
                setStatus("success");
            } else {
                const data = await res.json().catch(() => ({}));
                setSubmitError(data.error || "Your message didn't send. Please try again.");
                setStatus("idle");
            }
        } catch (error) {
            console.error("Submission failed", error);
            setSubmitError("We couldn't reach the server. Check your connection and try again.");
            setStatus("idle");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            <Navbar />

            <main className="flex-1 pt-40 pb-32">
                <div className="container-custom relative">
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-3xl rounded-full -z-10 animate-pulse"></div>

                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-6 border border-primary/20">
                                <MessageSquare className="h-4 w-4" />
                                Direct Line
                            </div>
                            <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-6">
                                The <span className="text-primary not-italic">Dialogue</span>
                            </h1>
                            <p className="text-gray-400 text-xl font-medium max-w-xl mx-auto italic">
                                For inquiries, collaborations, or private consultation requests.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-12 gap-16 items-start">
                            {/* Contact Info */}
                            <div className="md:col-span-5 space-y-12">
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-black uppercase italic tracking-tight">Get In Touch</h2>
                                    <p className="text-gray-500 font-medium leading-relaxed">
                                        Headquarters is operational 24/7 for elite trainees. Response latency for new inquiries is typically less than 12 hours.
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    {[
                                        { icon: Instagram, label: "Instagram", val: "@_tthept__", href: "https://www.instagram.com/_tthept__?igsh=MzdjbmM2aGlnbnQ4" },
                                        {
                                            icon: ({ className }: { className?: string }) => (
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className={className}
                                                >
                                                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                                </svg>
                                            ),
                                            label: "TikTok",
                                            val: "@tthept",
                                            href: "https://www.tiktok.com/@tthept"
                                        }
                                    ].map((item, idx) => (
                                        <a
                                            key={idx}
                                            href={item.href}
                                            target={item.href.startsWith("http") ? "_blank" : undefined}
                                            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                            className="flex items-center gap-6 group"
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                <item.icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">{item.label}</p>
                                                <p className="font-bold text-white uppercase tracking-tight">{item.val}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="md:col-span-7 glass-card p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -rotate-45 translate-x-16 -translate-y-16 blur-xl"></div>

                                {status === "success" ? (
                                    <div className="text-center py-16 animate-in zoom-in duration-500">
                                        <div className="mx-auto w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,77,0,0.4)]">
                                            <Send className="h-10 w-10" />
                                        </div>
                                        <h3 className="text-3xl font-black uppercase italic mb-4">Message Sent</h3>
                                        <p className="text-gray-400 font-medium italic mb-8">Maintain readiness. Our team will contact you shortly.</p>
                                        <Button variant="outline" className="h-14 px-10 rounded-full border-white/10 text-white font-black uppercase tracking-widest hover:bg-white hover:text-black" onClick={() => setStatus("idle")}>
                                            New Submission
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                                        {submitError && (
                                            <div role="alert" className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-sm font-bold text-red-300">
                                                {submitError}
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">First name</label>
                                                <Input
                                                    placeholder="First name"
                                                    required
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-primary font-bold placeholder:text-white/30"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Last name</label>
                                                <Input
                                                    placeholder="Last name"
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-primary font-bold placeholder:text-white/30"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Email</label>
                                            <Input
                                                type="email"
                                                placeholder="you@example.com"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-primary font-bold placeholder:text-white/30"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Your goals</label>
                                            <Textarea
                                                placeholder="Tell us what you want to achieve and any questions you have..."
                                                className="min-h-[150px] bg-white/5 border-white/10 rounded-2xl focus:ring-primary font-bold placeholder:text-white/30 p-6"
                                                required
                                                value={formData.objective}
                                                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                                            />
                                        </div>

                                        <Button type="submit" className="w-full h-16 rounded-full bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest transition-all hover:scale-[1.02] shadow-xl" disabled={status === "submitting"}>
                                            {status === "submitting" ? "Sending..." : "Send Message"}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

