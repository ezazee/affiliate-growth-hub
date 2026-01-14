import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Get all settings
export async function GET() {
  try {
    // Validate MongoDB connection first
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'MongoDB URI not configured' }, { status: 500 });
    }

    const client = await clientPromise;
    const db = client.db();
    const settingsCursor = db.collection('settings').find({});
    const settingsArray = await settingsCursor.toArray();
    
    // Transform the array into a key-value object
    const settings = settingsArray.reduce((acc, setting) => {
      acc[setting.name] = setting.value;
      return acc;
    }, {});

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    
    // Ensure we always return JSON, even for unexpected errors
    return NextResponse.json({ 
      error: 'Failed to fetch settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Update a specific setting
export async function POST(req: NextRequest) {
  try {
    // Validate MongoDB connection first
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'MongoDB URI not configured' }, { status: 500 });
    }

    const { name, value } = await req.json();

    if (!name || value === undefined) {
      return NextResponse.json({ error: 'Invalid setting format. "name" and "value" are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection('settings').updateOne(
      { name: name },
      { $set: { name, value } },
      { upsert: true }
    );

    return NextResponse.json({ message: `Setting '${name}' updated successfully` });
  } catch (error) {
    console.error('Error updating setting:', error);
    
    // Ensure we always return JSON, even for unexpected errors
    return NextResponse.json({ 
      error: 'Failed to update setting',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

