import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Commission } from '@/types';
import { Withdrawal } from '@/types/withdrawal';
import { ObjectId } from 'mongodb';
import { adminNotifications, affiliatorNotifications } from '@/lib/notification-service-server';
import { webNotificationService } from '@/lib/web-notification-service';

// GET handler to fetch withdrawal history
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const affiliatorId = searchParams.get('affiliatorId');

  if (!affiliatorId) {
    return NextResponse.json({ error: 'affiliatorId is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const withdrawals = await db.collection<Withdrawal>('withdrawals')
      .find({ affiliatorId })
      .sort({ requestedAt: -1 })
      .toArray();
      
    const formattedWithdrawals = withdrawals.map(w => ({ ...w, id: w._id.toString() }));

    return NextResponse.json(formattedWithdrawals);
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// POST handler to create a new withdrawal request
export async function POST(req: NextRequest) {
  try {
    const { affiliatorId, amount, bankDetails } = await req.json();

    if (!affiliatorId || !amount || !bankDetails) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const requestedAmount = Number(amount);
    if (isNaN(requestedAmount) || requestedAmount <= 0) {
        return NextResponse.json({ error: 'Invalid withdrawal amount' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Fetch minimum withdrawal from settings
    const settingsCollection = db.collection('settings');
    const minimumWithdrawalSetting = await settingsCollection.findOne({ name: 'minimumWithdrawal' });
    const minimumWithdrawalAmount = minimumWithdrawalSetting?.value || 10000;
    
    if (requestedAmount < minimumWithdrawalAmount) {
        return NextResponse.json({ error: `Minimum withdrawal amount is Rp${minimumWithdrawalAmount.toLocaleString('id-ID')}` }, { status: 400 });
    }

    const commissionsCollection = db.collection<Commission>('commissions');
    const withdrawalsCollection = db.collection<Withdrawal>('withdrawals');

    // 1. Calculate withdrawable balance menggunakan balance tracking
    const availableCommissions = await commissionsCollection.find({ 
        affiliatorId, 
        status: 'paid'
    }).sort({ date: 1 }).toArray();

    // Calculate actual withdrawable balance
    const withdrawableBalance = availableCommissions.reduce((sum, commission) => {
      const usedAmount = commission.usedAmount || 0;
      const remainingBalance = commission.amount - usedAmount;
      return sum + remainingBalance;
    }, 0);

    // 2. Check if balance is sufficient
    if (requestedAmount > withdrawableBalance) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }
    
    // 3. Create withdrawal request - LANGSUNG DIPROSES
    const newWithdrawal: Omit<Withdrawal, 'id' | '_id'> = {
      affiliatorId,
      amount: requestedAmount,
      bankDetails,
      status: 'approved', // Langsung approved = sedang diproses
      requestedAt: new Date(),
    };

     const result = await withdrawalsCollection.insertOne(newWithdrawal as Withdrawal);

     // Get affiliator info for notifications
     const affiliator = await db.collection('users').findOne({ _id: new ObjectId(affiliatorId) });

     // 4. LANGSUNG PROSES: Update usedAmount dan buat reserved commissions
     let amountToCover = requestedAmount;
     const reservedCommissionIds = [];

    for (const commission of availableCommissions) {
      if (amountToCover <= 0) break;

      const usedAmount = commission.usedAmount || 0;
      const availableBalance = commission.amount - usedAmount;

      if (availableBalance <= 0) continue;

      const amountToUse = Math.min(amountToCover, availableBalance);

      // ALWAYS create reserved commission untuk tracking balance restore
      const reservedCommission = {
        affiliatorId,
        orderId: commission.orderId,
        productName: commission.productName,
        amount: amountToUse,
        status: 'reserved',
        withdrawalId: result.insertedId.toString(),
        createdAt: commission.createdAt,
        date: commission.date,
        isPartial: true,
        parentCommissionId: commission._id.toString(),
      };

      const reservedResult = await db.collection('commissions').insertOne(reservedCommission);

      // Update usedAmount di commission asli
      const newUsedAmount = usedAmount + amountToUse;
      await commissionsCollection.updateOne(
        { _id: commission._id },
        { $set: { usedAmount: newUsedAmount }}
      );

      reservedCommissionIds.push({
        commissionId: commission._id.toString(),
        amount: amountToUse,
        reservedCommissionId: reservedResult.insertedId.toString()
      });

      amountToCover -= amountToUse;
    }

    // Transaction log untuk audit
    await db.collection('withdrawal_transactions').insertOne({
      withdrawalId: result.insertedId.toString(),
      affiliatorId,
      totalAmount: requestedAmount,
      reservedCommissions: reservedCommissionIds,
      createdAt: new Date(),
     });

     // Send notifications
     try {
       if (affiliator && affiliator.email) {
         // Push notifications & In-app
         await adminNotifications.withdrawalRequest(
           affiliator.name,
           requestedAmount.toLocaleString('id-ID')
         );

         await affiliatorNotifications.withdrawalApproved(
           requestedAmount.toLocaleString('id-ID'),
           new Date().toLocaleString('id-ID'),
           affiliator.email
         );

         const remainingBalance = withdrawableBalance - requestedAmount;
         await affiliatorNotifications.balanceUpdated(
           remainingBalance.toLocaleString('id-ID'),
           affiliator.email
         );
       }

       console.log(`✅ All notifications sent for withdrawal request: ${requestedAmount}`);
     } catch (notificationError) {
       console.error('❌ Failed to send notifications for withdrawal:', notificationError);
       // Continue with withdrawal process even if notification fails
     }

     const insertedWithdrawal = { ...newWithdrawal, id: result.insertedId.toString() };
     return NextResponse.json(insertedWithdrawal, { status: 201 });

  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}