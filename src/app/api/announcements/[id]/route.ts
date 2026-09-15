import { NextRequest, NextResponse } from 'next/server';
import { updateAnnouncement, deleteAnnouncement, togglePinAnnouncement } from '@/lib/data';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT /api/announcements/[id] -> Update full/partial announcement
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, category, isPinned } = body;

    const updated = await updateAnnouncement(id, {
      title,
      content,
      category,
      isPinned,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Pengumuman tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui pengumuman.' }, { status: 500 });
  }
}

// PATCH /api/announcements/[id] -> Quick toggle pin status
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isPinned } = body;

    if (typeof isPinned !== 'boolean') {
      return NextResponse.json({ error: 'Nilai isPinned harus berupa boolean.' }, { status: 400 });
    }

    const updated = await togglePinAnnouncement(id, isPinned);

    if (!updated) {
      return NextResponse.json({ error: 'Pengumuman tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengubah status pin.' }, { status: 500 });
  }
}

// DELETE /api/announcements/[id] -> Delete announcement
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = await deleteAnnouncement(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Gagal menghapus pengumuman.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Pengumuman berhasil dihapus.' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus pengumuman.' }, { status: 500 });
  }
}
