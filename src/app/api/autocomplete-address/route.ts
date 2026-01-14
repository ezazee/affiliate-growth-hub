import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text');

    if (!text) {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    // Simple mock suggestions - in production you might use Google Places API or similar
    const mockSuggestions = [
      `${text} Street, Jakarta`,
      `${text} Road, Jakarta Selatan`,
      `${text} Avenue, Jakarta Pusat`,
    ].filter(addr => addr.length > text.length + 5);

    return NextResponse.json(mockSuggestions);
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch address suggestions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}