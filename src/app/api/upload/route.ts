import { put } from '@vercel/blob';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 2MB for optimal performance)
    const maxSize = 2 * 1024 * 1024; // 2MB
    const recommendedSize = 500 * 1024; // 500KB
    
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size must be less than 2MB for optimal performance',
        suggestion: 'Please compress your image to under 2MB. Recommended size is under 500KB.',
        actualSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
      }, { status: 400 });
    }

    // Warning for large files (1MB+)
    let sizeWarning = null;
    if (file.size > recommendedSize) {
      sizeWarning = `Image size is ${(file.size / 1024).toFixed(0)}KB. For optimal loading speed, consider compressing to under 500KB.`;
    }

    // Check for BLOB_READ_WRITE_TOKEN environment variable
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not set');
      return NextResponse.json({ 
        error: 'Blob storage is not configured. Please check environment variables.',
        details: 'BLOB_READ_WRITE_TOKEN is missing'
      }, { status: 500 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `landing-about-${timestamp}.${fileExtension}`;

    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type,
    });

    const response = {
      success: true,
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
      sizeKB: Math.round(file.size / 1024),
      type: file.type
    };

    // Add warning if file is large
    if (sizeWarning) {
      return NextResponse.json({ 
        ...response,
        warning: sizeWarning
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error uploading image to Vercel Blob:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to upload image';
    let errorDetails = 'Unknown error';
    
    if (error instanceof Error) {
      errorDetails = error.message;
      
      // Check for common Vercel Blob errors
      if (error.message.includes('BLOB_READ_WRITE_TOKEN')) {
        errorMessage = 'Blob storage authentication failed';
        errorDetails = 'BLOB_READ_WRITE_TOKEN is invalid or missing';
      } else if (error.message.includes('quota')) {
        errorMessage = 'Blob storage quota exceeded';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error during upload';
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: errorDetails
    }, { status: 500 });
  }
}