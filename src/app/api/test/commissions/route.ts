import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { affiliatorId, status, commissionId } = await req.json();

    if (!affiliatorId || !status) {
      return NextResponse.json({ error: 'Missing required fields: affiliatorId, status' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const commissionsCollection = db.collection('commissions');
    
    // If commissionId is provided, update specific commission
    if (commissionId) {
      await commissionsCollection.updateOne(
        { _id: new ObjectId(commissionId) },
        { $set: { status, updatedAt: new Date() } }
      );
      return NextResponse.json({ success: true, message: 'Commission status updated' });
    }
    
    // Otherwise, create new approved commission for testing
    const newCommission = {
      affiliatorId,
      affiliateName: 'Test User',
      orderId: new ObjectId().toString(),
      productName: 'Test Product',
      amount: 50000,
      status,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await commissionsCollection.insertOne(newCommission);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test commission created',
      commissionId: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Error updating commission:', error);
    return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 });
  }
}