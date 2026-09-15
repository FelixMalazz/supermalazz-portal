import { NextRequest, NextResponse } from 'next/server';
import { deleteMoment } from '@/lib/gallery';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const success = await deleteMoment(id);

    if (!success) {
      return NextResponse.json({ error: 'Momen tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Momen berhasil dihapus permanen' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus momen' }, { status: 500 });
  }
}
