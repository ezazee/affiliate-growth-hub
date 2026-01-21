import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Order, OrderStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';


// Helper function to generate a unique order number
const generateOrderNumber = async (db): Promise<string> => {
  const prefix = 'ORDER';
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
      shippingCost,
      totalPrice,
    } = await req.json();

    if (
      !buyerName || !buyerPhone || !shippingAddress || !city || !province || !postalCode || 
      !productId || !affiliatorId || !affiliateCode || !affiliateName || 
      shippingCost === undefined || totalPrice === undefined
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();



    const orderNumber = await generateOrderNumber(db);
    const paymentToken = uuidv4(); // Generate a secure token
    const paymentTokenExpiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute from now

    // Get product price to store
    const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
    const productPrice = product?.price || 0;

    const orderToInsert = {
      orderNumber,
      paymentToken,
      paymentTokenExpiresAt,
      isPaymentUsed: false, // New field for single-use functionality
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
      shippingCost,
      productPrice, // Store product price separately
      totalPrice,
      orderNote,
      createdAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(orderToInsert);



    // Return only necessary info for payment navigation
    return NextResponse.json({ 
      paymentToken: orderToInsert.paymentToken, 
      orderNumber: orderToInsert.orderNumber,
      status: orderToInsert.status
    }, { status: 201 });
  } catch (error) {

    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
