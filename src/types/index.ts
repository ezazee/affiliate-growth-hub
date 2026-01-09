export type UserRole = 'admin' | 'affiliator';

export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type OrderStatus = 'pending' | 'paid' | 'cancelled';

export type CommissionStatus = 'pending' | 'approved' | 'paid';

export type CommissionType = 'percentage' | 'fixed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description?: string;
  imageUrl?: string;
  commissionType: CommissionType;
  commissionValue: number;
  isActive: boolean;
}

export interface AffiliateLink {
  id: string;
  affiliatorId: string;
  productId: string;
  code: string;
  isActive: boolean;
  product?: Product;
}

export interface Order {
  id: string;
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
}

export interface Commission {
  id: string;
  affiliatorId: string;
  orderId: string;
  amount: number;
  status: CommissionStatus;
  createdAt: Date;
  order?: Order;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCommissions: number;
  pendingOrders: number;
  pendingCommissions: number;
}
