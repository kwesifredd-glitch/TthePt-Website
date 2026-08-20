"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/ui/animated-section";
import { motion } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  Shield,
  Zap,
  Star,
  Play,
  CheckCircle
} from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    quote: "MARCUS DOESN'T JUST GIVE YOU A WORKOUT; HE GIVES YOU A BLUEPRINT FOR DOMINANCE. MY RECOVERY AND PERFORMANCE HAVE NEVER BEEN AT THIS LEVEL.",
    author: "ALEXANDER V.",
    role: "TECH FOUNDER",
    duration: "18 MONTHS"
  },
  {
    quote: "THE PRECISION IS UNMATCHED. EVERY VARIABLE IS OPTIMIZED. IF YOU ARE SERIOUS ABOUT YOUR PHYSIQUE, THERE IS NO OTHER OPTION.",
    author: "SARAH J.",
    role: "AMATEUR ATHLETE",
    duration: "12 MONTHS"
  },
  {
    quote: "THE MENTAL TOUGHNESS I'VE DEVELOPED IS JUST AS VALUABLE AS THE PHYSICAL RESULTS. THIS IS ELITE LEVEL COACHING.",
    author: "JAMES R.",
    role: "OPERATIONS DIRECTOR",
    duration: "6 MONTHS"
  }
];

const galleryItems = [
  { type: 'image', src: '/gallery/img-1.jpg', title: 'FIELD OPERATOR 01', category: 'CONDITIONING' },
  { type: 'image', src: '/gallery/img-2.jpg', title: 'FIELD OPERATOR 02', category: 'EXPLOSIVE POWER' },
  { type: 'image', src: '/gallery/img-3.jpg', title: 'FIELD OPERATOR 03', category: 'POST-ISO ANALYSIS' },
  { type: 'video', src: '/gallery/img-4.jpg', title: 'PROTOCOL DRILL 01', category: 'KINETIC ANALYSIS', duration: '00:45' },
  { type: 'image', src: '/gallery/img-5.jpg', title: 'FIELD OPERATOR 04', category: 'RECOVERY PHASE' },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black overflow-x-hidden selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[95vh] pt-20 flex items-center bg-black overflow-hidden">
          {/* Background Image with Dynamic Gradient */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-new.jpg"
              alt="TthePT Elite Coaching"
              fill
              className="object-cover opacity-85 scale-105 transition-all duration-1000"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30"></div>
          </div>

          <div className="container-custom relative z-10 py-12 md:py-24 pl-4 sm:pl-6 lg:pl-8 -ml-2 sm:-ml-4 lg:-ml-8 xl:-ml-12">
            <StaggerContainer className="max-w-3xl space-y-6 md:space-y-8">
              <StaggerItem direction="down">
                <div className="inline-flex items-center gap-2 bg-primary/25 backdrop-blur-md text-primary px-4 py-2 rounded-full text-xs md:text-sm font-black tracking-[0.2em] uppercase border border-primary/40 shadow-[0_0_20px_rgba(255,77,0,0.3)]">
                  <Zap className="h-4 w-4 fill-primary" />
                  Elite Performance Coaching
                </div>
              </StaggerItem>

              <StaggerItem direction="up">
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.95] text-white uppercase italic drop-shadow-md">
                  ELITE <br />
                  <span className="text-primary not-italic">PERFORMANCE</span> <br />
                  COACHING
                </h1>
              </StaggerItem>

              <StaggerItem direction="up">
                <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-xl font-medium leading-relaxed drop-shadow-sm">
                  Transform your physique and mindset with science-backed training tailored for high achievers.
                </p>
              </StaggerItem>

              <StaggerItem direction="up">
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button size="lg" className="text-base md:text-lg px-8 md:px-10 h-14 md:h-16 rounded-full bg-primary hover:bg-orange-600 transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,77,0,0.4)] text-white" asChild>
                    <Link href="/booking">Start Your Transformation <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-base md:text-lg px-8 md:px-10 h-14 md:h-16 rounded-full border-white/40 bg-transparent text-white hover:bg-white hover:text-black transition-all backdrop-blur-sm" asChild>
                    <Link href="/about">The Method</Link>
                  </Button>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="absolute bottom-8 right-8 hidden lg:block z-10"
          >
            <div className="bg-black/60 backdrop-blur-xl p-6 rounded-3xl flex items-center gap-6 border border-white/10 shadow-2xl">
              <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-black text-white">500+</span>
                <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase">Successes</span>
              </div>
              <div className="h-10 w-[1px] bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-black text-white">12+</span>
                <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase">Pro Certs</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Feature Grid - The "Why" */}
        <section className="py-20 md:py-32 bg-white text-black">
          <div className="container-custom">
            <AnimatedSection className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-end mb-16 md:mb-24">
              <div>
                <h2 className="text-xs font-black text-primary tracking-[0.3em] uppercase mb-3">The Advantage</h2>
                <h3 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight uppercase italic">
                  NOT JUST <br /><span className="not-italic text-primary">A WORKOUT.</span>
                </h3>
              </div>
              <p className="text-lg md:text-xl text-gray-600 max-w-md font-medium leading-relaxed">
                We blend biomechanics, nutrition, and psychology to deliver sustainable, world-class results.
              </p>
            </AnimatedSection>

            <StaggerContainer className="grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: Target,
                  title: "Precision Programming",
                  desc: "Every rep and calorie is accounted for based on your specific metabolism and goals."
                },
                {
                  icon: Shield,
                  title: "Longevity Focused",
                  desc: "Train harder for longer. We prioritize joint health and mobility alongside strength."
                },
                {
                  icon: Users,
                  title: "Elite Community",
                  desc: "Join a network of high-performers who push each other to be better every day."
                }
              ].map((feature, idx) => (
                <StaggerItem key={idx}>
                  <div className="group h-full p-8 md:p-10 rounded-3xl bg-zinc-50 border border-zinc-200/80 hover:bg-black hover:text-white transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                    <div className="bg-primary/10 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-primary mb-6 md:mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-110">
                      <feature.icon className="h-7 w-7 md:h-8 md:w-8" />
                    </div>
                    <h4 className="text-xl md:text-2xl font-black mb-3 tracking-tight uppercase italic">{feature.title}</h4>
                    <p className="text-muted-foreground group-hover:text-gray-400 transition-colors font-medium leading-relaxed text-base md:text-lg">
                      {feature.desc}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Gallery Section - THE VAULT */}
        <section className="py-20 md:py-32 bg-zinc-950 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[140px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

          <div className="container-custom">
            <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-20">
              <div>
                <h2 className="text-xs font-black text-primary tracking-[0.4em] uppercase mb-3">Visual Evidence</h2>
                <h3 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter italic uppercase leading-none">THE <span className="text-primary not-italic">VAULT</span></h3>
              </div>
              <p className="text-gray-400 max-w-md font-bold uppercase tracking-widest text-xs md:text-sm italic">
                Declassified footage of elite personnel during operation-ready conditioning phases.
              </p>
            </AnimatedSection>

            {/* Responsive Vault Grid: Single Column on Mobile, 12-Col Grid on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[600px] md:h-[750px]">
              {/* Item 1 - Tall */}
              <AnimatedSection direction="left" className="md:col-span-4 h-[350px] md:h-auto relative group overflow-hidden rounded-[2rem] border border-white/10">
                <Image src={galleryItems[0].src} alt={galleryItems[0].title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[10px] font-black text-primary tracking-[0.3em] mb-1 uppercase">{galleryItems[0].category}</p>
                  <h4 className="text-xl md:text-2xl font-black italic uppercase text-white tracking-tighter">{galleryItems[0].title}</h4>
                </div>
              </AnimatedSection>

              {/* Middle Column */}
              <div className="md:col-span-5 grid grid-cols-1 gap-6 md:grid-rows-2">
                <AnimatedSection direction="up" className="h-[280px] md:h-auto relative group overflow-hidden rounded-[2rem] border border-white/10">
                  <Image src={galleryItems[1].src} alt={galleryItems[1].title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[10px] font-black text-primary tracking-[0.3em] mb-1 uppercase">{galleryItems[1].category}</p>
                    <h4 className="text-xl font-black italic uppercase text-white tracking-tighter">{galleryItems[1].title}</h4>
                  </div>
                </AnimatedSection>

                <AnimatedSection direction="up" delay={0.1} className="h-[280px] md:h-auto relative group overflow-hidden rounded-[2rem] border border-white/10">
                  <Image src={galleryItems[3].src} alt={galleryItems[3].title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,77,0,0.5)]">
                      <Play className="h-7 w-7 md:h-8 md:w-8 fill-current ml-1" />
                    </motion.div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> VIDEO | {galleryItems[3].duration}
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[10px] font-black text-primary tracking-[0.3em] mb-1 uppercase">{galleryItems[3].category}</p>
                    <h4 className="text-xl font-black italic uppercase text-white tracking-tighter">{galleryItems[3].title}</h4>
                  </div>
                </AnimatedSection>
              </div>

              {/* Right Column */}
              <div className="md:col-span-3 grid grid-cols-1 gap-6 md:grid-rows-3">
                <AnimatedSection direction="right" className="h-[300px] md:h-auto md:row-span-2 relative group overflow-hidden rounded-[2rem] border border-white/10">
                  <Image src={galleryItems[2].src} alt={galleryItems[2].title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[10px] font-black text-primary tracking-[0.3em] mb-1 uppercase">{galleryItems[2].category}</p>
                    <h4 className="text-xl font-black italic uppercase text-white tracking-tighter">{galleryItems[2].title}</h4>
                  </div>
                </AnimatedSection>

                <AnimatedSection direction="right" delay={0.15} className="h-[220px] md:h-auto relative group overflow-hidden rounded-[2rem] border border-white/10">
                  <Image src={galleryItems[4].src} alt={galleryItems[4].title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90"></div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-[8px] font-black text-primary tracking-[0.3em] mb-1 uppercase">{galleryItems[4].category}</p>
                    <h4 className="text-sm font-black italic uppercase text-white tracking-tighter">{galleryItems[4].title}</h4>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Ticker */}
        <section className="py-20 md:py-32 bg-black text-white relative overflow-hidden">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-xs font-black text-primary tracking-[0.4em] uppercase mb-3">Client Intel</h2>
            <h3 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight italic uppercase">Field <span className="text-primary not-italic">Reports</span></h3>
          </div>

          <div className="relative z-10">
            {/* Horizontal Ticker */}
            <div className="flex overflow-hidden select-none [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
              <div className="flex gap-6 py-4 animate-ticker hover:[animation-play-state:paused] whitespace-nowrap">
                {[...testimonials, ...testimonials, ...testimonials].map((t, idx) => (
                  <div key={idx} className="w-[320px] sm:w-[420px] flex-shrink-0 bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl group hover:border-primary/40 transition-all duration-500">
                    <div className="flex items-center gap-1 text-primary mb-4">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-primary" />)}
                    </div>
                    <p className="text-base md:text-lg font-black italic uppercase tracking-tight leading-snug mb-6 text-white/90 whitespace-normal">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-black text-xs text-primary italic border border-primary/30">
                          {t.author.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs md:text-sm font-black tracking-widest text-white italic">{t.author}</h4>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">TENURE</p>
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{t.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 text-center relative z-10 px-4">
            <div className="inline-flex items-center gap-3 bg-white/5 px-6 py-3.5 rounded-full border border-white/10 text-xs md:text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-bold text-gray-300">Join <span className="text-white font-black">500+</span> Elite Trainees Worldwide</span>
            </div>
          </div>
        </section>

        {/* Results / CTA */}
        <section className="py-0 overflow-hidden">
          <div className="relative bg-primary px-6 py-20 md:py-32">
            <AnimatedSection direction="up" className="container-custom relative z-10 flex flex-col items-center text-center">
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter mb-6 md:mb-8 italic uppercase leading-tight">
                Ready to be <br /><span className="not-italic">unbreakable?</span>
              </h2>
              <p className="text-white/95 text-lg md:text-2xl max-w-2xl font-bold mb-10 md:mb-12 leading-relaxed">
                Limited slots available for Q1 intake. Application required for new trainees.
              </p>
              <Button size="lg" className="bg-white text-black hover:bg-black hover:text-white text-lg md:text-xl px-10 md:px-14 h-16 md:h-20 rounded-full font-black transition-all hover:scale-105 shadow-2xl" asChild>
                <Link href="/booking">Secure Your Spot <ArrowRight className="ml-2 h-6 w-6" /></Link>
              </Button>
            </AnimatedSection>

            {/* Background Text Decor */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 overflow-hidden">
              <span className="text-[15rem] md:text-[22rem] font-black text-white whitespace-nowrap leading-none select-none uppercase">
                TTHEPT PERFORMANCE
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

