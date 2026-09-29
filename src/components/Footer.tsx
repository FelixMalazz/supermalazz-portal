import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, MessageSquare, Radio, Camera, Megaphone } from 'lucide-react';

export default function Footer() {
  const inviteUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE || 'https://discord.com/invite/Vqm3qCAE';

  return (
    <footer className="bg-[#0A1128] text-white border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-xs overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="SuperMalazz Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                SUPER<span className="text-[#E31B23]">MALAZZ</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm mb-4 leading-relaxed">
              Komunitas santai tongkrongan Discord resmi SuperMalazz untuk mabar, ngobrol, dan berbagi momen seru.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs font-medium text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sinkronisasi Role Discord Otomatis</span>
            </div>
          </div>

          {/* Col 2: Navigasi Cepat */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
              Navigasi
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/galeri" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-red-400" />
                  <span>Galeri Momen</span>
                </Link>
              </li>
              <li>
                <Link href="/members" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Warga Live</span>
                </Link>
              </li>
              <li>
                <Link href="/pengumuman" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pengumuman</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Discord Server */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
              Komunitas
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Bergabung di server Discord resmi kami dan rasakan keseruan mabar bersama warga.
            </p>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#5865F2] hover:bg-[#4752C4] rounded-lg shadow-xs hover:-translate-y-0.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Gabung Discord</span>
            </a>
          </div>

        </div>

        {/* Bottom divider & copyright */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} SuperMalazz. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Dibuat untuk tongkrongan SuperMalazz <Heart className="w-3 h-3 text-[#E31B23] fill-current inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
