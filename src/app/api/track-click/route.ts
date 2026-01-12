import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { AffiliateLink } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { ref } = await req.json();

    if (!ref) {
      return NextResponse.json({ error: 'ref is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find the link to get its ID
    const link = await db.collection<AffiliateLink>('affiliateLinks').findOne({ code: ref });

    if (link) {
      // Insert a new document into the link_clicks collection
      await db.collection('link_clicks').insertOne({
        linkId: link._id,
        createdAt: new Date(),
      });
    } else {
      console.warn(`Click tracking: Affiliate link with code "${ref}" not found.`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    // Return a generic success response to avoid leaking error details.
    return NextResponse.json({ success: true });
  }
}

