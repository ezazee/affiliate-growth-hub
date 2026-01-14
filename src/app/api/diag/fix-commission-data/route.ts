import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { affiliatorId } = await req.json();

    if (!affiliatorId) {
      return NextResponse.json({ error: 'affiliatorId is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const commissionsCollection = db.collection('commissions');

    // 1. Cari semua commissions untuk affiliator ini
    const allCommissions = await commissionsCollection.find({ affiliatorId }).toArray();

    console.log('All commissions:', allCommissions.map(c => ({
      id: c._id,
      amount: c.amount,
      status: c.status,
      usedAmount: c.usedAmount,
      isPartial: c.isPartial,
      parentCommissionId: c.parentCommissionId
    })));

    // 2. Group by orderId untuk temukan komisi asli vs partial
    const commissionsByOrder: { [key: string]: any[] } = {};
    
    allCommissions.forEach(commission => {
      const orderId = commission.orderId;
      if (!commissionsByOrder[orderId]) {
        commissionsByOrder[orderId] = [];
      }
      commissionsByOrder[orderId].push(commission);
    });

    // 3. Get actual withdrawal amounts
    const withdrawals = await db.collection('withdrawals').find({ affiliatorId }).toArray();
    const totalWithdrawnAmount = withdrawals
      .filter(w => w.status === 'pending' || w.status === 'approved' || w.status === 'completed')
      .reduce((sum, w) => sum + w.amount, 0);

    // 4. Fix setiap order
    for (const [orderId, orderCommissions] of Object.entries(commissionsByOrder)) {
      const mainCommission = (orderCommissions as any[]).find(c => !c.isPartial);
      const partialCommissions = (orderCommissions as any[]).filter(c => c.isPartial);

      if (mainCommission) {
        // Update main commission dengan actual withdrawal amount
        await commissionsCollection.updateOne(
          { _id: mainCommission._id },
          { 
            $set: { 
              status: 'paid', // Reset ke paid
              usedAmount: Math.min(totalWithdrawnAmount, mainCommission.amount), // Jangan melebihi amount
            },
            $unset: { // Hapus fields yang tidak perlu
              withdrawalId: 1,
              processedAt: 1
            }
          }
        );

        // Delete semua partial commissions
        for (const partial of partialCommissions) {
          await commissionsCollection.deleteOne({ _id: partial._id });
        }

        console.log(`Fixed order ${orderId}: main commission updated with usedAmount=${Math.min(totalWithdrawnAmount, mainCommission.amount)}, deleted ${partialCommissions.length} partial commissions`);
      }
    }

    // 4. Delete withdrawal transactions yang tidak perlu
    await db.collection('withdrawal_transactions').deleteMany({ affiliatorId });

    return NextResponse.json({ 
      message: 'Commission data fixed successfully',
      fixedOrders: Object.keys(commissionsByOrder).length
    });

  } catch (error) {
    console.error('Error fixing commission data:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}