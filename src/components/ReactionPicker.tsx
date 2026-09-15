'use client';

import React, { useState } from 'react';
import { SmilePlus } from 'lucide-react';
import { ReactionGroup } from '@/lib/types';
import { showToast } from './Toast';

const EMOJI_OPTIONS = ['🔥', '❤️', '💀', '😂', '🎉', '🗿'];

interface ReactionPickerProps {
  targetId: string;
  targetType: 'moment' | 'announcement';
  initialReactions?: ReactionGroup[];
  currentUserId?: string;
  onReactionChange?: (reactions: ReactionGroup[]) => void;
  size?: 'sm' | 'md';
}

export default function ReactionPicker({
  targetId,
  targetType,
  initialReactions = [],
  currentUserId,
  onReactionChange,
  size = 'md',
}: ReactionPickerProps) {
  const [reactions, setReactions] = useState<ReactionGroup[]>(initialReactions);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Sync state if initialReactions changes from outside
  React.useEffect(() => {
    setReactions(initialReactions);
  }, [initialReactions]);

  const handleToggle = async (emoji: string) => {
    if (!currentUserId) {
      showToast('⚠️ Silakan Login Discord untuk memberikan reaksi!', 'warning');
      return;
    }

    if (isLoading) return;
    setIsLoading(emoji);

    // Optimistic toggle
    const prevReactions = [...reactions];
    const existingGroup = reactions.find((r) => r.emoji === emoji);
    const hasReacted = existingGroup ? existingGroup.userIds.includes(currentUserId) : false;

    let updated: ReactionGroup[];
    if (existingGroup) {
      if (hasReacted) {
        // Remove reaction
        const newUserIds = existingGroup.userIds.filter((id) => id !== currentUserId);
        if (newUserIds.length === 0) {
          updated = reactions.filter((r) => r.emoji !== emoji);
        } else {
          updated = reactions.map((r) =>
            r.emoji === emoji ? { ...r, count: newUserIds.length, userIds: newUserIds } : r
          );
        }
      } else {
        // Add reaction
        const newUserIds = [...existingGroup.userIds, currentUserId];
        updated = reactions.map((r) =>
          r.emoji === emoji ? { ...r, count: newUserIds.length, userIds: newUserIds } : r
        );
      }
    } else {
      // New emoji reaction group
      updated = [...reactions, { emoji, count: 1, userIds: [currentUserId] }];
    }

    setReactions(updated);
    if (onReactionChange) onReactionChange(updated);

    try {
      const endpoint = targetType === 'moment'
        ? `/api/moments/${targetId}/reactions`
        : `/api/announcements/${targetId}/reactions`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });

      if (!res.ok) {
        throw new Error('Gagal mengirim reaksi');
      }

      const data = await res.json();
      if (data.reactions) {
        setReactions(data.reactions);
        if (onReactionChange) onReactionChange(data.reactions);
      }

      if (data.added) {
        showToast(`${emoji} Reaksi ditambahkan!`);
      }
    } catch (err) {
      // Rollback
      setReactions(prevReactions);
      if (onReactionChange) onReactionChange(prevReactions);
      showToast('Gagal memproses reaksi.', 'error');
    } finally {
      setIsLoading(null);
    }
  };

  const isSmall = size === 'sm';

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {EMOJI_OPTIONS.map((emoji) => {
        const group = reactions.find((r) => r.emoji === emoji);
        const count = group ? group.count : 0;
        const hasReacted = currentUserId && group ? group.userIds.includes(currentUserId) : false;

        return (
          <button
            key={emoji}
            type="button"
            onClick={() => handleToggle(emoji)}
            disabled={isLoading === emoji}
            title={hasReacted ? `Hapus reaksi ${emoji}` : `Beri reaksi ${emoji}`}
            className={`inline-flex items-center gap-1.5 transition-all rounded-xl border-2 font-black cursor-pointer select-none ${
              isSmall ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-sm'
            } ${
              hasReacted
                ? 'bg-[#FEF3C7] dark:bg-amber-950/60 border-[#0A1128] dark:border-amber-500 text-[#0A1128] dark:text-amber-200 shadow-[2px_2px_0px_#F59E0B] scale-105'
                : count > 0
                ? 'bg-white dark:bg-slate-800 border-[#0A1128] dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-[1px_1px_0px_#0A1128] dark:shadow-[1px_1px_0px_#000000] hover:bg-slate-50 dark:hover:bg-slate-700'
                : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-[#0A1128] dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <span className={isSmall ? 'text-sm' : 'text-base'}>{emoji}</span>
            {count > 0 && (
              <span className={`font-black ${hasReacted ? 'text-[#0A1128] dark:text-amber-200' : 'text-slate-600 dark:text-slate-300'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}