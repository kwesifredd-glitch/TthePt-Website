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
        info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
    };

    const borders = {
        success: "border-primary/30 bg-white/95 shadow-xl shadow-orange-500/10",
        error: "border-red-300 bg-white/95 shadow-xl shadow-red-500/10",
        info: "border-blue-300 bg-white/95 shadow-xl shadow-blue-500/10",
    };

    return (
        <div
            className={`pointer-events-auto flex items-center justify-between gap-4 p-4 rounded-2xl border backdrop-blur-xl transition-all animate-in slide-in-from-bottom-5 duration-300 ${borders[toast.type]}`}
        >
            <div className="flex items-center gap-3">
                {icons[toast.type]}
                <p className="text-xs font-black uppercase tracking-wider text-zinc-950">{toast.text}</p>
            </div>
            <button
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-zinc-950 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
