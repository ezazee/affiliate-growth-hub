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

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection<User>('users').findOne({ email, password });

    if (user) {
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

      const userWithPassword = user as Required<User>;
      const { password: _, ...userWithoutPassword } = userWithPassword;
      return NextResponse.json({ user: userWithoutPassword });
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
