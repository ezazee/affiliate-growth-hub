import { ObjectId } from 'mongodb';
import { Product } from './product';

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'shipping';

export interface Order {
  _id?: ObjectId | string;
  id?: string;
  orderNumber?: string;
  buyerName: string;
  buyerPhone: string;
  shippingAddress: string;
  city: string;
  province: string;
  postalCode: string;
  productId: string;
  affiliatorId: string;
  affiliateCode: string;
  affiliateName: string;
  status: OrderStatus;
  shippingCost?: number;
  orderNote?: string;
  paymentProof?: string;
  createdAt: Date;
  product?: Product;
  productName?: string;
  productPrice?: number;
}
