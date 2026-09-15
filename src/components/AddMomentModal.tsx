'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Camera, 
  Plus, 
  X, 
  AlertCircle, 
  UploadCloud, 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  Image as ImageIcon
} from 'lucide-react';
import { showToast } from '@/components/Toast';

interface AddMomentModalProps {
  canAdd: boolean;
}

interface SelectedFileItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  capturedAt: string; // YYYY-MM-DD
  category: 'MABAR' | 'CHAOS' | 'VOICE' | 'TOURNAMENT';
  description: string;
}

export default function AddMomentModal({ canAdd }: AddMomentModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Multi-file state
  const [selectedItems, setSelectedItems] = useState<SelectedFileItem[]>([]);
  const [globalCategory, setGlobalCategory] = useState<'MABAR' | 'CHAOS' | 'VOICE' | 'TOURNAMENT'>('MABAR');
  const [globalDescription, setGlobalDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!canAdd) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-500">
        <span>🔒 Hanya role CHEF & SIRKEL yang dapat mengunggah momen.</span>
      </div>
    );
  }

  // Format date to YYYY-MM-DD
  const formatDateToInput = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Handle local files selection & drag drop
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setErrorMsg('');
    const newItems: SelectedFileItem[] = [];

    Array.from(files).forEach((file) => {
      // Validate image type
      if (!file.type.startsWith('image/')) return;

      const previewUrl = URL.createObjectURL(file);

      // Extract modified date from file metadata
      const fileDate = file.lastModified ? new Date(file.lastModified) : new Date();
      const capturedAt = formatDateToInput(fileDate);

      // Auto title from filename without extension
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .trim();

      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        title: cleanTitle || 'Momen Mabar SuperMalazz',
        capturedAt,
        category: globalCategory,
        description: globalDescription,
      });
    });

    if (newItems.length === 0) {
      setErrorMsg('File yang dipilih bukan gambar yang valid (PNG, JPG, WEBP).');
      return;
    }

    setSelectedItems((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag & Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the current target
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleUpdateItem = (id: string, field: keyof SelectedFileItem, value: any) => {
    setSelectedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleApplyCategoryToAll = (cat: 'MABAR' | 'CHAOS' | 'VOICE' | 'TOURNAMENT') => {
    setGlobalCategory(cat);
    setSelectedItems((prev) => prev.map((item) => ({ ...item, category: cat })));
  };

  const resetForm = () => {
    selectedItems.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setSelectedItems([]);
    setIsDragging(false);
    setErrorMsg('');
  };

  const handleClose = () => {
    resetForm();
    setIsOpen(false);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (selectedItems.length === 0) {
        throw new Error('Pilih atau seret minimal 1 file foto dari laptop Anda.');
      }

      const formData = new FormData();

      // Append files
      selectedItems.forEach((item) => {
        formData.append('files', item.file);
      });

      // Append metadata for each file
      const metadata = selectedItems.map((item) => ({
        title: item.title,
        description: item.description || globalDescription,
        category: item.category,
        capturedAt: item.capturedAt ? new Date(item.capturedAt).toISOString() : null,
      }));

      formData.append('metadata', JSON.stringify(metadata));
      formData.append('defaultCategory', globalCategory);

      const res = await fetch('/api/moments/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah foto momen.');
      }

      // Notify GalleryViewer instantly
      if (data.moments && Array.isArray(data.moments)) {
        window.dispatchEvent(new CustomEvent('supermalazz-moments-added', { detail: data.moments }));
        showToast(`Berhasil mengunggah ${data.moments.length} foto momen! 🎉`);
      } else {
        showToast('Foto momen berhasil diunggah! 🎉');
      }

      handleClose();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengunggah.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] hover:bg-[#c41219] text-white font-black text-sm rounded-xl border-2 border-[#0A1128] shadow-[3px_3px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1128] transition-all cursor-pointer"
      >
        <Camera className="w-4 h-4" />
        <span>Unggah Momen Tongkrongan</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0A1128]/80 backdrop-blur-xs overflow-y-auto"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div 
            className="bg-white border-3 border-[#0A1128] rounded-2xl w-full max-w-3xl shadow-[8px_8px_0px_#0A1128] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#0A1128] text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E31B23] border border-white flex items-center justify-center shadow-[2px_2px_0px_white]">
                  <UploadCloud className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg leading-tight">Unggah Momen SuperMalazz</h3>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Drag and drop atau pilih foto dari folder laptop (bisa beberapa sekaligus).
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body (Scrollable) */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-300 text-red-700 text-xs font-bold rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Drag and Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-3 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer group shadow-[3px_3px_0px_#0A1128] ${
                  isDragging
                    ? 'border-[#E31B23] bg-red-50 ring-4 ring-red-200 scale-[1.01]'
                    : 'border-[#0A1128] bg-slate-50 hover:bg-red-50/40 hover:border-[#E31B23]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="hidden"
                />

                <div className={`w-14 h-14 rounded-2xl bg-white border-2 border-[#0A1128] flex items-center justify-center mx-auto mb-3 shadow-[3px_3px_0px_#0A1128] transition-all ${
                  isDragging ? 'scale-110 shadow-[2px_2px_0px_#E31B23] animate-bounce' : 'group-hover:scale-105'
                }`}>
                  <UploadCloud className="w-7 h-7 text-[#E31B23]" />
                </div>

                <h4 className="font-black text-base text-[#0A1128] group-hover:text-[#E31B23] transition-colors">
                  {isDragging
                    ? '⚡ Lepaskan foto Anda di sini!'
                    : 'Seret & Letakkan (Drag and Drop) foto di sini, atau klik untuk memilih'}
                </h4>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Mendukung format PNG, JPG, JPEG, WEBP. Bebas memilih beberapa foto sekaligus dari laptop!
                </p>

                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#0A1128] rounded-lg text-[11px] font-bold text-slate-700 shadow-xs">
                  <span>📅 Tanggal foto diambil akan terdeteksi otomatis dari file Anda.</span>
                </div>
              </div>

              {/* Batch Global Category Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-100 border-2 border-[#0A1128] rounded-2xl shadow-[2px_2px_0px_#0A1128]">
                <div>
                  <span className="text-xs font-black uppercase text-[#0A1128] block">
                    Kategori Default (Diterapkan ke semua foto)
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Bisa diubah secara individual per foto di daftar bawah.
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: 'MABAR', label: '🎮 Mabar' },
                    { key: 'CHAOS', label: '💥 Chaos' },
                    { key: 'VOICE', label: '🎧 Voice' },
                    { key: 'TOURNAMENT', label: '🏆 Turnamen' },
                  ].map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => handleApplyCategoryToAll(c.key as any)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-black cursor-pointer transition-all ${
                        globalCategory === c.key
                          ? 'bg-[#E31B23] text-white border-[#0A1128] shadow-[2px_2px_0px_#0A1128]'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-[#0A1128]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* List of Selected Photos */}
              {selectedItems.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#0A1128] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Daftar Foto Siap Unggah ({selectedItems.length})</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedItems([])}
                      className="text-xs font-black text-red-600 hover:underline cursor-pointer"
                    >
                      Hapus Semua
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="bg-white border-2 border-[#0A1128] rounded-2xl p-3.5 sm:p-4 shadow-[3px_3px_0px_#0A1128] flex flex-col sm:flex-row items-start gap-4 transition-all"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-full sm:w-32 h-24 sm:h-24 rounded-xl overflow-hidden bg-slate-900 border-2 border-[#0A1128] shrink-0 shadow-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.previewUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#0A1128] text-white text-[9px] font-black uppercase rounded border border-white">
                            #{idx + 1}
                          </div>
                        </div>

                        {/* Inputs for this photo */}
                        <div className="flex-1 w-full space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                              placeholder="Judul momen..."
                              className="flex-1 px-3 py-1.5 bg-white border-2 border-[#0A1128] rounded-xl text-xs font-bold text-[#0A1128] focus:outline-hidden focus:ring-2 focus:ring-[#E31B23]"
                              required
                            />

                            <select
                              value={item.category}
                              onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value)}
                              className="px-2.5 py-1.5 bg-white border-2 border-[#0A1128] rounded-xl text-xs font-bold text-[#0A1128]"
                            >
                              <option value="MABAR">🎮 Mabar</option>
                              <option value="CHAOS">💥 Chaos</option>
                              <option value="VOICE">🎧 Voice</option>
                              <option value="TOURNAMENT">🏆 Turnamen</option>
                            </select>
                          </div>

                          {/* Date captured row */}
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 font-bold">
                              <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Tanggal File:</span>
                            </div>
                            
                            <input
                              type="date"
                              value={item.capturedAt}
                              onChange={(e) => handleUpdateItem(item.id, 'capturedAt', e.target.value)}
                              className="px-2.5 py-1 bg-white border border-[#0A1128] rounded-lg text-xs font-bold text-[#0A1128]"
                              title="Tanggal saat foto/screenshot ini dibuat di laptop"
                            />

                            <span className="text-[10px] text-slate-500 font-medium">
                              (Terdeteksi otomatis dari file)
                            </span>
                          </div>

                          {/* Description */}
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                            placeholder="Cerita / keterangan singkat (opsional)..."
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 font-medium"
                          />
                        </div>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-300 rounded-xl transition-colors shrink-0 self-end sm:self-center cursor-pointer"
                          title="Batal pilih foto ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 px-4 border-2 border-slate-200 rounded-2xl bg-slate-50/60">
                  <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-semibold">
                    Belum ada foto yang dipilih. Silakan klik atau seret foto ke kotak di atas.
                  </p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100">
                <div className="text-xs font-bold text-slate-500">
                  {selectedItems.length > 0 && (
                    <span>{selectedItems.length} foto siap diunggah ke server</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border-2 border-slate-300 hover:border-[#0A1128] rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || selectedItems.length === 0}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] hover:bg-[#c41219] text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#0A1128] shadow-[3px_3px_0px_#0A1128] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1128] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? 'Mengunggah Foto...'
                        : selectedItems.length > 0
                        ? `Unggah ${selectedItems.length} Foto`
                        : 'Pilih Foto Terlebih Dahulu'}
                    </span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
