import { prisma } from './prisma';

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
  capturedAt?: string | null;
  createdAt: string;
}

let inMemoryMoments: MomentItem[] = [];

export async function getMoments(): Promise<MomentItem[]> {
  try {
    const dbMoments = await prisma.moment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: true },
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
      capturedAt: capturedAtDate ? capturedAtDate.toISOString() : null,
      createdAt: new Date().toISOString(),
    };
    inMemoryMoments = [item, ...inMemoryMoments];
    return item;
  }
}
