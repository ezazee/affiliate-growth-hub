import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Get public landing page settings
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
    console.error('Error fetching public landing page settings:', error);
    // Return default settings on error
    const defaultSettings = {
      aboutTitle: 'Tentang PE Skinpro',
      aboutDescription: 'PE Skin Professional didirikan pada satu dekade yang lalu dengan tujuan untuk memproduksi produk perawatan kecantikan pribadi yang terjangkau oleh semua orang.',
      aboutImage: '',
      heroTitle: 'Dapatkan Penghasilan Hingga 10%',
      heroDescription: 'Bergabunglah dengan program affiliate PE Skinpro dan dapatkan komisi menarik dari setiap penjualan.',
      instagramUrl: 'https://www.instagram.com/peskinproid',
      tiktokUrl: 'https://www.tiktok.com/@peskinproid',
      shopeeUrl: 'https://shopee.co.id/peskinpro_id',
      websiteUrl: 'https://peskinpro.id',
      whatsappNumber: '0821-2316-7895',
      email: 'adm.peskinproid@gmail.com',
      footerDescription: 'Program affiliate resmi PE Skinpro. Dapatkan komisi menarik dari setiap penjualan produk skincare berkualitas.',
    };
    return NextResponse.json(defaultSettings);
  }
}