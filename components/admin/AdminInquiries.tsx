"use client";

import { useState } from "react";
import { Mail, MessageSquare, Plus, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Inquiry } from "@/lib/store";

interface AdminInquiriesProps {
    inquiries: Inquiry[];
    onConvertToBooking: (inquiry: Inquiry) => void;
    onUpdateStatus: (id: string, status: Inquiry['status']) => void;
    onDeleteInquiry: (id: string, name: string) => void;
}

export function AdminInquiries({
    inquiries,
    onConvertToBooking,
    onUpdateStatus,
    onDeleteInquiry,
}: AdminInquiriesProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filtered = inquiries.filter((inq) => {
        const matchesSearch =
            inq.name.toLowerCase().includes(search.toLowerCase()) ||
            inq.email.toLowerCase().includes(search.toLowerCase()) ||
            inq.objective.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === "all" || inq.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-zinc-950 border border-white/10 rounded-3xl">
                <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight">Website Signals & Inquiries</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Prospective trainees who submitted messages through the contact portal.</p>
                </div>
            </div>

            {/* Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search leads by name, email, mission objective..."
                        className="h-12 pl-11 bg-zinc-950 border-white/10 rounded-xl font-bold text-sm text-white placeholder:text-gray-600"
                    />
                </div>

                <div className="sm:col-span-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-12 bg-zinc-950 border border-white/10 rounded-xl px-4 font-bold text-xs uppercase tracking-wider text-white focus:outline-none focus:border-primary"
                    >
                        <option value="all">Lead Status: All</option>
                        <option value="new">New Submissions</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted to Client</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-24 bg-zinc-950 border border-white/10 rounded-3xl">
                    <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white mb-1">No Inquiries Found</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Submissions from the website /contact form will stream in here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((inq) => (
                        <div
                            key={inq.id}
                            className="p-6 bg-zinc-950 border border-white/10 hover:border-primary/40 rounded-3xl space-y-4 transition-all"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg italic border border-primary/20 shrink-0">
                                        {inq.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black uppercase italic text-white text-lg tracking-tight">{inq.name}</h4>
                                            <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                                inq.status === "new"
                                                    ? "bg-primary text-white animate-pulse"
                                                    : inq.status === "converted"
                                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                    : "bg-white/10 text-gray-400"
                                            }`}>
                                                {inq.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-bold">{inq.email} {inq.phone ? `• ${inq.phone}` : ''}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <span className="text-[10px] text-gray-500 font-bold block mr-2">
                                        {new Date(inq.createdAt).toLocaleDateString()}
                                    </span>
                                    <select
                                        value={inq.status}
                                        onChange={(e) => onUpdateStatus(inq.id, e.target.value as Inquiry['status'])}
                                        className="h-9 px-3 bg-zinc-900 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-300 focus:outline-none focus:border-primary"
                                    >
                                        <option value="new">Mark New</option>
                                        <option value="contacted">Mark Contacted</option>
                                        <option value="converted">Mark Converted</option>
                                        <option value="archived">Mark Archived</option>
                                    </select>
                                </div>
                            </div>

                            {/* Message / Objective */}
                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">Mission Objective</span>
                                <p className="text-xs text-gray-300 font-medium leading-relaxed">{inq.objective}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={() => onConvertToBooking(inq)}
                                        className="h-10 px-4 rounded-xl bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-[0_0_15px_rgba(255,77,0,0.3)] cursor-pointer"
                                    >
                                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Convert to Trainee Intake
                                    </Button>

                                    <Button
                                        asChild
                                        className="h-10 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs cursor-pointer"
                                    >
                                        <a href={`mailto:${inq.email}?subject=TthePT Performance Consultation`}>
                                            <Mail className="h-3.5 w-3.5 mr-1.5 text-primary" /> Transmit Email
                                        </a>
                                    </Button>
                                </div>

                                <button
                                    onClick={() => onDeleteInquiry(inq.id, inq.name)}
                                    className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                                    title="Purge Lead"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
