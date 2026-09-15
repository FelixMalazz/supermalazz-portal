'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Calendar, 
  User, 
  X, 
  Sparkles, 
  Flame, 
  Eye, 
  Tag, 
  Trash2, 
  AlertTriangle, 
  Image as ImageIcon,
  Search,
  ArrowUpDown
} from 'lucide-react';
import { MomentItem } from '@/lib/gallery';
import { showToast } from '@/components/Toast';

interface GalleryViewerProps {
  initialMoments: MomentItem[];
}

export default function GalleryViewer({ initialMoments }: GalleryViewerProps) {
  const router = useRouter();
  const [moments, setMoments] = useState<MomentItem[]>(initialMoments);
  const [filter, setFilter] = useState<'ALL' | 'MABAR' | 'CHAOS' | 'VOICE' | 'TOURNAMENT'>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'MOST_LIKED'>('NEWEST');
  const [selectedMoment, setSelectedMoment] = useState<MomentItem | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Sync state whenever initialMoments prop updates (e.g. from router.refresh)
  useEffect(() => {
    setMoments(initialMoments);
  }, [initialMoments]);

  // Instant real-time event when moments are added via modal
  useEffect(() => {
    const handleMomentsAdded = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setMoments((prev) => {
          // Avoid duplicate ids
          const existingIds = new Set(prev.map((m) => m.id));
          const newItems = e.detail.filter((item: MomentItem) => !existingIds.has(item.id));
          return [...newItems, ...prev];
        });
      }
    };
    window.addEventListener('supermalazz-moments-added', handleMomentsAdded);
    return () => window.removeEventListener('supermalazz-moments-added', handleMomentsAdded);
  }, []);

  // Delete State
  const [deletingMoment, setDeletingMoment] = useState<MomentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedIds.has(id)) return;

    setLikedIds((prev) => new Set(prev).add(id));
    setMoments((prev) =>
      prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m))
    );
    showToast('❤️ Menyukai foto momen tongkrongan!');
  };

  const handleConfirmDelete = async () => {
    if (!deletingMoment) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/moments/${deletingMoment.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Gagal menghapus momen');

      setMoments((prev) => prev.filter((m) => m.id !== deletingMoment.id));
      if (selectedMoment?.id === deletingMoment.id) {
        setSelectedMoment(null);
      }
      setDeletingMoment(null);
      showToast('Foto momen berhasil dihapus', 'info');
    } catch (err) {
      alert('Gagal menghapus momen.');
    } finally {
      setIsDeleting(false);
      router.refresh();
    }
  };

  // Counts per category
  const counts = useMemo(() => {
    const all = moments.length;
    const mabar = moments.filter((m) => m.category === 'MABAR').length;
    const chaos = moments.filter((m) => m.category === 'CHAOS').length;
    const voice = moments.filter((m) => m.category === 'VOICE').length;
    const tournament = moments.filter((m) => m.category === 'TOURNAMENT').length;
    return { all, mabar, chaos, voice, tournament };
  }, [moments]);

  const filteredMoments = useMemo(() => {
    let result = moments.filter((m) => {
      if (filter !== 'ALL' && m.category !== filter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchDesc = (m.description || '').toLowerCase().includes(q);
        const authorName = m.author?.displayName || m.author?.username || '';
        const matchAuthor = authorName.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchAuthor) return false;
      }
      return true;
    });

    return result.sort((a, b) => {
      if (sortBy === 'MOST_LIKED') {
        return b.likes - a.likes;
      }
      if (sortBy === 'OLDEST') {
        const dateA = new Date(a.capturedAt || a.createdAt).getTime();
        const dateB = new Date(b.capturedAt || b.createdAt).getTime();
        return dateA - dateB;
      }
      // NEWEST
      const dateA = new Date(a.capturedAt || a.createdAt).getTime();
      const dateB = new Date(b.capturedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [moments, filter, search, sortBy]);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'TOURNAMENT':
        return <span className="px-2.5 py-1 bg-[#FEF3C7] text-[#D97706] border border-[#0A1128] rounded-lg text-[10px] font-black uppercase">🏆 Turnamen</span>;
      case 'MABAR':
        return <span className="px-2.5 py-1 bg-red-100 text-[#E31B23] border border-[#0A1128] rounded-lg text-[10px] font-black uppercase">🎮 Mabar</span>;
      case 'CHAOS':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 border border-[#0A1128] rounded-lg text-[10px] font-black uppercase">💥 Chaos</span>;
      case 'VOICE':
      default:
        return <span className="px-2.5 py-1 bg-sky-100 text-sky-800 border border-[#0A1128] rounded-lg text-[10px] font-black uppercase">🎧 Voice & Chill</span>;
    }
  };

  return (
    <div>
      {/* Search Bar & Sort Controls */}
      <div className="bg-white border-2 border-[#0A1128] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#0A1128] mb-6 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari momen berdasarkan judul, pengunggah, atau keterangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border-2 border-[#0A1128] rounded-xl text-xs sm:text-sm font-bold text-[#0A1128] placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#E31B23] shadow-[2px_2px_0px_#0A1128] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none pl-8 pr-7 py-2.5 bg-slate-50 hover:bg-slate-100 border-2 border-[#0A1128] rounded-xl text-xs font-black text-[#0A1128] shadow-[2px_2px_0px_#0A1128] cursor-pointer focus:outline-hidden w-full sm:w-auto"
            >
              <option value="NEWEST">Terbaru (Tanggal Foto)</option>
              <option value="OLDEST">Terlama</option>
              <option value="MOST_LIKED">Paling Banyak Disukai ❤️</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar border-t-2 border-slate-100 pt-3">
          <button
            onClick={() => setFilter('ALL')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
              filter === 'ALL'
                ? 'bg-[#0A1128] text-white border-[#0A1128] shadow-[2px_2px_0px_#E31B23]'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#0A1128]'
            }`}
          >
            <span>Semua Momen</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${filter === 'ALL' ? 'bg-[#E31B23] text-white' : 'bg-slate-100 text-slate-600'}`}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setFilter('MABAR')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
              filter === 'MABAR'
                ? 'bg-[#E31B23] text-white border-[#0A1128] shadow-[2px_2px_0px_#0A1128]'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#0A1128]'
            }`}
          >
            <span>🎮 Mabar Seru</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${filter === 'MABAR' ? 'bg-white text-[#E31B23]' : 'bg-slate-100 text-slate-600'}`}>
              {counts.mabar}
            </span>
          </button>

          <button
            onClick={() => setFilter('CHAOS')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
              filter === 'CHAOS'
                ? 'bg-purple-700 text-white border-[#0A1128] shadow-[2px_2px_0px_#0A1128]'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#0A1128]'
            }`}
          >
            <span>💥 Chaos & Lucu</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${filter === 'CHAOS' ? 'bg-white text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
              {counts.chaos}
            </span>
          </button>

          <button
            onClick={() => setFilter('VOICE')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
              filter === 'VOICE'
                ? 'bg-sky-700 text-white border-[#0A1128] shadow-[2px_2px_0px_#0A1128]'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#0A1128]'
            }`}
          >
            <span>🎧 Voice & Nobar</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${filter === 'VOICE' ? 'bg-white text-sky-700' : 'bg-slate-100 text-slate-600'}`}>
              {counts.voice}
            </span>
          </button>

          <button
            onClick={() => setFilter('TOURNAMENT')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
              filter === 'TOURNAMENT'
                ? 'bg-[#F59E0B] text-[#0A1128] border-[#0A1128] shadow-[2px_2px_0px_#0A1128]'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#0A1128]'
            }`}
          >
            <span>🏆 Turnamen</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${filter === 'TOURNAMENT' ? 'bg-[#0A1128] text-white' : 'bg-slate-100 text-slate-600'}`}>
              {counts.tournament}
            </span>
          </button>
        </div>
      </div>

      {/* Grid of Moments */}
      {filteredMoments.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white border-2 border-[#0A1128] rounded-2xl shadow-[4px_4px_0px_#0A1128]">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-black text-lg text-[#0A1128]">Belum Ada Momen Tersimpan</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 font-medium">
            {filter !== 'ALL'
              ? 'Belum ada foto/klip di kategori ini. Coba pilih tab lain atau unggah momen baru!'
              : 'Galeri masih kosong. Anda bisa mengunggah momen pertama sekarang.'}
          </p>
          {filter !== 'ALL' && (
            <button
              onClick={() => setFilter('ALL')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0A1128] text-xs font-black rounded-xl border-2 border-[#0A1128] shadow-[2px_2px_0px_#0A1128] transition-all cursor-pointer"
            >
              Lihat Semua Kategori
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMoments.map((item) => {
            const isLiked = likedIds.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedMoment(item)}
                className="bg-white border-2 border-[#0A1128] rounded-2xl overflow-hidden shadow-[4px_4px_0px_#0A1128] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#E31B23] transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-900 border-b-2 border-[#0A1128]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Category Pill */}
                    <div className="absolute top-3 left-3 shadow-[2px_2px_0px_#0A1128]">
                      {getCategoryBadge(item.category)}
                    </div>

                    {/* Captured Date Pill on top right of the image */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#0A1128]/90 text-white rounded-lg border border-white text-[10px] font-bold flex items-center gap-1 shadow-xs backdrop-blur-xs">
                      <Calendar className="w-3 h-3 text-[#F59E0B]" />
                      <span>
                        {new Date(item.capturedAt || item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Hover Overlay Hint */}
                    <div className="absolute inset-0 bg-[#0A1128]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black uppercase gap-1.5 backdrop-blur-xs">
                      <Eye className="w-4 h-4" />
                      <span>Lihat Full Screenshot</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-black text-lg text-[#0A1128] mb-2 leading-snug group-hover:text-[#E31B23] transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed mb-3">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {item.capturedAt ? 'Diambil:' : 'Diunggah:'}{' '}
                        <strong className="text-slate-700">
                          {new Date(item.capturedAt || item.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                  
                  {/* Author Info */}
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={item.author.username}
                      className="w-5 h-5 rounded-full object-cover border border-slate-300"
                    />
                    <span className="font-bold text-slate-600 truncate max-w-[100px]">
                      {item.author.displayName || item.author.username}
                    </span>
                  </div>

                  {/* Actions: Like & Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleLike(item.id, e)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 font-black transition-all cursor-pointer ${
                        isLiked
                          ? 'bg-red-50 text-[#E31B23] border-[#E31B23] shadow-[1px_1px_0px_#E31B23]'
                          : 'bg-white text-slate-700 border-[#0A1128] hover:bg-slate-50'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#E31B23] text-[#E31B23]' : 'text-slate-500'}`}
                      />
                      <span>{item.likes}</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingMoment(item);
                      }}
                      title="Hapus Momen Ini"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-[#0A1128] bg-rose-50 text-rose-700 hover:bg-rose-100 font-black text-xs shadow-[2px_2px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1128] transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedMoment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1128]/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedMoment(null)}
        >
          <div
            className="bg-white border-3 border-[#0A1128] rounded-2xl w-full max-w-3xl shadow-[8px_8px_0px_#0A1128] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image */}
            <div className="relative aspect-video w-full bg-slate-950 border-b-3 border-[#0A1128]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedMoment.imageUrl}
                alt={selectedMoment.title}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setSelectedMoment(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-[#0A1128] text-white border-2 border-white hover:bg-slate-800 shadow-[2px_2px_0px_white] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Details */}
            <div className="p-6">
              <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {getCategoryBadge(selectedMoment.category)}
                  
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-[#0A1128] rounded-lg text-xs font-black text-amber-900 shadow-xs">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {selectedMoment.capturedAt ? 'Foto Diambil: ' : 'Diunggah: '}
                      {new Date(selectedMoment.capturedAt || selectedMoment.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </span>

                  {selectedMoment.capturedAt && (
                    <span className="text-[11px] font-semibold text-slate-400">
                      (Diunggah: {new Date(selectedMoment.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Diabadikan oleh:</span>
                  <span className="text-xs font-black text-[#0A1128]">
                    {selectedMoment.author.displayName || selectedMoment.author.username}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-black text-[#0A1128] mb-2 leading-snug">
                {selectedMoment.title}
              </h2>

              {selectedMoment.description && (
                <p className="text-sm text-slate-700 font-medium leading-relaxed mb-4">
                  {selectedMoment.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {/* Delete in modal */}
                <button
                  onClick={() => setDeletingMoment(selectedMoment)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border-2 border-[#0A1128] rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Momen</span>
                </button>

                {/* Like Button */}
                <button
                  onClick={(e) => handleLike(selectedMoment.id, e)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-[#E31B23] border-2 border-[#0A1128] rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-[#E31B23]" />
                  <span>Suka Momen Ini ({selectedMoment.likes})</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMoment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1128]/75 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white border-3 border-[#0A1128] rounded-2xl w-full max-w-md shadow-[8px_8px_0px_#0A1128] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 border-2 border-rose-950 flex items-center justify-center text-rose-600 shrink-0 shadow-[2px_2px_0px_#0A1128]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-lg text-[#0A1128]">Hapus Momen Ini?</h4>
                <p className="text-xs text-slate-500 font-semibold">
                  Foto momen ini akan dihapus secara permanen dari galeri.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
              <p className="text-xs font-bold text-[#0A1128] line-clamp-2">
                &ldquo;{deletingMoment.title}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMoment(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-black uppercase text-slate-600 hover:text-slate-900 border-2 border-slate-300 hover:border-[#0A1128] rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#E31B23] hover:bg-[#b9151c] text-white text-xs font-black uppercase tracking-wider rounded-xl border-2 border-[#0A1128] shadow-[3px_3px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1128] transition-all disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Momen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
