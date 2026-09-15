import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getMoments, createMoment } from '@/lib/gallery';

export async function GET() {
  try {
    const moments = await getMoments();
    return NextResponse.json({ moments });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil momen' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { title, description, imageUrl, category, capturedAt } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Judul dan URL gambar wajib diisi.' }, { status: 400 });
    }

    const authorId = user?.id || '10001';
    const authorUsername = user?.username || 'SuperMalazz';
    const authorDisplayName = user?.displayName || 'SuperMalazz Admin';
    const authorAvatar = user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    const authorRole = (user?.role as any) || 'CHEF';

    const newMoment = await createMoment({
      title,
      description: description || '',
      imageUrl,
      category: category || 'MABAR',
      authorId,
      authorUsername,
      authorDisplayName,
      authorAvatar,
      authorRole,
      capturedAt: capturedAt || null,
    });

    return NextResponse.json({ success: true, moment: newMoment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan momen' }, { status: 500 });
  }
}
