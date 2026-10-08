"use client";

import { useState } from "react";
import { Archive, Radio, Settings, ShieldAlert } from "lucide-react";
import { GatewaySettings } from "@/lib/store";
import { AdminGateways } from "@/components/admin/AdminGateways";
import { ContentManager } from "@/components/admin/ContentManager";
import { cn } from "@/lib/utils";

interface AdminArchiveProps {
    gatewaySettings: GatewaySettings;
    onSaveGatewaySettings: (settings: GatewaySettings) => void;
    onWebhookSimulated?: (msg: string) => void;
}

export function AdminArchive({
    gatewaySettings,
    onSaveGatewaySettings,
    onWebhookSimulated
}: AdminArchiveProps) {
    const [archivedTab, setArchivedTab] = useState<"gateways" | "content">("gateways");

    return (
        <div className="space-y-8">
            {/* Archive Header Banner */}
            <div className="p-8 bg-zinc-950 border border-white/10 rounded-[2.5rem] relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Archive className="h-40 w-40 text-primary" />
                </div>

                <div className="relative z-10 space-y-4 max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                        <Archive className="h-3.5 w-3.5" />
                        Administrative Vault & Archive
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tight text-white">
                        Archived Systems & <span className="text-primary not-italic">Modules</span>
                    </h2>

                    <p className="text-sm text-gray-400 leading-relaxed font-medium">
                        Payment Gateways and Site Content have been removed from the active primary navigation and archived here.
                        All configurations, live webhook URLs, simulator tools, and content controllers are preserved and operational on demand.
                    </p>
                </div>

                {/* Submodule Switcher */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-3">
                    <button
                        onClick={() => setArchivedTab("gateways")}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs transition-all cursor-pointer border",
                            archivedTab === "gateways"
                                ? "bg-primary border-primary text-white shadow-[0_4px_20px_rgba(255,77,0,0.35)]"
                                : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                        )}
                    >
                        <Radio className="h-4 w-4" />
                        <span>Payment Gateways</span>
                        <span className="text-[9px] font-bold bg-black/40 px-2 py-0.5 rounded-md text-amber-300">
                            Archived
                        </span>
                    </button>

                    <button
                        onClick={() => setArchivedTab("content")}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs transition-all cursor-pointer border",
                            archivedTab === "content"
                                ? "bg-primary border-primary text-white shadow-[0_4px_20px_rgba(255,77,0,0.35)]"
                                : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                        )}
                    >
                        <Settings className="h-4 w-4" />
                        <span>Site Content</span>
                        <span className="text-[9px] font-bold bg-black/40 px-2 py-0.5 rounded-md text-amber-300">
                            Archived
                        </span>
                    </button>
                </div>
            </div>

            {/* Render the selected archived submodule */}
            <div className="relative">
                <div className="mb-4 flex items-center justify-between text-xs text-gray-500 font-mono px-2">
                    <span className="flex items-center gap-2">
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                        Viewing archived module: <strong className="text-gray-300 uppercase">{archivedTab === "gateways" ? "Payment Gateways & Inbound Webhooks" : "Site Content Manager"}</strong>
                    </span>
                    <span className="hidden sm:inline text-[11px] text-gray-600 font-bold uppercase tracking-widest">
                        Storage Location: /archive/components/admin/
                    </span>
                </div>

                {archivedTab === "gateways" ? (
                    <AdminGateways
                        settings={gatewaySettings}
                        onSaveSettings={onSaveGatewaySettings}
                        onWebhookSimulated={onWebhookSimulated || (() => {})}
                    />
                ) : (
                    <ContentManager />
                )}
            </div>
        </div>
    );
}
