import { put } from '@vercel/blob';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  // Check for the BLOB_READ_WRITE_TOKEN environment variable
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN is not set' }, { status: 500 });
  }

  // Ensure request body is available for blob upload
  if (!request.body) {
    return NextResponse.json({ error: 'Request body is empty' }, { status: 400 });
  }

  try {
    const blob = await put(filename || 'untitled.jpg', request.body, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: request.headers.get('content-type') || undefined,
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Error uploading image to Vercel Blob:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
