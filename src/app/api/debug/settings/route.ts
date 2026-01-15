import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'MongoDB URI not configured' }, { status: 500 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Get all settings
    const settingsCursor = db.collection('settings').find({});
    const settingsArray = await settingsCursor.toArray();
    
    // Filter only landing related settings
    const landingSettings = settingsArray.filter(setting => 
      setting.name && setting.name.includes('landing')
    );
    
    return NextResponse.json({
      totalSettings: settingsArray.length,
      landingSettings: landingSettings,
      allSettings: settingsArray.map(s => ({ name: s.name, value: s.value }))
    });
  } catch (error) {
    console.error('Debug settings error:', error);
    return NextResponse.json({ 
      error: 'Failed to debug settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}