import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteMoment } from '@/lib/gallery';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu.' }, { status: 401 });
    }

    // Verify role directly from database to prevent tampering
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    const isChef = (dbUser?.role || user.role) === 'CHEF';
    if (!isChef) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya peran CHEF (Admin) yang memiliki izin menghapus foto momen di galeri.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const success = await deleteMoment(id);

    if (!success) {
      return NextResponse.json({ error: 'Momen tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Momen berhasil dihapus permanen.' });
  } catch (error: any) {
    console.error('Delete moment error:', error);
    return NextResponse.json({ error: error.message || 'Gagal menghapus momen' }, { status: 500 });
  }
}
