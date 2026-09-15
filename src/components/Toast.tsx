'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error' | 'warning';
}

export function showToast(message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('supermalazz-toast', {
        detail: { message, type },
      })
    );
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (e: any) => {
      if (e.detail?.message) {
        const newToast: ToastMessage = {
          id: `${Date.now()}-${Math.random()}`,
          message: e.detail.message,
          type: e.detail.type || 'success',
        };

        setToasts((prev) => [...prev.slice(-2), newToast]); // Keep max 3 toasts

        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, 3200);
      }
    };

    window.addEventListener('supermalazz-toast', handleToast);
    return () => window.removeEventListener('supermalazz-toast', handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success' || !toast.type;
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 border-2 border-[#0A1128] rounded-xl shadow-[4px_4px_0px_#0A1128] transition-all animate-in slide-in-from-bottom-3 duration-200 ${
              isError
                ? 'bg-red-100 text-red-950'
                : isSuccess
                ? 'bg-emerald-100 text-emerald-950'
                : 'bg-amber-100 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isError ? (
                <AlertCircle className="w-5 h-5 text-[#E31B23] shrink-0" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-black tracking-tight leading-snug">
                {toast.message}
              </span>
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="p-1 rounded-lg hover:bg-black/5 text-[#0A1128] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
