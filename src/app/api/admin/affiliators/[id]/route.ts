import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { UserStatus } from '@/types';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, email, phone, status } = (await req.json()) as { name?: string, email?: string, phone?: string, status?: UserStatus };

    if (!id) {
      return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const updateDoc: { [key: string]: any } = {};
    if (name !== undefined) updateDoc.name = name;
    if (email !== undefined) updateDoc.email = email;
    if (phone !== undefined) updateDoc.phone = phone;
    if (status !== undefined) updateDoc.status = status;

    if (Object.keys(updateDoc).length === 0) {
      return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 });
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch the updated user to return the most current data
    const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ...updatedUser, id: updatedUser?._id.toString() });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
