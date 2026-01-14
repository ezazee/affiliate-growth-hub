import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Get all affiliators
    const affiliators = await db.collection('users').aggregate([
      { $match: { role: 'affiliator' } },
      {
        $addFields: {
          affiliatorIdString: { $toString: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'affiliateLinks',
          localField: 'affiliatorIdString',
          foreignField: 'affiliatorId',
          as: 'links'
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'affiliatorIdString',
          foreignField: 'affiliatorId',
          as: 'orders'
        }
      },
      {
        $lookup: {
          from: 'commissions',
          localField: 'affiliatorIdString',
          foreignField: 'affiliatorId',
          as: 'commissions'
        }
      },
      {
        $project: {
          password: 0, // Exclude password
          affiliatorIdString: 0 // Exclude temporary field
        }
      }
    ]).toArray();

    // Calculate stats per affiliator
    const affiliatorStats = affiliators.map(affiliator => {
      const links = affiliator.links || [];
      const orders = affiliator.orders || [];
      const commissions = affiliator.commissions || [];

      const totalOrders = orders.length;
      const paidOrders = orders.filter(o => o.status === 'paid').length;
      const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      
      // Calculate commissions
      const totalCommission = commissions
        .filter(c => c.status === 'approved' || c.status === 'paid')
        .reduce((sum, c) => sum + (c.amount || 0), 0);
      
      const paidCommission = commissions
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + (c.amount || 0), 0);
      
      const withdrawableCommission = commissions
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + (c.amount || 0), 0);

      return {
        ...affiliator,
        id: affiliator._id?.toString(),
        stats: {
          totalLinks: links.length,
          totalOrders,
          paidOrders,
          totalRevenue,
          totalCommission,
          paidCommission,
          withdrawableCommission,
          conversionRate: totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(1) : '0'
        }
      };
    });

    // Overall stats
    const overallStats = {
      totalAffiliators: affiliatorStats.length,
      totalOrders: affiliatorStats.reduce((sum, a) => sum + a.stats.totalOrders, 0),
      paidOrders: affiliatorStats.reduce((sum, a) => sum + a.stats.paidOrders, 0),
      totalRevenue: affiliatorStats.reduce((sum, a) => sum + a.stats.totalRevenue, 0),
      totalCommission: affiliatorStats.reduce((sum, a) => sum + a.stats.totalCommission, 0),
      netRevenue: affiliatorStats.reduce((sum, a) => sum + (a.stats.totalRevenue - a.stats.totalCommission), 0), // Pendapatan bersih
      activeAffiliators: affiliatorStats.filter(a => a.stats.totalOrders > 0).length
    };

    return NextResponse.json({
      overallStats,
      affiliators: affiliatorStats
    });

  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}