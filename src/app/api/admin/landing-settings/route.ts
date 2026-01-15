import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Get landing page settings
export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'MongoDB URI not configured' }, { status: 500 });
    }

    const client = await clientPromise;
    const db = client.db();
    const settingsCursor = db.collection('settings').find({});
    const settingsArray = await settingsCursor.toArray();
    
    // Transform array into a key-value object with proper typing
    const settings = settingsArray.reduce((acc, setting) => {
      acc[setting.name] = setting.value;
      return acc;
    }, {} as Record<string, any>);

    // Extract only landing page settings with defaults
    const landingSettings = {
      aboutTitle: settings.landingAboutTitle || 'Tentang PE Skinpro',
      aboutDescription: settings.landingAboutDescription || 'PE Skin Professional didirikan pada satu dekade yang lalu dengan tujuan untuk memproduksi produk perawatan kecantikan pribadi yang terjangkau oleh semua orang.',
      aboutImage: settings.landingAboutImage || '',
      heroTitle: settings.landingHeroTitle || 'Dapatkan Penghasilan Hingga 10%',
      heroDescription: settings.landingHeroDescription || 'Bergabunglah dengan program affiliate PE Skinpro dan dapatkan komisi menarik dari setiap penjualan.',
      instagramUrl: settings.landingInstagramUrl || 'https://www.instagram.com/peskinproid',
      tiktokUrl: settings.landingTiktokUrl || 'https://www.tiktok.com/@peskinproid',
      shopeeUrl: settings.landingShopeeUrl || 'https://shopee.co.id/peskinpro_id',
      websiteUrl: settings.landingWebsiteUrl || 'https://peskinpro.id',
      whatsappNumber: settings.landingWhatsappNumber || '0821-2316-7895',
      email: settings.landingEmail || 'adm.peskinproid@gmail.com',
      footerDescription: settings.landingFooterDescription || 'Program affiliate resmi PE Skinpro. Dapatkan komisi menarik dari setiap penjualan produk skincare berkualitas.',
    };

    return NextResponse.json(landingSettings);
  } catch (error) {
    console.error('Error fetching landing page settings:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch landing page settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Update landing page settings
export async function POST(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'MongoDB URI not configured' }, { status: 500 });
    }

    const body = await req.json();
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Update each setting
    const updatePromises = Object.entries(body).map(([key, value]) => {
      const settingName = `landing${key.charAt(0).toUpperCase() + key.slice(1)}`;
      return db.collection('settings').updateOne(
        { name: settingName },
        { $set: { name: settingName, value } },
        { upsert: true }
      );
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ message: 'Landing page settings updated successfully' });
  } catch (error) {
    console.error('Error updating landing page settings:', error);
    return NextResponse.json({ 
      error: 'Failed to update landing page settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}