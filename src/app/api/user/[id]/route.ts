import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { User } from '@/types';
import { ObjectId } from 'mongodb';

// Function to generate a unique referral code
const generateReferralCode = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export async function GET(req: NextRequest) {
  try {
    const pathParts = req.nextUrl.pathname.split('/').filter(p => p);
    const id = pathParts[pathParts.length - 1];

    const client = await clientPromise;
    const db = client.db();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = await db.collection<User>('users').findOne({ _id: new ObjectId(id) });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.referralCode) {
      const referralCode = generateReferralCode();
      const registrationNumber = `REG-${referralCode}`;
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { referralCode: referralCode, registrationNumber: registrationNumber } }
      );
      user.referralCode = referralCode;
      user.registrationNumber = registrationNumber;
    }
    
    // It's good practice to not send the password to the client
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
