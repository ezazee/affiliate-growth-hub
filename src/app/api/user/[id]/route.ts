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

    console.log(`[DEBUG /api/user/[id]] Request received for user ID: ${id}`);

    const client = await clientPromise;
    const db = client.db();

    if (!id) {
      console.log(`[DEBUG /api/user/[id]] Invalid user ID: ${id}`);
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = await db.collection<User>('users').findOne({ id: id });
    console.log(`[DEBUG /api/user/[id]] User found in DB: ${JSON.stringify(user)}`);

    if (!user) {
      console.log(`[DEBUG /api/user/[id]] User not found for ID: ${id}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.referralCode || user.referralCode === '') {
      console.log(`[DEBUG /api/user/[id]] referralCode missing or empty for user ${user.id}. Generating new one.`);
      const referralCode = generateReferralCode();
      const registrationNumber = `REG-${referralCode}`;
      
      const updateResult = await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { referralCode: referralCode, registrationNumber: registrationNumber } }
      );
      console.log(`[DEBUG /api/user/[id]] Update result for user ${user.id}: ${JSON.stringify(updateResult)}`);
      
      // Update the user object in memory to return the new codes
      user.referralCode = referralCode;
      user.registrationNumber = registrationNumber;
    } else {
        console.log(`[DEBUG /api/user/[id]] referralCode already present for user ${user.id}: ${user.referralCode}`);
    }
    
    const { password, ...userWithoutPassword } = user;
    console.log(`[DEBUG /api/user/[id]] Returning user: ${JSON.stringify(userWithoutPassword)}`);

    return NextResponse.json({ user: userWithoutPassword });

  } catch (error) {
    console.error(`[DEBUG /api/user/[id]] Error fetching user: ${error.message}`, error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
