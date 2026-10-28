"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "The Method", href: "/about" },
        { name: "Fuel & Training", href: "/meal-plans" },
        { name: "Booking", href: "/booking" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled
                    ? "bg-black/80 backdrop-blur-xl py-3 border-b border-white/10 shadow-2xl"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container-custom flex justify-between items-center h-14">
                {/* Logo */}
                <Link href="/" className="inline-flex flex-col leading-none group relative z-50 w-fit">
                    <span className="text-2xl md:text-3xl font-black tracking-tighter text-white group-hover:text-primary transition-colors">
                        Tthe<span className="text-primary italic group-hover:text-white transition-colors">PT</span>
                    </span>
                    <span className="text-[10px] font-black italic tracking-[0.15em] text-primary/90 mt-0.5 uppercase">
                        Personal Trainer
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "relative text-xs font-black tracking-[0.2em] uppercase transition-all duration-300 py-1.5",
                                    isActive ? "text-primary" : "text-gray-300 hover:text-white"
                                )}
                            >
                                {link.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                    <Button
                        size="sm"
                        className="rounded-full px-6 py-5 font-black tracking-widest uppercase text-xs bg-primary hover:bg-orange-600 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,77,0,0.3)]"
                        asChild
                    >
                        <Link href="/booking">Join Now</Link>
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden relative z-50">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle Navigation Menu"
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:text-primary hover:border-primary/50 transition-all active:scale-95"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Overlay & Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 right-0 z-50 pt-24 pb-10 px-6 bg-zinc-950/95 border-b border-white/10 backdrop-blur-2xl md:hidden shadow-2xl"
                        >
                            <div className="space-y-6 max-w-md mx-auto relative z-50">
                                <div className="space-y-2">
                                    {navLinks.map((link, idx) => {
                                        const isActive = pathname === link.href;
                                        return (
                                            <motion.div
                                                key={link.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 + 0.1 }}
                                            >
                                                <Link
                                                    href={link.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 rounded-2xl border transition-all text-xl font-black tracking-tighter uppercase italic cursor-pointer relative z-50",
                                                        isActive
                                                            ? "bg-primary/10 border-primary/40 text-primary"
                                                            : "bg-white/[0.02] border-white/5 text-white hover:bg-white/5 hover:border-white/20"
                                                    )}
                                                >
                                                    <span>{link.name}</span>
                                                    <ArrowRight className={cn("h-5 w-5", isActive ? "text-primary" : "opacity-30")} />
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                >
                                    <Button
                                        size="lg"
                                        className="w-full py-7 text-base font-black uppercase tracking-widest rounded-2xl bg-primary hover:bg-orange-600 shadow-[0_0_30px_rgba(255,77,0,0.4)] cursor-pointer relative z-50"
                                        asChild
                                    >
                                        <Link href="/booking" onClick={() => setIsOpen(false)}>
                                            Secure Your Spot <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;


