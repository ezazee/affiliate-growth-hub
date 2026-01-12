import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Commission } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const commissions = await db.collection<Commission>('commissions').find({}).sort({ createdAt: -1 }).toArray();

    // Map _id to id for consistency with frontend
    const formattedCommissions = commissions.map(commission => {
      return {
        ...commission,
        id: commission._id.toString(),
      };
    });

    return NextResponse.json(formattedCommissions);
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { commissionId, status } = await req.json();

    if (!commissionId || !status) {
      return NextResponse.json({ error: 'commissionId and status are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('commissions').findOneAndUpdate(
      { _id: new ObjectId(commissionId) },
      { $set: { status: status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }
    
    const updatedCommission = {
        ...result,
        id: result._id.toString()
    };

    return NextResponse.json(updatedCommission);
  } catch (error) {
    console.error('Error updating commission:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
