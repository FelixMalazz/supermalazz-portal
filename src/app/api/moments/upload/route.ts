import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { put } from '@vercel/blob';
import { getCurrentUser } from '@/lib/auth';
import { createMoment } from '@/lib/gallery';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const formData = await request.formData();

    // Get all uploaded files
    const files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Tidak ada file foto yang dipilih.' }, { status: 400 });
    }

    // Get metadata array (JSON string) or default
    let metadataList: Array<{
      title?: string;
      description?: string;
      category?: string;
      capturedAt?: string;
    }> = [];

    const metadataRaw = formData.get('metadata');
    if (metadataRaw && typeof metadataRaw === 'string') {
      try {
        metadataList = JSON.parse(metadataRaw);
      } catch (e) {
        metadataList = [];
      }
    }

    // Global default category if provided
    const defaultCategory = (formData.get('defaultCategory') as string) || 'MABAR';

    // Author info
    const authorId = user?.id || '10001';
    const authorUsername = user?.username || 'SuperMalazz';
    const authorDisplayName = user?.displayName || 'SuperMalazz Admin';
    const authorAvatar = user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    const authorRole = (user?.role as any) || 'CHEF';

    // Ensure local public/uploads/moments directory exists (for local development)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'moments');
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const createdMoments = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || typeof file === 'string' || !file.name) continue;

      // Clean file extension & name
      const ext = path.extname(file.name).toLowerCase() || '.jpg';
      const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
      const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanBase}${ext}`;

      let imageUrl = '';
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        // Upload to Vercel Blob cloud storage
        const blob = await put(`moments/${uniqueFilename}`, file, {
          access: 'public',
        });
        imageUrl = blob.url;
      } else {
        // Write file buffer to local disk
        const filePath = path.join(uploadDir, uniqueFilename);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await fs.writeFile(filePath, buffer);
        imageUrl = `/uploads/moments/${uniqueFilename}`;
      }

      // Metadata for this specific file
      const meta = metadataList[i] || {};
      const title = meta.title?.trim() || cleanBase.replace(/_/g, ' ') || `Momen #${i + 1}`;
      const description = meta.description?.trim() || '';
      const category = meta.category || defaultCategory;
      const capturedAt = meta.capturedAt || null;

      const newMoment = await createMoment({
        title,
        description,
        imageUrl,
        category,
        authorId,
        authorUsername,
        authorDisplayName,
        authorAvatar,
        authorRole,
        capturedAt,
      });

      createdMoments.push(newMoment);
    }

    return NextResponse.json({
      success: true,
      count: createdMoments.length,
      moments: createdMoments,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Upload moment error:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengunggah foto momen' }, { status: 500 });
  }
}
