import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Order, OrderStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate a unique order number
const generateOrderNumber = async (db): Promise<string> => {
  const prefix = 'ORD';
  let isUnique = false;
  let orderNumber;
  while (!isUnique) {
    // Generate a 7-digit random alphanumeric string
    const randomPart = Math.random().toString(36).substring(2, 9).toUpperCase();
    orderNumber = `${prefix}-${randomPart}`;
    const existingOrder = await db.collection('orders').findOne({ orderNumber });
    if (!existingOrder) {
      isUnique = true;
    }
  }
  return orderNumber;
};


export async function POST(req: NextRequest) {
  try {
    const {
      buyerName,
      buyerPhone,
      shippingAddress,
      city,
      province,
      postalCode,
      orderNote,
      productId,
      affiliatorId,
      affiliateCode,
      affiliateName,
    } = await req.json();

    if (!buyerName || !buyerPhone || !shippingAddress || !city || !province || !postalCode || !productId || !affiliatorId || !affiliateCode || !affiliateName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const orderNumber = await generateOrderNumber(db);

    const orderToInsert = {
      orderNumber,
      buyerName,
      buyerPhone,
      shippingAddress,
      city,
      province,
      postalCode,
      productId,
      affiliatorId,
      affiliateCode,
      affiliateName,
      status: 'pending' as OrderStatus,
      shippingCost: 0,
      orderNote,
      createdAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(orderToInsert);

    // Return the inserted document with _id mapped to id
    const insertedOrder = { ...orderToInsert, _id: result.insertedId, id: result.insertedId.toString() };

    return NextResponse.json(insertedOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
