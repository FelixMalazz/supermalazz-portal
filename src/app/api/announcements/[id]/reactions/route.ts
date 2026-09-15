import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { toggleAnnouncementReaction } from '@/lib/data';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu untuk memberikan reaksi.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const emoji = body.emoji?.trim();

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji reaksi diperlukan.' }, { status: 400 });
    }

    const result = await toggleAnnouncementReaction(
      id,
      {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
      },
      emoji
    );

    return NextResponse.json({
      success: true,
      added: result.added,
      reactions: result.reactions,
    });
  } catch (error: any) {
    console.error('Toggle announcement reaction error:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengubah reaksi.' }, { status: 500 });
  }
}