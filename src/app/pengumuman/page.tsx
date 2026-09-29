import React from 'react';
import { Megaphone, ShieldCheck } from 'lucide-react';
import { getAnnouncements } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import AnnouncementFeedClient from '@/components/AnnouncementFeedClient';

export const dynamic = 'force-dynamic';

export default async function PengumumanPage() {
  const user = await getCurrentUser();
  const { announcements } = await getAnnouncements();
  
  // Role check: CHEF has pin privileges
  const isChef = user?.role === 'CHEF';

  return (
    <div className="min-h-screen bg-grid-pattern py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-xs font-bold text-[#D97706] dark:text-amber-400 uppercase tracking-wider mb-2">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Informasi Komunitas</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0A1128] dark:text-white tracking-tight">
            Papan Pengumuman
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pengumuman resmi, jadwal event, dan diskusi terbuka warga SuperMalazz.
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 self-start sm:self-auto shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
            <span>Role: <strong className="font-bold text-slate-900 dark:text-white uppercase">{user.role}</strong></span>
          </div>
        )}
      </div>

      {/* Main Interactive Feed (Client Component) */}
      <AnnouncementFeedClient
        initialAnnouncements={announcements}
        isChef={isChef}
        currentUser={user}
      />

    </div>
  );
}
