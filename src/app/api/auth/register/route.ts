import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Function to generate a unique referral code
const generateReferralCode = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const referralCode = generateReferralCode();
    const registrationNumber = `REG-${referralCode}`;

    const userToInsert: Omit<User, '_id' | 'id'> = {
      name,
      email,
      password,
      phone, // Added phone number
      role: 'affiliator',
      status: 'pending',
      referralCode,
      registrationNumber,
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(userToInsert);

    const createdUser: User = { ...userToInsert, _id: result.insertedId, id: result.insertedId.toString() };

    return NextResponse.json({ user: createdUser });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

