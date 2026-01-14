import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const affiliateLinks = await db.collection('affiliateLinks')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'affiliatorId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            'user.password': 0 // Exclude password
          }
        }
      ])
      .toArray();
    
    return NextResponse.json(affiliateLinks);
  } catch (error) {
    console.error('Error fetching affiliate links:', error);
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}