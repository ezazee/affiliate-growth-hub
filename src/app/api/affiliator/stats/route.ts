import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Order, Commission, AffiliateLink } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const affiliatorId = searchParams.get('affiliatorId');

  if (!affiliatorId) {
    return NextResponse.json({ error: 'affiliatorId is required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const userOrders = (await db.collection<Order>('orders').find({ affiliatorId }).toArray()).map(order => ({ ...order, id: order._id.toString() }));
    const userCommissions = (await db.collection<Commission>('commissions').find({ affiliatorId }).toArray()).map(commission => ({ ...commission, id: commission._id.toString() }));
    const userLinks = (await db.collection<AffiliateLink>('affiliateLinks').find({ affiliatorId }).toArray()).map(link => ({ ...link, id: link._id.toString() }));

    // Total revenue dari SEMUA komisi asli (yang bukan partial)
    const totalRevenue = userCommissions
      .filter(c => !c.isPartial && (c.status === 'approved' || c.status === 'paid' || c.status === 'withdrawn' || c.status === 'processed'))
      .reduce((sum, commission) => sum + commission.amount, 0);
    
    // Saldo yang bisa ditarik (komisi asli yang masih 'paid' dan belum digunakan)
    const withdrawableBalance = userCommissions
      .filter(c => !c.isPartial && c.status === 'paid')
      .reduce((sum, commission) => {
        const usedAmount = commission.usedAmount || 0;
        return sum + (commission.amount - usedAmount);
      }, 0);
    
    // Saldo yang sedang diproses penarikan (status 'reserved')
    const reservedBalance = userCommissions
      .filter(c => c.status === 'reserved')
      .reduce((sum, commission) => sum + commission.amount, 0);

    const conversionRate = userOrders.length > 0 && userLinks.length > 0 ? (userOrders.length / userLinks.length) * 100 : 0;
    
    return NextResponse.json({
      totalRevenue,
      withdrawableBalance, // saldo yang bisa ditarik
      reservedBalance,    // saldo sedang diproses
      totalOrders: userOrders.length,
      conversionRate: conversionRate.toFixed(2),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
