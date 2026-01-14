import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Get all affiliate links
    const affiliateLinks = await db.collection('affiliateLinks').find({}).toArray();
    
    // Generate dummy click data for the last 7 days
    const clickData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      affiliateLinks.forEach(link => {
        // Generate random clicks between 1-15
        const clicks = Math.floor(Math.random() * 15) + 1;
        
        for (let j = 0; j < clicks; j++) {
          clickData.push({
            linkId: link._id,
            createdAt: new Date(dateStr + 'T' + Math.floor(Math.random() * 24).toString().padStart(2, '0') + ':' + Math.floor(Math.random() * 60).toString().padStart(2, '0') + ':00Z')
          });
        }
      });
    }

    // Insert dummy data (clear existing first)
    await db.collection('link_clicks').deleteMany({});
    if (clickData.length > 0) {
      await db.collection('link_clicks').insertMany(clickData);
    }

    return NextResponse.json({
      message: `Generated ${clickData.length} dummy clicks for testing`,
      links: affiliateLinks.length,
      days: 7
    });

  } catch (error) {
    console.error('Error generating dummy data:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}