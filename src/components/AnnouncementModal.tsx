'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Pin, Send, X, AlertCircle, Flame, Trophy, Wrench, Coffee, Check } from 'lucide-react';
import { AnnouncementItem, AnnouncementCategory } from '@/lib/types';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (announcement: AnnouncementItem, isEdit: boolean) => void;
  announcementToEdit?: AnnouncementItem | null;
}

const CATEGORIES: {
  id: AnnouncementCategory;
  name: string;
  desc: string;
  icon: React.ElementType;
  badgeBg: string;
  textColor: string;
}[] = [
  {
    id: 'PENTING',
    name: 'Penting / Rules',
    desc: 'Aturan, notice mendesak, atau pengumuman vital server',
    icon: Flame,
    badgeBg: 'bg-rose-100 border-rose-900',
    textColor: 'text-rose-700',
  },
  {
    id: 'TURNAMEN',
    name: 'Turnamen & Event',
    desc: 'Kompetisi, fun cup, slot mabar berhadiah & pendaftaran',
    icon: Trophy,
    badgeBg: 'bg-amber-100 border-amber-900',
    textColor: 'text-amber-800',
  },
  {
    id: 'UPDATE',
    name: 'Update Server',
    desc: 'Patch notes, bot music update, perbaikan channel Discord',
    icon: Wrench,
    badgeBg: 'bg-blue-100 border-blue-900',
    textColor: 'text-blue-700',
  },
  {
    id: 'SANTAI',
    name: 'Santai & Nongkrong',
    desc: 'Sesi obrolan malam, review game indie, kopi bareng',
    icon: Coffee,
    badgeBg: 'bg-emerald-100 border-emerald-900',
    textColor: 'text-emerald-800',
  },
];

export default function AnnouncementModal({
  isOpen,
  onClose,
  onSuccess,
  announcementToEdit,
}: AnnouncementModalProps) {
  const isEdit = Boolean(announcementToEdit);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<AnnouncementCategory>('PENTING');
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state when editing or opening
  useEffect(() => {
    if (isOpen) {
      if (announcementToEdit) {
        setTitle(announcementToEdit.title);
        setContent(announcementToEdit.content);
        setCategory(announcementToEdit.category || 'PENTING');
        setIsPinned(Boolean(announcementToEdit.isPinned));
      } else {
        setTitle('');
        setContent('');
        setCategory('PENTING');
        setIsPinned(false);
      }
      setErrorMsg('');
    }
  }, [isOpen, announcementToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Judul dan isi pengumuman tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const url = isEdit
        ? `/api/announcements/${announcementToEdit!.id}`
        : '/api/announcements';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          category,
          isPinned,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan pengumuman');
      }

      onSuccess(data.announcement, isEdit);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan pengumuman.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1128]/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border-3 border-[#0A1128] rounded-2xl w-full max-w-2xl shadow-[8px_8px_0px_#0A1128] overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0A1128] text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#F59E0B] rounded-lg text-[#0A1128] font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight">
                {isEdit ? 'Edit Pengumuman Komunitas' : 'Publikasikan Pengumuman Baru'}
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Panel Manajemen Resmi untuk Role CHEF SuperMalazz
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border-2 border-red-500 text-red-700 text-xs font-bold rounded-xl shadow-[2px_2px_0px_#EF4444]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-black uppercase text-[#0A1128] mb-1.5 tracking-wider">
              Judul Pengumuman
            </label>
            <input
              type="text"
              placeholder="Contoh: Jadwal Turnamen Valorant & Maintenance Voice Server"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border-2 border-[#0A1128] rounded-xl text-sm font-bold text-[#0A1128] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B] shadow-[2px_2px_0px_#0A1128]"
              required
            />
          </div>

          {/* Category Selector (Opsi 2) */}
          <div>
            <label className="block text-xs font-black uppercase text-[#0A1128] mb-2 tracking-wider">
              Kategori Pengumuman
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-start gap-3 p-3 text-left rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0A1128] bg-[#FFFBEB] shadow-[3px_3px_0px_#0A1128] ring-2 ring-[#0A1128]'
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-[#0A1128]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 ${cat.badgeBg}`}
                    >
                      <IconComponent className={`w-4 h-4 ${cat.textColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#0A1128]">
                          {cat.name}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#0A1128] text-white flex items-center justify-center text-[10px]">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5 line-clamp-2">
                        {cat.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black uppercase text-[#0A1128] tracking-wider">
                Isi Pengumuman
              </label>
              <span className="text-[11px] font-semibold text-slate-500">
                Mendukung paragraf baris baru & penekanan kata
              </span>
            </div>
            <textarea
              rows={6}
              placeholder="Tuliskan rincian pengumuman secara jelas di sini... Contoh: waktu pelaksanaan, link pendaftaran, atau arahan khusus bagi warga tongkrongan."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-[#0A1128] rounded-xl text-sm font-medium text-[#0A1128] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B] shadow-[2px_2px_0px_#0A1128] resize-y leading-relaxed"
              required
            />
          </div>

          {/* Pin Post Checkbox */}
          <div className="flex items-center gap-3 p-3.5 bg-[#FEF3C7] border-2 border-[#0A1128] rounded-xl shadow-[3px_3px_0px_#0A1128]">
            <input
              type="checkbox"
              id="isPinnedModal"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 text-[#D97706] border-2 border-[#0A1128] rounded focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="isPinnedModal"
              className="text-xs font-black text-[#0A1128] cursor-pointer flex items-center gap-1.5 select-none"
            >
              <Pin className="w-4 h-4 text-[#D97706]" />
              <span>Sematkan di Urutan Paling Atas (Pinned Announcement)</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 border-2 border-slate-300 hover:border-[#0A1128] rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] hover:bg-[#c41219] text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#0A1128] shadow-[3px_3px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1128] transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? isEdit
                    ? 'Menyimpan...'
                    : 'Menerbitkan...'
                  : isEdit
                  ? 'Simpan Perubahan'
                  : 'Terbitkan Pengumuman'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
