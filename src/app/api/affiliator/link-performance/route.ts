import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const affiliatorId = searchParams.get('affiliatorId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const timezone = searchParams.get('timezone') || 'Asia/Jakarta';

  if (!affiliatorId) {
    return NextResponse.json({ error: 'affiliatorId is required' }, { status: 400 });
  }
  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const affiliateLinks = await db.collection('affiliateLinks').find({ affiliatorId }).toArray();
    const linkIds = affiliateLinks.map(link => link._id);

    const clickData = await db.collection('link_clicks').aggregate([
      {
        $match: {
          linkId: { $in: linkIds },
        },
      },
      {
        $addFields: {
          convertedDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: timezone
            }
          }
        }
      },
      {
        $match: {
          convertedDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            date: '$convertedDate',
            linkId: '$linkId'
          },
          clicks: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          linkId: '$_id.linkId',
          clicks: 1,
        },
      },
    ]).toArray();

    return NextResponse.json(clickData);
  } catch (error) {
    console.error('Error fetching link performance data:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
