import { prisma } from './prisma';
import { AnnouncementItem, AnnouncementCategory, UserRole, CommentItem, ReactionGroup } from './types';
import { groupReactions } from './gallery';

// In-memory fallback dataset
let inMemoryAnnouncements: AnnouncementItem[] = [];

export async function getAnnouncements(): Promise<{ announcements: AnnouncementItem[]; isDatabaseConnected: boolean }> {
  try {
    const dbAnnouncements = await prisma.announcement.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        author: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
        reactions: true,
      },
    });

    return {
      announcements: dbAnnouncements.map((a: any) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        category: (a.category as AnnouncementCategory) || 'PENTING',
        isPinned: a.isPinned,
        authorId: a.authorId,
        author: {
          username: a.author?.username || 'SuperMalazz Admin',
          displayName: a.author?.displayName || 'Admin',
          role: (a.author?.role as UserRole) || 'CHEF',
          avatar: a.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        },
        comments: (a.comments || []).map((c: any) => ({
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
        reactions: groupReactions(a.reactions || []),
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt ? a.updatedAt.toISOString() : undefined,
      })),
      isDatabaseConnected: true,
    };
  } catch (error) {
    // Database query failed or offline
    return {
      announcements: inMemoryAnnouncements,
      isDatabaseConnected: false,
    };
  }
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  category?: AnnouncementCategory;
  isPinned: boolean;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorRole: UserRole;
  authorAvatar: string;
}): Promise<AnnouncementItem> {
  const category = data.category || 'PENTING';

  try {
    // Ensure author exists in DB
    await prisma.user.upsert({
      where: { id: data.authorId },
      update: {
        username: data.authorUsername,
        displayName: data.authorDisplayName,
        role: data.authorRole,
        avatar: data.authorAvatar,
      },
      create: {
        id: data.authorId,
        username: data.authorUsername,
        displayName: data.authorDisplayName,
        role: data.authorRole,
        avatar: data.authorAvatar,
      },
    });

    const created = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        category: category,
        isPinned: data.isPinned,
        authorId: data.authorId,
      },
      include: {
        author: true,
      },
    });

    const item: AnnouncementItem = {
      id: created.id,
      title: created.title,
      content: created.content,
      category: (created.category as AnnouncementCategory) || 'PENTING',
      isPinned: created.isPinned,
      authorId: created.authorId,
      author: {
        username: created.author.username,
        displayName: created.author.displayName,
        role: created.author.role as UserRole,
        avatar: created.author.avatar,
      },
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };

    inMemoryAnnouncements = [item, ...inMemoryAnnouncements];
    return item;
  } catch (error) {
    const newId = 'ann-' + Math.random().toString(36).substring(2, 9);
    const item: AnnouncementItem = {
      id: newId,
      title: data.title,
      content: data.content,
      category: category,
      isPinned: data.isPinned,
      authorId: data.authorId,
      author: {
        username: data.authorUsername,
        displayName: data.authorDisplayName,
        role: data.authorRole,
        avatar: data.authorAvatar,
      },
      createdAt: new Date().toISOString(),
    };

    inMemoryAnnouncements = [item, ...inMemoryAnnouncements];
    return item;
  }
}

export async function updateAnnouncement(
  id: string,
  data: {
    title?: string;
    content?: string;
    category?: AnnouncementCategory;
    isPinned?: boolean;
  }
): Promise<AnnouncementItem | null> {
  try {
    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
      },
      include: {
        author: true,
      },
    });

    const item: AnnouncementItem = {
      id: updated.id,
      title: updated.title,
      content: updated.content,
      category: (updated.category as AnnouncementCategory) || 'PENTING',
      isPinned: updated.isPinned,
      authorId: updated.authorId,
      author: {
        username: updated.author.username,
        displayName: updated.author.displayName,
        role: updated.author.role as UserRole,
        avatar: updated.author.avatar,
      },
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };

    inMemoryAnnouncements = inMemoryAnnouncements.map((a) => (a.id === id ? item : a));
    return item;
  } catch (error) {
    const index = inMemoryAnnouncements.findIndex((a) => a.id === id);
    if (index !== -1) {
      inMemoryAnnouncements[index] = {
        ...inMemoryAnnouncements[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return inMemoryAnnouncements[index];
    }
    return null;
  }
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  try {
    await prisma.announcement.delete({
      where: { id },
    });
    inMemoryAnnouncements = inMemoryAnnouncements.filter((a) => a.id !== id);
    return true;
  } catch (error) {
    inMemoryAnnouncements = inMemoryAnnouncements.filter((a) => a.id !== id);
    return true;
  }
}

export async function togglePinAnnouncement(id: string, isPinned: boolean): Promise<AnnouncementItem | null> {
  return updateAnnouncement(id, { isPinned });
}

export async function addAnnouncementComment(
  announcementId: string,
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

  const comment = await prisma.announcementComment.create({
    data: {
      content,
      announcementId,
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

export async function deleteAnnouncementComment(
  commentId: string,
  userId: string,
  role: string
): Promise<boolean> {
  const comment = await prisma.announcementComment.findUnique({
    where: { id: commentId },
  });
  if (!comment) return false;
  if (comment.authorId !== userId && role !== 'CHEF') {
    throw new Error('Hanya pembuat komentar atau Chef yang dapat menghapus komentar.');
  }
  await prisma.announcementComment.delete({ where: { id: commentId } });
  return true;
}

export async function toggleAnnouncementReaction(
  announcementId: string,
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

  const existing = await prisma.announcementReaction.findUnique({
    where: {
      announcementId_userId_emoji: {
        announcementId,
        userId: user.id,
        emoji,
      },
    },
  });

  let added = false;
  if (existing) {
    await prisma.announcementReaction.delete({
      where: { id: existing.id },
    });
    added = false;
  } else {
    await prisma.announcementReaction.create({
      data: {
        announcementId,
        userId: user.id,
        emoji,
      },
    });
    added = true;
  }

  const allReactions = await prisma.announcementReaction.findMany({
    where: { announcementId },
  });

  return {
    added,
    reactions: groupReactions(allReactions),
  };
}

