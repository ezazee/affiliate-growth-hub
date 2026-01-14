import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, rejectionReason } = body;

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get withdrawal details
    const withdrawal = await db.collection('withdrawals').findOne({ _id: new ObjectId(id) });
    
    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    // Update withdrawal status
    const result = await db.collection('withdrawals').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          processedAt: new Date(),
          updatedAt: new Date(),
          ...(status === 'rejected' && rejectionReason && { rejectionReason })
        }
      },
      { returnDocument: 'after' }
    );

    // Handle commission status based on withdrawal status
    const commissionsCollection = db.collection('commissions');
    
    // Find all reserved commissions for this withdrawal
    const reservedCommissions = await commissionsCollection.find({
      withdrawalId: id,
      status: 'reserved'
    }).toArray();
    
    if (status === 'approved' || status === 'completed') {
      // Mark reserved commissions as withdrawn (final)
      for (const reserved of reservedCommissions) {
        await commissionsCollection.updateOne(
          { _id: reserved._id },
          { $set: { status: 'withdrawn' } }
        );
      }
      console.log(`Withdrawal ${id} approved, ${reservedCommissions.length} commissions marked as withdrawn`);
      
    } else if (status === 'rejected') {
      // Kembalikan saldo
      for (const reserved of reservedCommissions) {
        if (reserved.isPartial && reserved.parentCommissionId) {
          // Delete reserved commission
          await commissionsCollection.deleteOne({ _id: reserved._id });
          
          // Kembalikan usedAmount di parent commission
          await commissionsCollection.updateOne(
            { _id: new ObjectId(reserved.parentCommissionId) },
            { $inc: { usedAmount: -reserved.amount } }
          );
          
          console.log(`Restored ${reserved.amount} to parent commission ${reserved.parentCommissionId}`);
        }
      }
      
      console.log(`Withdrawal ${id} rejected, balance restored for ${reservedCommissions.length} reserved commissions`);
    }
    
    console.log('Withdrawal approval debug:', {
      withdrawalId: id,
      newStatus: status,
      reservedCommissionsFound: status === 'rejected' ? (await db.collection('commissions').countDocuments({ withdrawalId: id, status: 'reserved' })) : 0
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}