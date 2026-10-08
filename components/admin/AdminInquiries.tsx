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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-white border border-slate-200 shadow-sm rounded-3xl text-slate-900">
                <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight text-zinc-950">Website Signals & Inquiries</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Prospective trainees who submitted messages through the contact portal.</p>
                </div>
            </div>

            {/* Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search leads by name, email, mission objective..."
                        className="h-12 pl-11 bg-white border-slate-300 rounded-xl font-bold text-sm text-zinc-950 placeholder:text-slate-400 shadow-xs focus:border-primary"
                    />
                </div>

                <div className="sm:col-span-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-12 bg-white border border-slate-300 rounded-xl px-4 font-bold text-xs uppercase tracking-wider text-zinc-950 focus:outline-none focus:border-primary shadow-xs"
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
                <div className="text-center py-24 bg-white border border-slate-200 shadow-sm rounded-3xl">
                    <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-zinc-950 mb-1">No Inquiries Found</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Submissions from the website /contact form will stream in here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((inq) => (
                        <div
                            key={inq.id}
                            className="p-6 bg-white border border-slate-200 hover:border-primary/40 rounded-3xl space-y-4 transition-all shadow-sm text-slate-900"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg italic border border-primary/20 shrink-0">
                                        {inq.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black uppercase italic text-zinc-950 text-lg tracking-tight">{inq.name}</h4>
                                            <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                                inq.status === "new"
                                                    ? "bg-primary text-white animate-pulse"
                                                    : inq.status === "converted"
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                            }`}>
                                                {inq.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-bold">{inq.email} {inq.phone ? `• ${inq.phone}` : ''}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    <span className="text-[10px] text-slate-400 font-bold block mr-2">
                                        {new Date(inq.createdAt).toLocaleDateString()}
                                    </span>
                                    <select
                                        value={inq.status}
                                        onChange={(e) => onUpdateStatus(inq.id, e.target.value as Inquiry['status'])}
                                        className="h-9 px-3 bg-slate-50 border border-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-800 focus:outline-none focus:border-primary shadow-2xs"
                                    >
                                        <option value="new">Mark New</option>
                                        <option value="contacted">Mark Contacted</option>
                                        <option value="converted">Mark Converted</option>
                                        <option value="archived">Mark Archived</option>
                                    </select>
                                </div>
                            </div>

                            {/* Message / Objective */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary block mb-1">Mission Objective</span>
                                <p className="text-xs text-slate-700 font-medium leading-relaxed">{inq.objective}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={() => onConvertToBooking(inq)}
                                        className="h-10 px-4 rounded-xl bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-md shadow-orange-500/25 cursor-pointer"
                                    >
                                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Convert to Trainee Intake
                                    </Button>

                                    <Button
                                        asChild
                                        className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-zinc-950 font-black uppercase tracking-widest text-xs cursor-pointer shadow-xs"
                                    >
                                        <a href={`mailto:${inq.email}?subject=TthePT Performance Consultation`}>
                                            <Mail className="h-3.5 w-3.5 mr-1.5 text-primary" /> Transmit Email
                                        </a>
                                    </Button>
                                </div>

                                <button
                                    onClick={() => onDeleteInquiry(inq.id, inq.name)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
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
