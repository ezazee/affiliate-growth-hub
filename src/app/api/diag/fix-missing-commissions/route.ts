import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Find orders with status 'paid' but no commission
    const paidOrdersWithoutCommission = await db.collection('orders').aggregate([
      { 
        $match: { 
          status: 'paid',
          affiliatorId: { $exists: true, $ne: null }
        } 
      },
      {
        $lookup: {
          from: 'commissions',
          localField: '_id',
          foreignField: 'orderId',
          as: 'commissions'
        }
      },
      {
        $match: {
          'commissions.0': { $exists: false } // No commission exists
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true
        }
      }
    ]).toArray();

    // Check if there are any paid orders without commissions
    if (paidOrdersWithoutCommission.length > 0) {

      
      // Create missing commissions
      for (const order of paidOrdersWithoutCommission) {
        if (order.product) {
          let commissionAmount = 0;
          if (order.product.commissionType === 'percentage') {
            commissionAmount = (order.product.price * order.product.commissionValue) / 100;
          } else {
            commissionAmount = order.product.commissionValue;
          }

          const commissionToInsert = {
            affiliatorId: order.affiliatorId,
            affiliateName: order.affiliateName,
            orderId: order._id.toString(),
            productName: order.product.name,
            amount: commissionAmount,
            status: 'approved',
            date: new Date(),
            createdAt: new Date(),
          };

          await db.collection('commissions').insertOne(commissionToInsert);

        }
      }
    }

    return NextResponse.json({
      message: `Processed ${paidOrdersWithoutCommission.length} paid orders without commissions`,
      ordersProcessed: paidOrdersWithoutCommission.length,
      details: paidOrdersWithoutCommission.map(order => ({
        orderNumber: order.orderNumber,
        buyerName: order.buyerName,
        productId: order.productId,
        affiliatorId: order.affiliatorId,
        productName: order.product?.name || 'N/A'
      }))
    });

  } catch (error) {

    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}