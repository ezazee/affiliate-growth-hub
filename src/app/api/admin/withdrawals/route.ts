import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Withdrawal } from '@/types/withdrawal';
import { User } from '@/types/user';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const withdrawals = await db.collection<Withdrawal>('withdrawals')
      .find({})
      .sort({ requestedAt: -1 })
      .toArray();

    const formattedWithdrawals = withdrawals.map(withdrawal => ({
      ...withdrawal,
      id: withdrawal._id.toString(),
    }));

    return NextResponse.json(formattedWithdrawals);
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { withdrawalId, status } = await req.json();

    if (!withdrawalId || !status) {
      return NextResponse.json({ error: 'withdrawalId and status are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('withdrawals').findOneAndUpdate(
      { _id: new ObjectId(withdrawalId) },
      { 
        $set: { 
          status,
          processedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}