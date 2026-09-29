import React from 'react';
import { Camera } from 'lucide-react';
import { getMoments } from '@/lib/gallery';
import GalleryViewer from '@/components/GalleryViewer';
import AddMomentModal from '@/components/AddMomentModal';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function GaleriPage() {
  const user = await getCurrentUser();
  const moments = await getMoments();
  const canAdd = Boolean(user);

  return (
    <div className="min-h-screen bg-grid-pattern py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-950/40 rounded-lg text-xs font-bold text-[#E31B23] uppercase tracking-wider mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>Dokumentasi Komunitas</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0A1128] dark:text-white tracking-tight">
            Galeri Momen SuperMalazz
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kumpulan screenshot, duel mabar, dan kenangan nobar warga tongkrongan.
          </p>
        </div>

        <div className="shrink-0">
          <AddMomentModal canAdd={Boolean(canAdd)} />
        </div>
      </div>

      {/* Gallery Viewer */}
      <GalleryViewer initialMoments={moments} currentUser={user} />

    </div>
  );
}
