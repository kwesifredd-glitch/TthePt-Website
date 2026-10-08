"use client";

import { useState } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminScheduleProps {
    availableHours: string[];
    onSave: (hours: string[]) => void;
}

export function AdminSchedule({ availableHours, onSave }: AdminScheduleProps) {
    const [hours, setHours] = useState<string[]>(availableHours);
    const [newHour, setNewHour] = useState("08:00");
    const [saving, setSaving] = useState(false);

    const handleAddHour = () => {
        if (!newHour) return;
        if (hours.includes(newHour)) {
            alert("This time slot is already active.");
            return;
        }
        const updated = [...hours, newHour].sort();
        setHours(updated);
    };

    const handleRemoveHour = (h: string) => {
        const updated = hours.filter(item => item !== h);
        setHours(updated);
    };

    const handleSaveSchedule = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ availableHours: hours })
            });
            const data = await res.json();
            if (data.success) {
                onSave(hours);
                alert("Operational time slots synchronized.");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to save schedule.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-10 space-y-8 shadow-sm text-slate-900">
            <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-2 border border-primary/20">
                    <Clock className="h-3.5 w-3.5" />
                    Operational Capacity
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tight text-zinc-950">Daily Training Slots</h3>
                <p className="text-slate-500 text-xs mt-1">Configure client appointment availability shown on the booking calendar.</p>
            </div>

            {/* Add New Hour */}
            <div className="flex gap-3 max-w-md">
                <Input
                    type="time"
                    value={newHour}
                    onChange={(e) => setNewHour(e.target.value)}
                    className="h-12 bg-slate-50 border-slate-300 rounded-xl font-bold text-sm text-zinc-950 focus:border-primary focus:bg-white"
                />
                <Button
                    onClick={handleAddHour}
                    className="h-12 px-6 rounded-xl bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shrink-0 cursor-pointer shadow-sm"
                >
                    <Plus className="h-4 w-4 mr-1.5" /> Add Slot
                </Button>
            </div>

            {/* Current Active Hours */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Active Daily Slots</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {hours.map((h) => (
                        <div
                            key={h}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between group hover:border-primary/40 hover:bg-white shadow-xs transition-all"
                        >
                            <span className="font-mono font-bold text-sm text-zinc-950">{h} BST</span>
                            <button
                                type="button"
                                onClick={() => handleRemoveHour(h)}
                                className="text-slate-400 group-hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <Button
                onClick={handleSaveSchedule}
                disabled={saving}
                className="w-full h-14 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-xs transition-all cursor-pointer shadow-md"
            >
                {saving ? "Synchronizing Capacity..." : "Save Daily Training Slots"}
            </Button>
        </div>
    );
}
