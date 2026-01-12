import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Commission, Withdrawal } from '@/types';
import { ObjectId } from 'mongodb';

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

    const MINIMUM_WITHDRAWAL_AMOUNT = 100000;
    if (requestedAmount < MINIMUM_WITHDRAWAL_AMOUNT) {
        return NextResponse.json({ error: `Minimum withdrawal amount is Rp${MINIMUM_WITHDRAWAL_AMOUNT.toLocaleString('id-ID')}` }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const commissionsCollection = db.collection<Commission>('commissions');
    const withdrawalsCollection = db.collection<Withdrawal>('withdrawals');

    // 1. Calculate withdrawable balance (sum of 'approved' commissions)
    const approvedCommissions = await commissionsCollection.find({ 
        affiliatorId, 
        status: 'approved' 
    }).sort({ date: 1 }).toArray(); // Sort oldest first

    const withdrawableBalance = approvedCommissions.reduce((sum, c) => sum + c.amount, 0);

    // 2. Check if balance is sufficient
    if (requestedAmount > withdrawableBalance) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }
    
    // 3. Create the withdrawal request
    const newWithdrawal: Omit<Withdrawal, 'id' | '_id'> = {
      affiliatorId,
      amount: requestedAmount,
      bankDetails,
      status: 'pending',
      requestedAt: new Date(),
    };

    const result = await withdrawalsCollection.insertOne(newWithdrawal as Withdrawal);

    // 4. Update status of commissions used in this withdrawal
    let amountToCover = requestedAmount;
    for (const commission of approvedCommissions) {
      if (amountToCover > 0) {
        await commissionsCollection.updateOne(
          { _id: new ObjectId(commission.id) },
          { $set: { status: 'paid' } } // Mark as 'paid' to prevent re-use
        );
        amountToCover -= commission.amount;
      } else {
        break; // Stop when the withdrawn amount is covered
      }
    }

    const insertedWithdrawal = { ...newWithdrawal, id: result.insertedId.toString() };
    return NextResponse.json(insertedWithdrawal, { status: 201 });

  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
