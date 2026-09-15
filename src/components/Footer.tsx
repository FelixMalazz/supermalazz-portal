import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, MessageSquare, Radio, Camera } from 'lucide-react';

export default function Footer() {
  const inviteUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE || 'https://discord.com/invite/Vqm3qCAE';

  return (
    <footer className="bg-[#0A1128] text-white border-t-4 border-[#E31B23] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white border-2 border-white rounded-xl flex items-center justify-center p-1 shadow-[3px_3px_0px_#E31B23] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="SuperMalazz Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-black text-2xl tracking-tight text-white">
                SUPER<span className="text-[#E31B23]">MALAZZ</span>
              </span>
            </div>
            <p className="text-slate-300 text-sm max-w-md mb-4 leading-relaxed font-medium">
              Komunitas santai untuk mabar, ngobrol bebas, dan seru-seruan tanpa beban.
              Tempat bernaung para gamer kasual dan hardcore yang mengedepankan respek dan keseruan bersama.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sistem Role Otomatis Discord RBAC</span>
            </div>
          </div>

          {/* Col 2: Navigasi Cepat */}
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider text-[#F59E0B] mb-4">
              Menu Portal
            </h4>
            <ul className="space-y-2 text-sm text-slate-300 font-medium">
              <li>
                <Link href="/" className="hover:text-[#E31B23] transition-colors">
                  Beranda & Rules
                </Link>
              </li>
              <li>
                <Link href="/galeri" className="hover:text-[#E31B23] transition-colors flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-red-400" />
                  <span>Galeri & Momen</span>
                </Link>
              </li>
              <li>
                <Link href="/members" className="hover:text-[#E31B23] transition-colors flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Warga Live Discord</span>
                </Link>
              </li>
              <li>
                <Link href="/pengumuman" className="hover:text-[#E31B23] transition-colors">
                  Pengumuman Komunitas
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Discord Server */}
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider text-[#F59E0B] mb-4">
              Server Tongkrongan
            </h4>
            <p className="text-xs text-slate-300 mb-3">
              Yuk mampir dan ngobrol langsung bareng homies di server Discord SuperMalazz.
            </p>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black text-white bg-[#5865F2] hover:bg-[#4752C4] border-2 border-white rounded-lg shadow-[2px_2px_0px_white] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Gabung Discord Server</span>
            </a>
          </div>

        </div>

        {/* Bottom divider & copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} SuperMalazz Community. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Dibuat untuk tongkrongan santai dengan <Heart className="w-3.5 h-3.5 text-[#E31B23] fill-current" />
          </p>
        </div>
      </div>
    </footer>
  );
}
