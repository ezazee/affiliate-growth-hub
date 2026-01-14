import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { withdrawalId, status } = await req.json();

    if (!withdrawalId || !status) {
      return NextResponse.json({ error: 'Missing required fields: withdrawalId, status' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const withdrawalsCollection = db.collection('withdrawals');
    const commissionsCollection = db.collection('commissions');
    
    // Get withdrawal details
    const withdrawal = await withdrawalsCollection.findOne({ _id: new ObjectId(withdrawalId) });
    
    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }
    
    // Update withdrawal status
    await withdrawalsCollection.updateOne(
      { _id: new ObjectId(withdrawalId) },
      { $set: { 
        status,
        processedAt: new Date(),
        updatedAt: new Date()
      } }
    );
    
    // If approved or completed, mark commissions as withdrawn
    if (status === 'approved' || status === 'completed') {
      // Find approved commissions for this affiliator
      const approvedCommissions = await commissionsCollection.find({
        affiliatorId: withdrawal.affiliatorId,
        status: 'approved'
      }).toArray();
      
      // Mark enough commissions as withdrawn to cover the withdrawal amount
      let amountToCover = withdrawal.amount;
      for (const commission of approvedCommissions) {
        if (amountToCover > 0) {
          await commissionsCollection.updateOne(
            { _id: commission._id },
            { $set: { 
              status: 'withdrawn',
              withdrawalId: withdrawalId
            }}
          );
          amountToCover -= commission.amount;
        } else {
          break;
        }
      }
    }
    
    return NextResponse.json({ success: true, message: 'Withdrawal status updated' });
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    return NextResponse.json({ error: 'Failed to update withdrawal' }, { status: 500 });
  }
}