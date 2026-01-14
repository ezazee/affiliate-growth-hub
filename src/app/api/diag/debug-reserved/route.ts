import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { affiliatorId } = await req.json();

    if (!affiliatorId) {
      return NextResponse.json({ error: 'affiliatorId is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Cek semua commissions
    const allCommissions = await db.collection('commissions').find({ affiliatorId }).toArray();
    
    // Cek reserved commissions
    const reservedCommissions = await db.collection('commissions').find({ 
      affiliatorId,
      status: 'reserved'
    }).toArray();

    // Cek withdrawals
    const withdrawals = await db.collection('withdrawals').find({ affiliatorId }).toArray();

    return NextResponse.json({
      allCommissions: allCommissions.map(c => ({
        id: c._id,
        amount: c.amount,
        status: c.status,
        usedAmount: c.usedAmount,
        isPartial: c.isPartial,
        withdrawalId: c.withdrawalId
      })),
      reservedCommissions: reservedCommissions.map(c => ({
        id: c._id,
        amount: c.amount,
        status: c.status,
        withdrawalId: c.withdrawalId
      })),
      withdrawals: withdrawals.map(w => ({
        id: w._id,
        amount: w.amount,
        status: w.status,
        rejectionReason: w.rejectionReason
      }))
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}