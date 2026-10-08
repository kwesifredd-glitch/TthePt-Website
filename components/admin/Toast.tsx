"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

export type ToastMessage = {
    id: string;
    type: "success" | "error" | "info";
    text: string;
};

interface ToastProps {
    toasts: ToastMessage[];
    onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />,
        error: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
        info: <Info className="h-5 w-5 text-blue-400 shrink-0" />,
    };

    const borders = {
        success: "border-primary/40 bg-zinc-950/95 shadow-[0_0_25px_rgba(255,77,0,0.25)]",
        error: "border-red-500/40 bg-zinc-950/95 shadow-[0_0_25px_rgba(239,68,68,0.25)]",
        info: "border-blue-500/40 bg-zinc-950/95 shadow-[0_0_25px_rgba(59,130,246,0.25)]",
    };

    return (
        <div
            className={`pointer-events-auto flex items-center justify-between gap-4 p-4 rounded-2xl border backdrop-blur-xl transition-all animate-in slide-in-from-bottom-5 duration-300 ${borders[toast.type]}`}
        >
            <div className="flex items-center gap-3">
                {icons[toast.type]}
                <p className="text-xs font-black uppercase tracking-wider text-white">{toast.text}</p>
            </div>
            <button
                onClick={() => onDismiss(toast.id)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
