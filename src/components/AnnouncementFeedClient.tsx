'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  Pin,
  PinOff,
  Calendar,
  Sparkles,
  Search,
  X,
  Pencil,
  Trash2,
  AlertTriangle,
  Flame,
  Trophy,
  Wrench,
  Coffee,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { AnnouncementItem, AnnouncementCategory } from '@/lib/types';
import AnnouncementModal from './AnnouncementModal';

interface AnnouncementFeedClientProps {
  initialAnnouncements: AnnouncementItem[];
  isChef: boolean;
}

const CATEGORY_CONFIG: Record<
  AnnouncementCategory,
  {
    name: string;
    label: string;
    icon: React.ElementType;
    badgeClass: string;
    textClass: string;
    borderClass: string;
  }
> = {
  PENTING: {
    name: 'Penting',
    label: '🚨 Penting / Rules',
    icon: Flame,
    badgeClass: 'bg-rose-100 border-rose-950 text-rose-800',
    textClass: 'text-rose-800',
    borderClass: 'border-rose-950',
  },
  TURNAMEN: {
    name: 'Turnamen',
    label: '🏆 Turnamen & Event',
    icon: Trophy,
    badgeClass: 'bg-amber-100 border-amber-950 text-amber-900',
    textClass: 'text-amber-900',
    borderClass: 'border-amber-950',
  },
  UPDATE: {
    name: 'Update',
    label: '🔧 Update Server',
    icon: Wrench,
    badgeClass: 'bg-blue-100 border-blue-950 text-blue-900',
    textClass: 'text-blue-900',
    borderClass: 'border-blue-950',
  },
  SANTAI: {
    name: 'Santai',
    label: '☕ Santai & Mabar',
    icon: Coffee,
    badgeClass: 'bg-emerald-100 border-emerald-950 text-emerald-900',
    textClass: 'text-emerald-900',
    borderClass: 'border-emerald-950',
  },
};

export default function AnnouncementFeedClient({
  initialAnnouncements,
  isChef,
}: AnnouncementFeedClientProps) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | AnnouncementCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);

  // Modal State for Delete Confirmation
  const [deletingItem, setDeletingItem] = useState<AnnouncementItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Pin loading state tracker
  const [pinningId, setPinningId] = useState<string | null>(null);

  // Filter & Search Logic
  const filteredAnnouncements = useMemo(() => {
    let list = [...announcements];

    // Filter by category
    if (selectedCategory !== 'ALL') {
      list = list.filter((item) => (item.category || 'PENTING') === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.author.displayName?.toLowerCase().includes(q) ||
          item.author.username.toLowerCase().includes(q)
      );
    }

    // Sort: Pinned first, then by date desc
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [announcements, selectedCategory, searchQuery]);

  // Counts per category
  const counts = useMemo(() => {
    const total = announcements.length;
    const penting = announcements.filter((a) => (a.category || 'PENTING') === 'PENTING').length;
    const turnamen = announcements.filter((a) => a.category === 'TURNAMEN').length;
    const update = announcements.filter((a) => a.category === 'UPDATE').length;
    const santai = announcements.filter((a) => a.category === 'SANTAI').length;
    return { ALL: total, PENTING: penting, TURNAMEN: turnamen, UPDATE: update, SANTAI: santai };
  }, [announcements]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AnnouncementItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (savedItem: AnnouncementItem, isEdit: boolean) => {
    if (isEdit) {
      setAnnouncements((prev) =>
        prev.map((item) => (item.id === savedItem.id ? savedItem : item))
      );
    } else {
      setAnnouncements((prev) => [savedItem, ...prev]);
    }
    router.refresh();
  };

  // Quick Pin Toggle
  const handleTogglePin = async (item: AnnouncementItem) => {
    if (!isChef || pinningId) return;
    setPinningId(item.id);

    try {
      const newPinnedStatus = !item.isPinned;
      const res = await fetch(`/api/announcements/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: newPinnedStatus }),
      });

      if (!res.ok) throw new Error('Gagal mengubah pin');

      const data = await res.json();
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, isPinned: newPinnedStatus } : a))
      );
    } catch (err) {
      alert('Gagal mengubah status sematan pengumuman.');
    } finally {
      setPinningId(null);
      router.refresh();
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingItem || !isChef) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/announcements/${deletingItem.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Gagal menghapus pengumuman');

      setAnnouncements((prev) => prev.filter((a) => a.id !== deletingItem.id));
      setDeletingItem(null);
    } catch (err) {
      alert('Gagal menghapus pengumuman.');
    } finally {
      setIsDeleting(false);
      router.refresh();
    }
  };

  // Format Helper for Text (renders bold and linebreaks cleanly)
  const renderFormattedContent = (content: string) => {
    return content.split('\n').map((paragraph, pIdx) => {
      if (!paragraph.trim()) {
        return <div key={pIdx} className="h-3" />;
      }

      // Simple parse for **bold**
      const parts = paragraph.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={pIdx} className="mb-2 last:mb-0">
          {parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={idx} className="font-black text-[#0A1128]">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div>
      {/* Top Filter Bar & Search Section */}
      <div className="bg-white border-2 border-[#0A1128] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#0A1128] mb-8 space-y-4">
        
        {/* Row 1: Search Bar & Create Button */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pengumuman berdasarkan judul atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border-2 border-[#0A1128] rounded-xl text-sm font-semibold text-[#0A1128] placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#F59E0B] shadow-[2px_2px_0px_#0A1128] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* CHEF Create Button */}
          {isChef && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F59E0B] hover:bg-[#d97706] text-[#0A1128] font-black text-sm rounded-xl border-2 border-[#0A1128] shadow-[3px_3px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1128] transition-all shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buat Pengumuman Baru</span>
            </button>
          )}
        </div>

        {/* Row 2: Category Filter Tabs (Opsi 2) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {/* ALL Tab */}
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border-2 shrink-0 cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#0A1128] text-white border-[#0A1128] shadow-[3px_3px_0px_#F59E0B]'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#0A1128]'
            }`}
          >
            <span>Semua Pengumuman</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                selectedCategory === 'ALL' ? 'bg-[#F59E0B] text-[#0A1128]' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.ALL}
            </span>
          </button>

          {/* Individual Category Tabs */}
          {(Object.keys(CATEGORY_CONFIG) as AnnouncementCategory[]).map((catKey) => {
            const cat = CATEGORY_CONFIG[catKey];
            const Icon = cat.icon;
            const isSelected = selectedCategory === catKey;

            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? `${cat.badgeClass} shadow-[3px_3px_0px_#0A1128] ring-1 ring-[#0A1128]`
                    : 'bg-white text-slate-700 border-slate-300 hover:border-[#0A1128]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? cat.textClass : 'text-slate-500'}`} />
                <span>{cat.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                    isSelected ? 'bg-white/80 text-[#0A1128]' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {counts[catKey]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Announcements Feed List */}
      <div className="space-y-6">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white border-2 border-[#0A1128] rounded-2xl shadow-[4px_4px_0px_#0A1128]">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-black text-lg text-[#0A1128]">Tidak Ada Pengumuman Ditemukan</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 font-medium">
              {searchQuery || selectedCategory !== 'ALL'
                ? 'Coba ganti kata kunci pencarian atau pilih kategori lain.'
                : 'Belum ada pengumuman resmi yang dipublikasikan.'}
            </p>
            {(searchQuery || selectedCategory !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0A1128] text-xs font-black rounded-xl border-2 border-[#0A1128] shadow-[2px_2px_0px_#0A1128] transition-all cursor-pointer"
              >
                Reset Filter & Pencarian
              </button>
            )}
          </div>
        ) : (
          filteredAnnouncements.map((item) => {
            const cat = CATEGORY_CONFIG[item.category || 'PENTING'];
            const CatIcon = cat.icon;

            return (
              <article
                key={item.id}
                className={`border-2 border-[#0A1128] rounded-2xl p-5 sm:p-6 transition-all ${
                  item.isPinned
                    ? 'bg-[#FFFDF7] shadow-[6px_6px_0px_#F59E0B] ring-2 ring-[#F59E0B]'
                    : 'bg-white shadow-[4px_4px_0px_#0A1128]'
                }`}
              >
                {/* Top Row: Meta Tags & CHEF Actions */}
                <div className="flex items-center justify-between gap-4 mb-4 flex-wrap border-b border-slate-100 pb-4">
                  
                  {/* Left Badges: Category & Pinned */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Category Badge */}
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 shadow-[2px_2px_0px_#0A1128] ${cat.badgeClass}`}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                      <span>{cat.name}</span>
                    </div>

                    {/* Pinned Badge */}
                    {item.isPinned && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F59E0B] text-[#0A1128] text-xs font-black uppercase rounded-lg border-2 border-[#0A1128] shadow-[2px_2px_0px_#0A1128]">
                        <Pin className="w-3.5 h-3.5" />
                        <span>Disematkan</span>
                      </div>
                    )}
                  </div>

                  {/* Right Actions: CHEF Management Controls (Opsi 1) */}
                  {isChef && (
                    <div className="flex items-center gap-2">
                      {/* Quick Pin/Unpin Toggle Button */}
                      <button
                        onClick={() => handleTogglePin(item)}
                        disabled={pinningId === item.id}
                        title={item.isPinned ? 'Lepas Sematan (Unpin)' : 'Sematkan ke Atas (Pin)'}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black border-2 border-[#0A1128] transition-all cursor-pointer shadow-[2px_2px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1128] ${
                          item.isPinned
                            ? 'bg-[#FEF3C7] text-[#D97706] hover:bg-[#fde68a]'
                            : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {item.isPinned ? (
                          <>
                            <PinOff className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Lepas Pin</span>
                          </>
                        ) : (
                          <>
                            <Pin className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sematkan</span>
                          </>
                        )}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Pengumuman"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-xl text-xs font-black border-2 border-[#0A1128] transition-all cursor-pointer shadow-[2px_2px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1128]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeletingItem(item)}
                        title="Hapus Pengumuman"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-black border-2 border-[#0A1128] transition-all cursor-pointer shadow-[2px_2px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1128]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-black text-[#0A1128] mb-3 leading-snug tracking-tight">
                  {item.title}
                </h2>

                {/* Content */}
                <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium mb-6">
                  {renderFormattedContent(item.content)}
                </div>

                {/* Bottom Row: Author & Timestamp */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl border-2 border-[#0A1128] overflow-hidden bg-slate-100 shrink-0 shadow-[2px_2px_0px_#0A1128]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={item.author.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs sm:text-sm text-[#0A1128]">
                          {item.author.displayName || item.author.username}
                        </span>
                        <span className="px-1.5 py-0.5 bg-[#F59E0B] text-[#0A1128] text-[9px] font-black uppercase rounded border border-[#0A1128]">
                          {item.author.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    {item.updatedAt && item.updatedAt !== item.createdAt && (
                      <span className="text-[11px] text-slate-400 font-semibold italic">
                        (Diedit)
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Reusable Create & Edit Modal */}
      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        announcementToEdit={editingItem}
      />

      {/* Delete Confirmation Modal (Neo-Brutalism) */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1128]/75 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white border-3 border-[#0A1128] rounded-2xl w-full max-w-md shadow-[8px_8px_0px_#0A1128] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 border-2 border-rose-950 flex items-center justify-center text-rose-600 shrink-0 shadow-[2px_2px_0px_#0A1128]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-lg text-[#0A1128]">Hapus Pengumuman?</h4>
                <p className="text-xs text-slate-500 font-semibold">
                  Tindakan ini permanen dan tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
              <p className="text-xs font-bold text-[#0A1128] line-clamp-2">
                &ldquo;{deletingItem.title}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
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
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
