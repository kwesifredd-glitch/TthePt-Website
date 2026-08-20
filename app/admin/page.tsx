"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, Calendar, User, Mail, Clock, LayoutDashboard, Settings, LogOut, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { Booking } from "@/lib/store";
import { ContentManager } from "@/components/admin/ContentManager";
import { cn } from "@/lib/utils";

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"bookings" | "content">("bookings");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "admin123") {
            setIsAuthenticated(true);
            fetchBookings();
        } else {
            alert("Invalid password");
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/bookings");
            const data = await res.json();
            setBookings(data.bookings);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full"></div>

                <Card className="w-full max-w-md bg-zinc-900/50 border-white/5 backdrop-blur-xl relative z-10 shadow-2xl">
                    <CardHeader className="text-center pb-8">
                        <div className="mx-auto bg-primary/10 p-5 rounded-3xl w-fit mb-6 border border-primary/20">
                            <Lock className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-black uppercase italic tracking-tighter text-white">System Access</CardTitle>
                        <CardDescription className="text-gray-500 font-medium">Authentication required for command center.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Protocol Key</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-primary font-bold placeholder:text-white/10 text-center text-2xl tracking-[0.5em]"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full h-14 rounded-xl bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest transition-all">
                                Establish Connection
                            </Button>
                        </form>
                        <p className="text-[10px] text-center text-white/5 mt-8 font-black uppercase tracking-widest">Encrypted Session</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            <Navbar />

            <main className="flex-1 pt-32 pb-20">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-primary/20">
                                <LayoutDashboard className="h-3 w-3" />
                                Command Center
                            </div>
                            <h1 className="text-5xl font-black italic uppercase tracking-tighter">Operational <span className="text-primary not-italic">Data</span></h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" className="h-12 border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black" onClick={() => setIsAuthenticated(false)}>
                                <LogOut className="h-4 w-4 mr-2" /> End Session
                            </Button>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Sidebar */}
                        <aside className="lg:col-span-3 space-y-2">
                            {[
                                { id: "bookings", label: "Protocol Log", icon: Calendar },
                                { id: "content", label: "Intel Manager", icon: Settings },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-xs border text-left",
                                        activeTab === tab.id
                                            ? "bg-primary border-primary text-white shadow-[0_5px_15px_rgba(255,77,0,0.3)] scale-[1.02]"
                                            : "bg-white/5 border-transparent text-gray-500 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </aside>

                        {/* Content Area */}
                        <div className="lg:col-span-9">
                            <Card className="bg-zinc-950 border-white/5 min-h-[600px] shadow-2xl overflow-hidden">
                                {activeTab === "bookings" ? (
                                    <div className="p-0">
                                        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                                            <h2 className="text-2xl font-black uppercase italic tracking-tight">Active Bookings</h2>
                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                <div className="relative flex-1 md:w-64">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                    <Input className="pl-11 h-11 bg-white/5 border-white/10 text-sm font-bold placeholder:text-gray-600 rounded-xl" placeholder="Search signals..." />
                                                </div>
                                                <Button variant="outline" className="h-11 border-white/10 hover:bg-white/5 aspect-square p-0 rounded-xl">
                                                    <Filter className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="p-8">
                                            {loading ? (
                                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Decrypting Records...</p>
                                                </div>
                                            ) : bookings.length === 0 ? (
                                                <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[2rem]">
                                                    <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-sm">No Active Protocols</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {bookings.map((booking: any) => (
                                                        <div key={booking.id} className="group flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-[1.5rem] bg-white/5 border border-white/5 hover:border-primary/30 transition-all duration-300">
                                                            <div className="flex items-center gap-6">
                                                                <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl italic group-hover:bg-primary group-hover:text-white transition-all">
                                                                    {booking.name.charAt(0)}
                                                                </div>
                                                                 <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-xl font-black uppercase italic tracking-tight text-white">{booking.name}</p>
                                                                        {booking.package && (
                                                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                                                                                {booking.package} (£{booking.price})
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm font-bold text-gray-500">{booking.email}</p>
                                                                </div>
                                                            </div>

                                                            <div className="mt-6 md:mt-0 flex flex-col md:items-end gap-2">
                                                                <div className="flex items-center gap-3 bg-black/50 px-4 py-2 rounded-full border border-white/5">
                                                                    <Calendar className="h-3 w-3 text-primary" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{format(new Date(booking.date.includes("T") ? booking.date : booking.date + "T00:00:00"), "MMM dd, yyyy")}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3 bg-black/50 px-4 py-2 rounded-full border border-white/5">
                                                                    <Clock className="h-3 w-3 text-primary" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{booking.time}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8">
                                        <ContentManager />
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

