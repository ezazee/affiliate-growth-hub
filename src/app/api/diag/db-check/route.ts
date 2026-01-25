import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db();

        const users = await db.collection('users').find({}).toArray();
        const notifications = await db.collection('notifications')
            .find({})
            .sort({ timestamp: -1 })
            .limit(10)
            .toArray();

        return NextResponse.json({
            users: users.map(u => ({
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.role
            })),
            recentNotifications: notifications
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
