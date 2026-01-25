import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { affiliatorNotifications } from '@/lib/notification-service-server';
import { webNotificationService } from '@/lib/web-notification-service';

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

    // Get affiliator info for notifications
    const affiliator = await db.collection('users').findOne({ _id: new ObjectId(withdrawal.affiliatorId) });

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
        }
      }
    }

    // Send notifications
    try {
      if (affiliator && affiliator.email) {
        if (status === 'approved' || status === 'completed') {
          await affiliatorNotifications.withdrawalApproved(
            withdrawal.amount.toLocaleString('id-ID'),
            new Date().toLocaleString('id-ID'),
            affiliator.email
          );

          // Update balance notification
          const allCommissions = await db.collection('commissions').find({
            affiliatorId: withdrawal.affiliatorId,
            status: 'paid'
          }).toArray();

          const availableBalance = allCommissions.reduce((sum, commission) => {
            const usedAmount = commission.usedAmount || 0;
            return sum + (commission.amount - usedAmount);
          }, 0);

          await affiliatorNotifications.balanceUpdated(
            availableBalance.toLocaleString('id-ID'),
            affiliator.email
          );

        } else if (status === 'rejected') {
          await affiliatorNotifications.withdrawalRejected(
            withdrawal.amount.toLocaleString('id-ID'),
            rejectionReason || 'Admin rejection',
            affiliator.email
          );
        }
      }


    } catch (notificationError) {
      console.error('❌ Failed to send notifications for withdrawal update:', notificationError);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}