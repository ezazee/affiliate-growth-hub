import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
    try {
        const { id, all, userEmail } = await req.json();

        if (!userEmail) {
            // Also try getting from header for redundancy, though context should send it in body
            const headerEmail = req.headers.get('x-user-email');
            if (!headerEmail) {
                return NextResponse.json({ error: 'User email required' }, { status: 401 });
            }
        }

        const client = await clientPromise;
        const db = client.db();
        const notifications = db.collection('notifications');

        // Use header if body email is missing
        const targetEmail = userEmail || req.headers.get('x-user-email');

        if (all) {
            await notifications.updateMany(
                { userEmail: targetEmail, read: false },
                { $set: { read: true } }
            );
        } else if (id) {
            /* 
               IMPORTANT: The ID coming from frontend might be a string timestamp (Date.now()) 
               OR a MongoDB ObjectId string.
               
               If it's a real ObjectID (24 hex chars), use ObjectId(id).
               If it's our custom generated ID (timestamp related), we might need to match by string id if stored that way.
               
               However, looking at the DB dump, IDs are ObjectIds like "6975c8591f022f802cd57d15".
            */

            let query: any = { _id: new ObjectId(id), userEmail: targetEmail };

            const result = await notifications.updateOne(
                query,
                { $set: { read: true } }
            );

            if (result.matchedCount === 0) {
                return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
            }
        } else {
            return NextResponse.json({ error: 'Missing ID or all flag' }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
