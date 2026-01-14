import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const settingsCollection = db.collection('settings');
    const minimumWithdrawalSetting = await settingsCollection.findOne({ name: 'minimumWithdrawal' });
    const adminWhatsAppSetting = await settingsCollection.findOne({ name: 'adminWhatsApp' });
    
    const minimumWithdrawalAmount = minimumWithdrawalSetting?.value || 50000;
    const adminWhatsApp = adminWhatsAppSetting?.value || '628123456789';
    
    return NextResponse.json({ 
      minimumWithdrawal: minimumWithdrawalAmount,
      adminWhatsApp: adminWhatsApp
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, value } = await req.json();

    if (!name || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields: name, value' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const settingsCollection = db.collection('settings');
    
    await settingsCollection.updateOne(
      { name },
      { $set: { name, value, updatedAt: new Date() } },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true, message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}