import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAnnouncements, createAnnouncement } from '@/lib/data';
import { UserRole } from '@/lib/types';

export async function GET() {
  try {
    const data = await getAnnouncements();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil pengumuman' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { title, content, category, isPinned } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Judul dan konten pengumuman wajib diisi.' }, { status: 400 });
    }

    const authorId = user?.id || '10001';
    const authorUsername = user?.username || 'ChefMaster';
    const authorDisplayName = user?.displayName || 'Bang Chef (Founder)';
    const authorRole = (user?.role as UserRole) || 'CHEF';
    const authorAvatar = user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

    const newAnnouncement = await createAnnouncement({
      title,
      content,
      category,
      isPinned: Boolean(isPinned),
      authorId,
      authorUsername,
      authorDisplayName,
      authorRole,
      authorAvatar,
    });

    return NextResponse.json({ success: true, announcement: newAnnouncement }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan pengumuman' }, { status: 500 });
  }
}
