import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { title, message, type, url, actionUrl, targetUserEmail } = await req.json();

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: 'Title, message, and type are required' },
        { status: 400 }
      );
    }

    // Store notification in memory for demo purposes
    console.log('🔔 Web notification stored:', {
      title,
      message,
      type,
      url,
      actionUrl,
      targetUserEmail,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Web notification stored successfully' 
    });

  } catch (error) {
    console.error('Web notification error:', error);
    return NextResponse.json(
      { error: 'Failed to store web notification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Web Notification API',
    usage: {
      endpoint: '/api/web/notifications',
      method: 'POST',
      body: {
        title: 'Notification Title',
        message: 'Notification message',
        type: "info", // atau "success", "warning", "error"
        url: '/optional-url',
        actionUrl: '/optional-action-url',
        targetUserEmail: 'user@example.com'
      }
    }
  });
}