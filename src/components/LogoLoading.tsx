import React from 'react';

interface LogoLoadingProps {
  message?: string;
  subMessage?: string;
}

export default function LogoLoading({
  message = 'Menyiapkan Halaman...',
  subMessage = 'SuperMalazz Community Portal',
}: LogoLoadingProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A1128]/75 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-150 p-4">
      <div className="relative bg-white dark:bg-slate-900 border-3 border-[#0A1128] dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#E31B23] dark:shadow-[8px_8px_0px_#000000] flex flex-col items-center text-center max-w-xs sm:max-w-sm w-full mx-auto select-none">
        
        {/* Glow Background Effect */}
        <div className="absolute inset-0 bg-red-500/10 dark:bg-red-500/20 rounded-3xl blur-xl pointer-events-none" />

        {/* Logo Container with Smooth Pulse Animation */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 mb-3 flex items-center justify-center">
          {/* Subtle Outer Ping Halo */}
          <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-red-400/20 dark:bg-red-500/20 animate-ping opacity-60 pointer-events-none" />
          
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="SuperMalazz Logo"
            className="w-full h-full object-contain relative z-10 animate-logo-pulse drop-shadow-md"
          />
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F59E0B] text-[#0A1128] text-xs font-black uppercase tracking-wider rounded-xl border-2 border-[#0A1128] dark:border-slate-700 shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000] mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E31B23]"></span>
          </span>
          <span>{message}</span>
        </div>

        {/* Sub-label */}
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
          {subMessage}
        </p>

        {/* Neo-brutal Animated Progress Bar */}
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 border-2 border-[#0A1128] dark:border-slate-700 rounded-full overflow-hidden relative shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000]">
          <div className="h-full bg-gradient-to-r from-[#E31B23] via-[#F59E0B] to-[#E31B23] w-1/2 rounded-full animate-brutal-progress" />
        </div>
      </div>
    </div>
  );
}
