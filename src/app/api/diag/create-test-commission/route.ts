import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Cari order yang paid tapi tidak ada komisinya
    const paidOrderWithoutCommission = await db.collection('orders').findOne({ 
      status: 'paid',
      orderNumber: 'ORDER-RU7LWNY'
    });

    if (!paidOrderWithoutCommission) {
      return NextResponse.json({ error: 'No paid order found to test' }, { status: 404 });
    }

    // Check if commission already exists
    const existingCommission = await db.collection('commissions').findOne({ 
      orderId: paidOrderWithoutCommission._id.toString() 
    });

    if (existingCommission) {
      return NextResponse.json({ 
        message: 'Commission already exists',
        commission: existingCommission
      });
    }

    // Get product
    const product = await db.collection('products').findOne({ 
      _id: new ObjectId(paidOrderWithoutCommission.productId) 
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Calculate commission
    let commissionAmount = 0;
    if (product.commissionType === 'percentage') {
      commissionAmount = (product.price * product.commissionValue) / 100;
    } else { // 'fixed'
      commissionAmount = product.commissionValue;
    }

    // Create commission
    const commissionToInsert = {
      affiliatorId: paidOrderWithoutCommission.affiliatorId,
      affiliateName: paidOrderWithoutCommission.affiliateName,
      orderId: paidOrderWithoutCommission._id.toString(),
      productName: product.name,
      amount: commissionAmount,
      status: 'approved',
      date: new Date(),
      createdAt: new Date(),
    };

    const result = await db.collection('commissions').insertOne(commissionToInsert);

    return NextResponse.json({
      success: true,
      message: 'Commission created successfully',
      commission: commissionToInsert,
      product: {
        name: product.name,
        price: product.price,
        commissionType: product.commissionType,
        commissionValue: product.commissionValue
      },
      calculatedCommission: commissionAmount
    });

  } catch (error) {
    console.error('Error creating test commission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create test commission' },
      { status: 500 }
    );
  }
}