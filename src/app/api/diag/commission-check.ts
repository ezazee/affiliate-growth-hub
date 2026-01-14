import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // 1. Cek koleksi products
    const products = await db.collection('products')
      .find({})
      .project({
        id: 1,
        name: 1,
        commissionType: 1,
        commissionValue: 1,
        isActive: 1
      })
      .toArray();

    // 2. Cek koleksi commissions
    const commissions = await db.collection('commissions')
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    // 2a. Cek commissions dengan withdrawalId (reserved)
    const reservedCommissions = await db.collection('commissions')
      .find({ withdrawalId: { $exists: true, $ne: null } })
      .toArray();

    // 2b. Cek affiliator spesifik
    const affiliatorId = '696672740e49b9cf6d2132a8';
    const affiliatorCommissions = await db.collection('commissions')
      .find({ affiliatorId })
      .sort({ createdAt: -1 })
      .toArray();

    // 3. Cek koleksi orders dengan status paid
    const paidOrders = await db.collection('orders')
      .find({ status: 'paid' })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    // 4. Cek order yang seharusnya punya komisi tapi tidak ada
    const ordersWithoutCommissions = [];
    for (const order of paidOrders) {
      const existingCommission = await db.collection('commissions')
        .findOne({ orderId: order.id || order._id.toString() });
      
      if (!existingCommission) {
        ordersWithoutCommissions.push({
          orderNumber: order.orderNumber,
          id: order.id || order._id.toString(),
          affiliatorId: order.affiliatorId,
          productId: order.productId,
          status: order.status,
          createdAt: order.createdAt
        });
      }
    }

    // 5. Cek products tanpa komisi
    const productsWithoutCommission = products.filter(product => 
      !product.commissionType || !product.commissionValue
    );

    // 6. Cek paid orders tanpa affiliatorId
    const ordersWithoutAffiliator = paidOrders.filter(order => 
      !order.affiliatorId || order.affiliatorId === ''
    );

    return NextResponse.json({
      success: true,
      data: {
        productsSummary: {
          total: products.length,
          withCommission: products.filter(p => p.commissionType && p.commissionValue).length,
          withoutCommission: productsWithoutCommission.length,
          withoutCommissionList: productsWithoutCommission
        },
        commissionsSummary: {
          total: commissions.length,
          byStatus: commissions.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          recentCommissions: commissions.slice(0, 10),
          reservedCommissions: reservedCommissions,
          affiliatorCommissions: affiliatorCommissions
        },
        ordersSummary: {
          totalPaid: paidOrders.length,
          ordersWithoutCommissions: ordersWithoutCommissions.length,
          ordersWithoutCommissionsList: ordersWithoutCommissions,
          ordersWithoutAffiliator: ordersWithoutAffiliator.length,
          ordersWithoutAffiliatorList: ordersWithoutAffiliator
        },
        insights: []
      }
    });

  } catch (error) {
    console.error('Diagnostic error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch diagnostic data' },
      { status: 500 }
    );
  }
}