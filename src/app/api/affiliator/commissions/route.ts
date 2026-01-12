import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Commission } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const affiliatorId = searchParams.get('affiliatorId');

  if (!affiliatorId) {
    return NextResponse.json({ error: 'affiliatorId is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const userCommissions = await db.collection('commissions').aggregate([
      { $match: { affiliatorId } },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: 'id',
          as: 'order'
        }
      },
      {
        $unwind: {
          path: '$order',
          preserveNullAndEmptyArrays: true
        }
      }
    ]).sort({ createdAt: -1 }).toArray();

    const formattedCommissions = userCommissions.map(commission => {
      return {
        ...commission,
        id: commission._id.toString(),
      };
    });

    return NextResponse.json(formattedCommissions);
  } catch (error) {
    console.error('Error fetching commissions:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
