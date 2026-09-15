import React from 'react';
import { Megaphone, ShieldCheck } from 'lucide-react';
import { getAnnouncements } from '@/lib/data';
import { getCurrentUser } from '@/lib/auth';
import AnnouncementFeedClient from '@/components/AnnouncementFeedClient';

export const dynamic = 'force-dynamic';

export default async function PengumumanPage() {
  const user = await getCurrentUser();
  const { announcements } = await getAnnouncements();
  
  // Allow full control so user can add and delete freely as requested
  const isChef = true;

  return (
    <div className="min-h-screen bg-grid-pattern py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b-2 border-[#0A1128] mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl border-3 border-[#0A1128] overflow-hidden bg-white shadow-[4px_4px_0px_#0A1128] shrink-0 p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="SuperMalazz Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FEF3C7] border-2 border-[#0A1128] rounded-lg text-xs font-black text-[#D97706] uppercase tracking-wider mb-2 shadow-[2px_2px_0px_#0A1128]">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Official Broadcast</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#0A1128] tracking-tight">
              Papan Pengumuman
            </h1>
            <p className="text-sm text-slate-600 font-semibold mt-1">
              Pusat informasi resmi, regulasi komunitas, jadwal turnamen, dan pembaruan server SuperMalazz.
            </p>
          </div>
        </div>

        {/* User Role Indicator pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-[#0A1128] rounded-xl shadow-[3px_3px_0px_#0A1128] text-xs font-bold text-slate-700 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
          <span>
            Mode: <strong className="font-black text-[#0A1128]">{user ? `${user.role} (${user.displayName})` : 'CHEF / Admin Akses Penuh'}</strong>
          </span>
        </div>
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
