import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const [paidOrders, allCommissions, products, approvedAffiliatorsCount, totalOrdersCount] = await Promise.all([
      db.collection('orders').find({ status: 'paid' }).toArray(),
      db.collection('commissions').find({}).toArray(),
      db.collection('products').find({}).toArray(),
      db.collection('users').countDocuments({ role: 'affiliator', status: 'approved' }),
      db.collection('orders').countDocuments()
    ]);
    
    const productPriceMap = new Map(products.map(p => [p._id.toString(), p.price]));

    const totalGrossRevenue = paidOrders.reduce((sum, order) => {
        const price = productPriceMap.get(order.productId) || 0;
        return sum + price;
    }, 0);
    
    const totalCommissionsValue = allCommissions.reduce((sum, c) => sum + c.amount, 0);
    
    const totalNetRevenue = totalGrossRevenue - totalCommissionsValue;

    return NextResponse.json({
      totalRevenue: totalNetRevenue,
      totalAffiliators: approvedAffiliatorsCount,
      totalOrders: totalOrdersCount,
      totalCommissions: totalCommissionsValue,
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}