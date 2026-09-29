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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
          Tamu
        </span>
      );
    }

    switch (user.role) {
      case 'CHEF':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-[#D97706] dark:text-amber-300 rounded-md">
            <Sparkles className="w-3 h-3" />
            CHEF
          </span>
        );
      case 'SIRKEL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-[#E31B23] rounded-md">
            <Flame className="w-3 h-3" />
            SIRKEL
          </span>
        );
      case 'MALAZZ':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
            <Users className="w-3 h-3" />
            MALAZZ
          </span>
        );
    }
  };

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/galeri', label: 'Galeri', icon: Camera },
    { href: '/members', label: 'Warga Live', icon: Radio, badge: `${onlineCount}` },
    { href: '/pengumuman', label: 'Pengumuman', icon: Megaphone },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-[#080D1A]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center p-1 shadow-xs group-hover:scale-105 transition-all overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="SuperMalazz Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#0A1128] dark:text-white leading-none">
                  SUPER<span className="text-[#E31B23]">MALAZZ</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-1">
                  Community Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F59E0B]' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & CTA Desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2.5 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                
                <div className="flex flex-col text-left pr-1">
                  <span className="text-xs font-bold text-[#0A1128] dark:text-white leading-tight truncate max-w-[110px]">
                    {user.displayName || user.username}
                  </span>
                  <div className="mt-0.5">{getRoleBadge()}</div>
                </div>

                <a
                  href="/api/auth/logout"
                  className="p-1.5 text-slate-400 hover:text-[#E31B23] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all"
                  title="Keluar / Logout"
                >
                  <LogOut className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <a
                href="/api/auth/discord/login"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#5865F2] hover:bg-[#4752C4] rounded-lg shadow-xs hover:-translate-y-0.5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Discord</span>
              </a>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs text-slate-700 dark:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#080D1A]/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#F59E0B]" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            {user ? (
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl">
                <div className="flex items-center gap-2.5">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                      {user.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                      {user.displayName || user.username}
                    </span>
                    <div className="mt-0.5">{getRoleBadge()}</div>
                  </div>
                </div>

                <a
                  href="/api/auth/logout"
                  className="p-2 text-slate-400 hover:text-[#E31B23] transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <a
                href="/api/auth/discord/login"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#5865F2] hover:bg-[#4752C4] rounded-lg shadow-xs transition-all"
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
