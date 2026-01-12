import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Order } from '@/types';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const orders = await db.collection<Order>('orders').aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: 'id',
          as: 'productInfo'
        }
      },
      {
        $unwind: {
          path: '$productInfo',
          preserveNullAndEmptyArrays: true // Keep orders even if product not found
        }
      },
      {
        $addFields: {
          productName: '$productInfo.name',
          productPrice: '$productInfo.price'
        }
      },
      {
        $project: {
          productInfo: 0
        }
      }
    ]).sort({ createdAt: -1 }).toArray();

    const formattedOrders = orders.map(order => ({
      ...order,
      id: order._id.toString(),
    }));
    
    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}


export async function PUT(req: NextRequest) {
  try {
    const { orderId, status, shippingCost } = await req.json();

    if (!orderId || (!status && shippingCost === undefined)) {
      return NextResponse.json({ error: 'orderId and status or shippingCost are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const updateFields: any = {};
    if (status) {
      updateFields.status = status;
    }
    if (shippingCost !== undefined) {
      updateFields.shippingCost = shippingCost;
    }
     if (Object.keys(updateFields).length > 0) {
      updateFields.updatedAt = new Date();
    }

    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const updatedOrder = result;

    // If order is marked as paid, create the commission
    if (updatedOrder && status === 'paid') {
      const product = await db.collection('products').findOne({ id: updatedOrder.productId });

      if (product) {
        let commissionAmount = 0;
        if (product.commissionType === 'percentage') {
          commissionAmount = (product.price * product.commissionValue) / 100;
        } else { // 'fixed'
          commissionAmount = product.commissionValue;
        }

        const commissionToInsert = {
          affiliatorId: updatedOrder.affiliatorId,
          affiliateName: updatedOrder.affiliateName,
          orderId: updatedOrder._id.toString(),
          productName: product.name,
          amount: commissionAmount,
          status: 'approved', // Auto-approved when order is paid
          date: new Date(),
          createdAt: new Date(),
        };

        const result = await db.collection('commissions').insertOne(commissionToInsert);
      }
    }

    // Add product details to the returned order
    const finalOrder = await db.collection('orders').aggregate([
      { $match: { _id: new ObjectId(orderId) } }, // Match by ObjectId for the order document itself
      {
        $lookup: {
          from: 'products',
          localField: 'productId', // Use the string productId
          foreignField: 'id',      // Join with the string 'id' field in products
          as: 'productInfo'
        }
      },
      {
        $unwind: {
          path: '$productInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          productName: '$productInfo.name',
          productPrice: '$productInfo.price'
        }
      },
      {
        $project: {
          productInfo: 0,
        }
      }
    ]).next();

    if (!finalOrder) {
      return NextResponse.json({ error: 'Failed to retrieve updated order details' }, { status: 500 });
    }

    const formattedOrder = {
      ...finalOrder,
      id: finalOrder._id.toString(),
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
