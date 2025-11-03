import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';
import { deleteGuide } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';
import { sql } from '@vercel/postgres';

function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Example: https://res.cloudinary.com/<cloud>/image/upload/v1699999999/nietladenindepiek/guides/abc123.jpg
    const u = new URL(url);
    const parts = u.pathname.split('/');
    // Find the index of our folder path and reconstruct without extension and version segment
    const uploadIdx = parts.findIndex((p) => p === 'upload');
    if (uploadIdx === -1) return null;
    const afterUpload = parts.slice(uploadIdx + 1); // [ 'v1699...', 'nietladenindepiek', 'guides', 'abc123.jpg' ]
    // Remove version if present (starts with 'v' followed by digits)
    const withoutVersion = afterUpload[0]?.startsWith('v') ? afterUpload.slice(1) : afterUpload;
    const publicPath = withoutVersion.join('/');
    // Drop extension
    const lastDot = publicPath.lastIndexOf('.');
    const noExt = lastDot > -1 ? publicPath.slice(0, lastDot) : publicPath;
    return noExt;
  } catch {
    return null;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasRole(session.user.roles, 'MODERATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guideId = parseInt(params.id);
    if (isNaN(guideId)) {
      return NextResponse.json({ error: 'Invalid guide ID' }, { status: 400 });
    }

    // Collect step images to delete from Cloudinary
    const steps = await sql`
      SELECT image_url FROM guide_steps WHERE guide_id = ${guideId} AND image_url IS NOT NULL
    `;
    const urls: string[] = (steps.rows as Array<{ image_url: string | null }>)
      .map((r) => r.image_url || '')
      .filter((u: string) => Boolean(u));

    // Best-effort delete images
    for (const url of urls) {
      const publicId = extractPublicIdFromUrl(url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Error deleting Cloudinary image:', { publicId, err });
        }
      }
    }

    // Delete guide (cascades to steps and links)
    await deleteGuide(guideId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guide:', error);
    return NextResponse.json({ error: 'Failed to delete guide' }, { status: 500 });
  }
}


