import { ObjectId } from 'mongodb';

export type UserRole = 'admin' | 'affiliator';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface User {

  _id?: ObjectId | string;

  id: string;

  name: string;

  email: string;

  password?: string;

  role: UserRole;

  status: UserStatus;

  phone?: string; // Added phone number field

    referralCode?: string;

    registrationNumber?: string;

    createdAt: Date;

}
