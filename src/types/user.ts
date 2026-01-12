import { ObjectId } from 'mongodb';
import { BankDetails } from './withdrawal';

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

  phone?: string; 

  referralCode?: string;

  registrationNumber?: string;

  bankDetails?: BankDetails;

  createdAt: Date;

}
