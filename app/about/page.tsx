"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import Link from "next/link";
import { Target, Zap, Shield, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-black text-white selection:bg-primary selection:text-white overflow-x-hidden">
            <Navbar />

            <main className="flex-1">
                {/* Header */}
                <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden border-b border-white/10">
                    <div className="container-custom relative z-10">
                        <AnimatedSection direction="down" className="max-w-3xl">
                            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter mb-4 sm:mb-6 italic uppercase leading-none">
                                The <span className="text-primary not-italic">Method</span>
                            </h1>
                            <p className="text-lg sm:text-2xl md:text-3xl text-gray-300 font-bold tracking-tight leading-tight">
                                We don&apos;t just train bodies. We architect peak performance through
                                uncompromising standards and scientific precision.
                            </p>
                        </AnimatedSection>
                    </div>
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 transform translate-x-1/4 pointer-events-none"></div>
                </section>

                {/* Bio Section */}
                <section className="py-20 md:py-32">
                    <div className="container-custom grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                        <AnimatedSection direction="left" className="relative group">
                            <div className="absolute -inset-4 bg-primary rotate-3 rounded-3xl opacity-20 group-hover:rotate-6 transition-transform duration-500"></div>
                            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl">
                                <Image
                                    src="/trainer-terrence.jpg"
                                    alt="Coach Terrence (TthePT)"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </AnimatedSection>

                        <StaggerContainer className="space-y-6 sm:space-y-8">
                            <StaggerItem direction="up">
                                <div className="inline-block bg-primary text-white text-xs font-black tracking-[0.3em] uppercase px-4 py-2 rounded-full shadow-[0_0_20px_rgba(255,77,0,0.3)]">
                                    Head Coach & Founder
                                </div>
                            </StaggerItem>

                            <StaggerItem direction="up">
                                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none uppercase italic">
                                    I&apos;M TERRENCE. <br />
                                    <span className="text-primary not-italic">TthePT.</span>
                                </h2>
                            </StaggerItem>

                            <StaggerItem direction="up">
                                <div className="space-y-4 sm:space-y-6 text-base sm:text-lg md:text-xl text-gray-300 font-medium leading-relaxed">
                                    <p>
                                        In my years in high-performance conditioning, I&apos;ve seen every fad, trend, and &quot;shortcut.&quot; They all fail because they ignore the fundamental truth of human physiology: <span className="text-white font-black italic">excellence is a deliberate daily occurrence.</span>
                                    </p>
                                    <p>
                                        My methodology is forged in the fires of elite athletics and refined by years of data-driven coaching. I specialize in taking high-performers from &quot;fit&quot; to &quot;unbreakable.&quot;
                                    </p>
                                </div>
                            </StaggerItem>

                        </StaggerContainer>
                    </div>
                </section>

                {/* Philosophy / Core Pillars */}
                <section className="py-20 md:py-32 bg-zinc-950 border-y border-white/5">
                    <div className="container-custom">
                        <StaggerContainer className="grid md:grid-cols-3 gap-8 md:gap-12">
                            {[
                                {
                                    icon: Zap,
                                    title: "Force Consistency",
                                    desc: "Intensity is a given. Consistency is the variable we manage. We build systems that make failure impossible."
                                },
                                {
                                    icon: Shield,
                                    title: "Structural Integrity",
                                    desc: "A Ferrari with a broken chassis can't go 200mph. We prioritize joint health and core stability as the foundation of power."
                                },
                                {
                                    icon: Target,
                                    title: "Bio-Individual Data",
                                    desc: "Generic plans get generic results. Your training is adjusted weekly based on your CNS recovery and metabolic markers."
                                }
                            ].map((pillar, idx) => (
                                <StaggerItem key={idx}>
                                    <div className="group h-full p-8 sm:p-12 rounded-3xl glass-card hover:border-primary/50 transition-all duration-500 hover:-translate-y-2">
                                        <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                                            <pillar.icon className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-black mb-4 tracking-tight uppercase italic">{pillar.title}</h3>
                                        <p className="text-gray-400 font-medium leading-relaxed text-base sm:text-lg">
                                            {pillar.desc}
                                        </p>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 md:py-32 relative overflow-hidden">
                    <AnimatedSection direction="up" className="container-custom text-center relative z-10">
                        <h2 className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 md:mb-8 italic uppercase tracking-tighter leading-tight">
                            Ready to <span className="text-primary not-italic uppercase">Evolve?</span>
                        </h2>
                        <Button size="lg" className="bg-primary hover:bg-orange-600 text-white font-black text-lg md:text-xl px-12 md:px-16 h-16 md:h-20 rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,77,0,0.4)]" asChild>
                            <Link href="/booking">Apply for Coaching <ArrowRight className="ml-2 h-6 w-6" /></Link>
                        </Button>
                    </AnimatedSection>
                    {/* Large Background Text */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                        <span className="text-[15rem] md:text-[30rem] font-black whitespace-nowrap uppercase">EVOLVE</span>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}


