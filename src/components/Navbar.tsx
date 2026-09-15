'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Flame, 
  Megaphone, 
  Users, 
  Sparkles, 
  Radio, 
  LogIn, 
  LogOut, 
  Camera, 
  Menu, 
  X,
  Home
} from 'lucide-react';
import { UserSession } from '@/lib/types';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  user: UserSession | null;
  onlineCount?: number;
}

export default function Navbar({ user, onlineCount = 76 }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = () => {
    if (!user) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-[#0A1128] dark:border-slate-700 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          Tamu
        </span>
      );
    }

    switch (user.role) {
      case 'CHEF':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-[#F59E0B] text-[#0A1128] border-2 border-[#0A1128] dark:border-slate-900 rounded-lg shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000]">
            <Sparkles className="w-3.5 h-3.5" />
            CHEF
          </span>
        );
      case 'SIRKEL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-[#E31B23] text-white border-2 border-[#0A1128] dark:border-slate-900 rounded-lg shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000]">
            <Flame className="w-3.5 h-3.5" />
            SIRKEL
          </span>
        );
      case 'MALAZZ':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-[#0A1128] dark:text-slate-200 border-2 border-[#0A1128] dark:border-slate-600 rounded-lg shadow-[1px_1px_0px_#0A1128] dark:shadow-[1px_1px_0px_#000000]">
            <Users className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
            MALAZZ
          </span>
        );
    }
  };

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/galeri', label: 'Galeri Momen', icon: Camera },
    { href: '/members', label: 'Warga Live', icon: Radio, badge: `${onlineCount}` },
    { href: '/pengumuman', label: 'Pengumuman', icon: Megaphone },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8FAFC]/95 dark:bg-[#080D1A]/95 backdrop-blur-md border-b-3 border-[#0A1128] dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-white border-2 border-[#0A1128] dark:border-slate-700 rounded-xl flex items-center justify-center p-1 shadow-[3px_3px_0px_#0A1128] dark:shadow-[3px_3px_0px_#000000] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="SuperMalazz Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl sm:text-2xl tracking-tight text-[#0A1128] dark:text-white leading-none">
                  SUPER<span className="text-[#E31B23]">MALAZZ</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-black text-[#64748B] dark:text-slate-400 tracking-wider uppercase mt-1">
                  Community Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition-all ${
                    isActive
                      ? 'bg-[#0A1128] dark:bg-slate-800 text-white border-[#0A1128] dark:border-slate-700 shadow-[3px_3px_0px_#E31B23]'
                      : 'text-[#0A1128] dark:text-slate-200 border-transparent hover:border-[#0A1128] dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-[2px_2px_0px_#0A1128] dark:hover:shadow-[2px_2px_0px_#000000]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : 'text-slate-600 dark:text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & CTA Desktop */}
          {/* User Profile & CTA Desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2.5 p-1.5 bg-white dark:bg-slate-800 border-2 border-[#0A1128] dark:border-slate-700 rounded-2xl shadow-[3px_3px_0px_#0A1128] dark:shadow-[3px_3px_0px_#000000]">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-xl border-2 border-[#0A1128] dark:border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl border-2 border-[#0A1128] dark:border-slate-700 bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-xs">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                
                <div className="flex flex-col text-left pr-1">
                  <span className="text-xs font-black text-[#0A1128] dark:text-white leading-tight truncate max-w-[110px]">
                    {user.displayName || user.username}
                  </span>
                  <div className="mt-0.5">{getRoleBadge()}</div>
                </div>

                <a
                  href="/api/auth/logout"
                  className="p-1.5 text-slate-400 hover:text-[#E31B23] hover:bg-red-50 dark:hover:bg-red-950/40 border-2 border-transparent hover:border-[#0A1128] dark:hover:border-slate-700 rounded-xl transition-all"
                  title="Keluar / Logout"
                >
                  <LogOut className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <a
                href="/api/auth/discord/login"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black text-white bg-[#5865F2] hover:bg-[#4752C4] border-2 border-[#0A1128] dark:border-slate-700 rounded-xl shadow-[3px_3px_0px_#0A1128] dark:shadow-[3px_3px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1128] transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Discord</span>
              </a>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-white dark:bg-slate-800 border-2 border-[#0A1128] dark:border-slate-700 rounded-xl shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000] text-[#0A1128] dark:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t-2 border-[#0A1128] dark:border-slate-800 bg-white dark:bg-[#080D1A] px-4 pt-3 pb-5 space-y-3 shadow-[0_8px_0_#0A1128] dark:shadow-[0_8px_0_#000000]">
          <div className="space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider ${
                    isActive
                      ? 'bg-[#0A1128] dark:bg-slate-800 text-white border-[#0A1128] dark:border-slate-700'
                      : 'text-[#0A1128] dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-[#0A1128] dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#E31B23]" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] rounded-full font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Section Mobile */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            {user ? (
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-[#0A1128] dark:border-slate-700 rounded-xl">
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={user.username}
                    className="w-8 h-8 rounded-lg border border-[#0A1128] dark:border-slate-700 object-cover"
                  />
                  <div>
                    <div className="text-xs font-black text-[#0A1128] dark:text-white">
                      {user.displayName || user.username}
                    </div>
                    <div>{getRoleBadge()}</div>
                  </div>
                </div>

                <a
                  href="/api/auth/logout"
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-lg border border-red-300 dark:border-red-900"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <a
                href="/api/auth/discord/login"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#5865F2] text-white text-xs font-black uppercase tracking-wider rounded-xl border-2 border-[#0A1128] dark:border-slate-700 shadow-[3px_3px_0px_#0A1128] dark:shadow-[3px_3px_0px_#000000]"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk dengan Discord</span>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
