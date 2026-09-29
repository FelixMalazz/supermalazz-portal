import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateAnnouncement, deleteAnnouncement, togglePinAnnouncement } from '@/lib/data';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT /api/announcements/[id] -> Update announcement (Author or CHEF)
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu.' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Pengumuman tidak ditemukan.' }, { status: 404 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    const isChef = (dbUser?.role || user.role) === 'CHEF';
    const isAuthor = existing.authorId === user.id;

    if (!isChef && !isAuthor) {
      return NextResponse.json(
        { error: 'Akses ditolak. Anda hanya dapat mengedit pengumuman yang Anda buat sendiri.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, category, isPinned } = body;

    // Only CHEF can toggle isPinned during edit
    const finalPinned = isChef && typeof isPinned === 'boolean' ? isPinned : existing.isPinned;

    const updated = await updateAnnouncement(id, {
      title,
      content,
      category,
      isPinned: finalPinned,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Gagal memperbarui pengumuman.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui pengumuman.' }, { status: 500 });
  }
}

// PATCH /api/announcements/[id] -> Toggle pin status (CHEF only)
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu.' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    const isChef = (dbUser?.role || user.role) === 'CHEF';

    if (!isChef) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya peran CHEF yang dapat menyematkan (pin) pengumuman.' },
        { status: 403 }
      );
    }

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

// DELETE /api/announcements/[id] -> Delete announcement (Author or CHEF)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu.' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Pengumuman tidak ditemukan.' }, { status: 404 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    const isChef = (dbUser?.role || user.role) === 'CHEF';
    const isAuthor = existing.authorId === user.id;

    if (!isChef && !isAuthor) {
      return NextResponse.json(
        { error: 'Akses ditolak. Anda hanya dapat menghapus pengumuman milik Anda sendiri.' },
        { status: 403 }
      );
    }

    const deleted = await deleteAnnouncement(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Gagal menghapus pengumuman.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Pengumuman berhasil dihapus.' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus pengumuman.' }, { status: 500 });
  }
}
