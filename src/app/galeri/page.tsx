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
    <div className="min-h-screen bg-grid-pattern py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b-2 border-[#0A1128] mb-10">
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 border-2 border-[#0A1128] rounded-lg text-xs font-black text-[#E31B23] uppercase tracking-wider mb-2 shadow-[2px_2px_0px_#0A1128]">
              <Camera className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Memories & Highlights</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#0A1128] tracking-tight">
              Galeri & Momen SuperMalazz
            </h1>
            <p className="text-sm text-slate-600 font-medium mt-1">
              Koleksi screenshot, klip seru, duel sengit, dan kenangan nobar warga tongkrongan.
            </p>
          </div>
        </div>

        <div>
          <AddMomentModal canAdd={Boolean(canAdd)} />
        </div>
      </div>

      {/* Gallery Viewer */}
      <GalleryViewer initialMoments={moments} currentUser={user} />

    </div>
  );
}
