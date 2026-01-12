import { ObjectId } from 'mongodb';
import { Product } from './product'; // Assuming product type is needed

export interface AffiliateLink {
  _id?: ObjectId | string;
  id?: string;
  affiliatorId: string;
  productId: string;
  code: string;
  isActive: boolean;
  clicks?: number;
  product?: Product;
}
