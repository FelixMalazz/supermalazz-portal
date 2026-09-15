import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { addMomentComment, deleteMomentComment } from '@/lib/gallery';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu untuk berkomentar.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const content = body.content?.trim();

    if (!content) {
      return NextResponse.json({ error: 'Isi komentar tidak boleh kosong.' }, { status: 400 });
    }

    const comment = await addMomentComment(
      id,
      {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
      },
      content
    );

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error: any) {
    console.error('Add moment comment error:', error);
    return NextResponse.json({ error: error.message || 'Gagal menambahkan komentar.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: 'ID komentar diperlukan.' }, { status: 400 });
    }

    await deleteMomentComment(commentId, user.id, user.role);

    return NextResponse.json({ success: true, message: 'Komentar berhasil dihapus.' });
  } catch (error: any) {
    console.error('Delete moment comment error:', error);
    return NextResponse.json({ error: error.message || 'Gagal menghapus komentar.' }, { status: 500 });
  }
}