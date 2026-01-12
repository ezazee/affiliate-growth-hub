import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { User } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const users = await db.collection<User>('users').find({}).toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
