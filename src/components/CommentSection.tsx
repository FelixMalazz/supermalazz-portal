'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, Trash2, Clock, LogIn } from 'lucide-react';
import { CommentItem, UserRole } from '@/lib/types';
import { showToast } from './Toast';

interface CommentSectionProps {
  targetId: string;
  targetType: 'moment' | 'announcement';
  initialComments?: CommentItem[];
  currentUser?: {
    id: string;
    username: string;
    displayName: string | null;
    avatar: string | null;
    role: UserRole;
  } | null;
  onCommentsChange?: (comments: CommentItem[]) => void;
}

function formatRelativeTime(dateStr: string | Date): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mnt lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  } catch (e) {
    return 'Baru saja';
  }
}

export default function CommentSection({
  targetId,
  targetType,
  initialComments = [],
  currentUser,
  onCommentsChange,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  React.useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content) return;

    if (!currentUser) {
      showToast('⚠️ Silakan login dengan Discord untuk berkomentar!', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = targetType === 'moment'
        ? `/api/moments/${targetId}/comments`
        : `/api/announcements/${targetId}/comments`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengirim komentar');
      }

      const data = await res.json();
      const updated = [...comments, data.comment];
      setComments(updated);
      if (onCommentsChange) onCommentsChange(updated);
      setNewComment('');
      showToast('💬 Komentar berhasil dikirim!');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengirim komentar.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (deletingId) return;
    setDeletingId(commentId);

    try {
      const endpoint = targetType === 'moment'
        ? `/api/moments/${targetId}/comments?commentId=${commentId}`
        : `/api/announcements/${targetId}/comments?commentId=${commentId}`;

      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus komentar');
      }

      const updated = comments.filter((c) => c.id !== commentId);
      setComments(updated);
      if (onCommentsChange) onCommentsChange(updated);
      showToast('Komentar berhasil dihapus', 'info');
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus komentar', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'CHEF':
        return 'bg-[#F59E0B] text-[#0A1128] border-[#0A1128]';
      case 'SIRKEL':
        return 'bg-purple-600 text-white border-[#0A1128]';
      case 'MALAZZ':
      default:
        return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#0A1128] dark:text-slate-200" />
          <h4 className="font-black text-sm text-[#0A1128] dark:text-white uppercase tracking-wider">
            Komentar Warga ({comments.length})
          </h4>
        </div>
      </div>

      {/* Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex gap-2.5 items-start">
          <div className="w-8 h-8 rounded-lg border-2 border-[#0A1128] dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shrink-0 mt-1 shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.username}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis komentar atau reaksi untuk momen ini..."
                rows={2}
                maxLength={500}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-[#0A1128] dark:border-slate-700 rounded-xl text-xs font-semibold text-[#0A1128] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B] transition-all resize-none shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000]"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                {newComment.length}/500 karakter
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F59E0B] hover:bg-[#d97706] text-[#0A1128] text-xs font-black rounded-lg border-2 border-[#0A1128] dark:border-slate-700 shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1128] transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>{isSubmitting ? 'Mengirim...' : 'Kirim'}</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-2 border-[#0A1128] dark:border-slate-700 rounded-xl flex items-center justify-between gap-3 shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000]">
          <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
            💬 Ingin ikut berkomentar dan nimbrung?
          </p>
          <a
            href="/api/auth/discord/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-black rounded-lg border-2 border-[#0A1128] dark:border-slate-700 shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#0A1128] transition-all shrink-0 cursor-pointer"
          >
            <LogIn className="w-3 h-3" />
            <span>Login Discord</span>
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/40">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
              Belum ada komentar. Jadilah yang pertama berkomentar!
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const canDelete =
              currentUser &&
              (currentUser.id === comment.authorId || currentUser.role === 'CHEF');

            return (
              <div
                key={comment.id}
                className="p-3 bg-white dark:bg-slate-800 border-2 border-[#0A1128] dark:border-slate-700 rounded-xl shadow-[2px_2px_0px_#0A1128] dark:shadow-[2px_2px_0px_#000000] flex gap-2.5 group"
              >
                <div className="w-7 h-7 rounded-lg border border-[#0A1128] dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 mt-0.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={comment.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={comment.author?.username || 'User'}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-xs text-[#0A1128] dark:text-white">
                        {comment.author?.displayName || comment.author?.username || 'Warga'}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded border text-[9px] font-black uppercase ${getRoleBadge(
                          comment.author?.role as UserRole
                        )}`}
                      >
                        {comment.author?.role || 'MALAZZ'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatRelativeTime(comment.createdAt)}</span>
                      </div>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(comment.id)}
                          disabled={deletingId === comment.id}
                          title="Hapus komentar"
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap break-words leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}