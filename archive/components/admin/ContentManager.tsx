"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LayoutDashboard } from "lucide-react";

export function ContentManager() {
    const [content, setContent] = useState({ heroTitle: "", heroSubtitle: "" });
    const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

    useEffect(() => {
        fetch("/api/content")
            .then(res => res.json())
            .then(data => setContent(data))
            .catch(err => console.error(err));
    }, []);

    const handleSave = async () => {
        setStatus("saving");
        try {
            await fetch("/api/content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(content)
            });
            setStatus("saved");
            setTimeout(() => setStatus("idle"), 2000);
        } catch (error) {
            console.error(error);
            setStatus("idle");
        }
    };

    return (
        <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] p-6 sm:p-10 space-y-8 text-white">
            <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-2 border border-primary/20">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Homepage Intelligence
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tight">Homepage Content</h3>
                <p className="text-gray-400 text-xs mt-1">Directly modify the hero heading and narrative shown to trainees on the main landing page.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Hero Title</label>
                    <Input
                        value={content.heroTitle}
                        onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                        className="h-12 bg-white/5 border-white/10 font-bold text-sm text-white"
                    />
                    <p className="text-[10px] text-gray-500 font-mono">HTML formatting supported (e.g. &lt;span className=&quot;text-primary&quot;&gt;...&lt;/span&gt;)</p>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Hero Subtitle</label>
                    <Textarea
                        value={content.heroSubtitle}
                        onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
                        className="min-h-[120px] bg-white/5 border-white/10 rounded-xl p-4 font-medium text-sm text-gray-200"
                    />
                </div>

                <Button
                    onClick={handleSave}
                    disabled={status === "saving"}
                    className="w-full h-14 rounded-xl bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-[0_0_25px_rgba(255,77,0,0.4)] cursor-pointer"
                >
                    {status === "saving" ? "Updating Intelligence..." : status === "saved" ? "Intelligence Deployed!" : "Commit Content Updates"}
                </Button>
            </div>
        </div>
    );
}
