import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { User, Product, AffiliateLink } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { sendAdminNotification } from '@/lib/notifications';

// Function to generate a unique referral code
const generateReferralCode = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Function to generate a unique link code
const generateLinkCode = (productName: string, affiliatorName: string): string => {
  const productCode = productName.slice(0, 4).toUpperCase();
  const affiliatorCode = affiliatorName.slice(0, 4).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${affiliatorCode}-${productCode}-${randomPart}`;
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

    // Trigger Admin Notification
    try {
      await sendAdminNotification('ADMIN_USER_REGISTER', { 
        name: createdUser.name, 
        email: createdUser.email 
      });
    } catch (error) {
      console.error('Failed to send ADMIN_USER_REGISTER notification', error);
    }

    // Note: Affiliate links will be created when admin approves the user
    // This prevents affiliates from having links before approval

    return NextResponse.json({ user: createdUser });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

