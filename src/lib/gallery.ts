import { prisma } from './prisma';
import { CommentItem, ReactionGroup, UserRole } from './types';

export interface MomentItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: 'MABAR' | 'CHAOS' | 'VOICE' | 'TOURNAMENT';
  likes: number;
  authorId: string;
  author: {
    username: string;
    displayName: string | null;
    avatar: string | null;
    role: string;
  };
  comments: CommentItem[];
  reactions: ReactionGroup[];
  capturedAt?: string | null;
  createdAt: string;
}

let inMemoryMoments: MomentItem[] = [];

export function groupReactions(reactions: Array<{ emoji: string; userId: string }>): ReactionGroup[] {
  const map = new Map<string, string[]>();
  for (const r of reactions) {
    if (!map.has(r.emoji)) map.set(r.emoji, []);
    map.get(r.emoji)!.push(r.userId);
  }
  return Array.from(map.entries()).map(([emoji, userIds]) => ({
    emoji,
    count: userIds.length,
    userIds,
  }));
}

export async function getMoments(): Promise<MomentItem[]> {
  try {
    const dbMoments = await prisma.moment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
        reactions: true,
      },
    });

    return dbMoments.map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      imageUrl: m.imageUrl,
      category: m.category as any,
      likes: m.likes,
      authorId: m.authorId,
      author: {
        username: m.author?.username || 'SuperMalazz Warga',
        displayName: m.author?.displayName || 'Warga',
        avatar: m.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: m.author?.role || 'MALAZZ',
      },
      comments: (m.comments || []).map((c: any) => ({
        id: c.id,
        content: c.content,
        authorId: c.authorId,
        author: {
          username: c.author?.username || 'Warga',
          displayName: c.author?.displayName || null,
          avatar: c.author?.avatar || null,
          role: (c.author?.role as UserRole) || 'MALAZZ',
        },
        createdAt: c.createdAt.toISOString(),
      })),
      reactions: groupReactions(m.reactions || []),
      capturedAt: m.capturedAt ? m.capturedAt.toISOString() : null,
      createdAt: m.createdAt.toISOString(),
    }));
  } catch (err) {
    return inMemoryMoments;
  }
}

export async function deleteMoment(id: string): Promise<boolean> {
  try {
    await prisma.moment.delete({
      where: { id },
    });
  } catch (err) {
    // ignore
  }
  inMemoryMoments = inMemoryMoments.filter((m) => m.id !== id);
  return true;
}

export async function createMoment(data: {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar: string;
  authorRole: any;
  capturedAt?: string | Date | null;
}): Promise<MomentItem> {
  const capturedAtDate = data.capturedAt ? new Date(data.capturedAt) : null;

  try {
    // ensure author
    await prisma.user.upsert({
      where: { id: data.authorId },
      update: {},
      create: {
        id: data.authorId,
        username: data.authorUsername,
        displayName: data.authorDisplayName,
        avatar: data.authorAvatar,
        role: data.authorRole,
      },
    });

    const created = await prisma.moment.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        category: data.category,
        authorId: data.authorId,
        capturedAt: capturedAtDate,
      },
      include: { author: true },
    });

    const item: MomentItem = {
      id: created.id,
      title: created.title,
      description: created.description,
      imageUrl: created.imageUrl,
      category: created.category as any,
      likes: created.likes,
      authorId: created.authorId,
      author: {
        username: created.author.username,
        displayName: created.author.displayName,
        avatar: created.author.avatar,
        role: created.author.role,
      },
      comments: [],
      reactions: [],
      capturedAt: created.capturedAt ? created.capturedAt.toISOString() : null,
      createdAt: created.createdAt.toISOString(),
    };

    inMemoryMoments = [item, ...inMemoryMoments];
    return item;
  } catch (err) {
    console.error('🔥 Prisma createMoment error:', err);
    const item: MomentItem = {
      id: 'mom-' + Math.random().toString(36).substring(2, 9),
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      category: data.category as any,
      likes: 0,
      authorId: data.authorId,
      author: {
        username: data.authorUsername,
        displayName: data.authorDisplayName,
        avatar: data.authorAvatar,
        role: data.authorRole,
      },
      comments: [],
      reactions: [],
      capturedAt: capturedAtDate ? capturedAtDate.toISOString() : null,
      createdAt: new Date().toISOString(),
    };
    inMemoryMoments = [item, ...inMemoryMoments];
    return item;
  }
}

export async function addMomentComment(
  momentId: string,
  author: { id: string; username: string; displayName?: string | null; avatar?: string | null; role: UserRole },
  content: string
): Promise<CommentItem> {
  // Ensure author exists in DB
  await prisma.user.upsert({
    where: { id: author.id },
    update: {
      username: author.username,
      displayName: author.displayName || author.username,
      avatar: author.avatar || null,
      role: author.role,
    },
    create: {
      id: author.id,
      username: author.username,
      displayName: author.displayName || author.username,
      avatar: author.avatar || null,
      role: author.role,
    },
  });

  const comment = await prisma.momentComment.create({
    data: {
      content,
      momentId,
      authorId: author.id,
    },
    include: { author: true },
  });

  return {
    id: comment.id,
    content: comment.content,
    authorId: comment.authorId,
    author: {
      username: comment.author.username,
      displayName: comment.author.displayName,
      avatar: comment.author.avatar,
      role: (comment.author.role as UserRole) || 'MALAZZ',
    },
    createdAt: comment.createdAt.toISOString(),
  };
}

export async function deleteMomentComment(
  commentId: string,
  userId: string,
  role: string
): Promise<boolean> {
  const comment = await prisma.momentComment.findUnique({
    where: { id: commentId },
  });
  if (!comment) return false;
  if (comment.authorId !== userId && role !== 'CHEF') {
    throw new Error('Hanya pembuat komentar atau Chef yang dapat menghapus komentar.');
  }
  await prisma.momentComment.delete({ where: { id: commentId } });
  return true;
}

export async function toggleMomentReaction(
  momentId: string,
  user: { id: string; username: string; displayName?: string | null; avatar?: string | null; role: UserRole },
  emoji: string
): Promise<{ added: boolean; reactions: ReactionGroup[] }> {
  // Ensure author exists in DB
  await prisma.user.upsert({
    where: { id: user.id },
    update: {
      username: user.username,
      displayName: user.displayName || user.username,
      avatar: user.avatar || null,
      role: user.role,
    },
    create: {
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      avatar: user.avatar || null,
      role: user.role,
    },
  });

  const existing = await prisma.momentReaction.findUnique({
    where: {
      momentId_userId_emoji: {
        momentId,
        userId: user.id,
        emoji,
      },
    },
  });

  let added = false;
  if (existing) {
    await prisma.momentReaction.delete({
      where: { id: existing.id },
    });
    added = false;
  } else {
    await prisma.momentReaction.create({
      data: {
        momentId,
        userId: user.id,
        emoji,
      },
    });
    added = true;
  }

  const allReactions = await prisma.momentReaction.findMany({
    where: { momentId },
  });

  return {
    added,
    reactions: groupReactions(allReactions),
  };
}

