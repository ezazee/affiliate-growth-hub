import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(req: NextRequest) {
  try {
    const pathParts = req.nextUrl.pathname.split('/').filter(p => p);
    const id = pathParts[pathParts.length - 1];
    const { isActive } = await req.json();

    const client = await clientPromise;
    const db = client.db();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const result = await db.collection('affiliateLinks').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    const updatedLink = await db.collection('affiliateLinks').findOne({ _id: new ObjectId(id) });
    
    return NextResponse.json(updatedLink, { status: 200 });
  } catch (error) {
    console.error('Error updating affiliate link:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const pathParts = req.nextUrl.pathname.split('/').filter(p => p);
    const id = pathParts[pathParts.length - 1];

    const client = await clientPromise;
    const db = client.db();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const result = await db.collection('affiliateLinks').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Link deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting affiliate link:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
