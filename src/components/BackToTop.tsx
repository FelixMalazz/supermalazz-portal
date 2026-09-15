'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      title="Kembali ke atas"
      aria-label="Kembali ke atas"
      className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-40 w-12 h-12 flex items-center justify-center bg-[#F59E0B] hover:bg-[#E31B23] text-[#0A1128] hover:text-white border-2 border-[#0A1128] rounded-2xl shadow-[4px_4px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#0A1128] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer group animate-in fade-in zoom-in-75 duration-200"
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
}
