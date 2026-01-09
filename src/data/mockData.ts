import { Product, User, Order, Commission, AffiliateLink } from '@/types';

// Mock Products
export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Online Course',
    slug: 'premium-course',
    price: 299,
    description: 'Complete web development course with 50+ hours of content',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
    commissionType: 'percentage',
    commissionValue: 20,
    isActive: true,
  },
  {
    id: '2',
    name: 'E-Book Bundle',
    slug: 'ebook-bundle',
    price: 49,
    description: 'Collection of 10 bestselling programming e-books',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    commissionType: 'fixed',
    commissionValue: 15,
    isActive: true,
  },
  {
    id: '3',
    name: 'Monthly Membership',
    slug: 'membership',
    price: 99,
    description: 'Access to all courses and resources for 30 days',
    imageUrl: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400',
    commissionType: 'percentage',
    commissionValue: 25,
    isActive: true,
  },
];

// Mock Users (Affiliators)
export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    status: 'approved',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'John Affiliator',
    email: 'john@example.com',
    role: 'affiliator',
    status: 'approved',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: 'Pending User',
    email: 'pending@example.com',
    role: 'affiliator',
    status: 'pending',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    name: 'Sarah Marketing',
    email: 'sarah@example.com',
    role: 'affiliator',
    status: 'approved',
    createdAt: new Date('2024-01-20'),
  },
];

// Mock Affiliate Links
export const affiliateLinks: AffiliateLink[] = [
  { id: '1', affiliatorId: '2', productId: '1', code: 'JOHN-COURSE', isActive: true },
  { id: '2', affiliatorId: '2', productId: '2', code: 'JOHN-EBOOK', isActive: true },
  { id: '3', affiliatorId: '2', productId: '3', code: 'JOHN-MEMBER', isActive: true },
  { id: '4', affiliatorId: '4', productId: '1', code: 'SARAH-COURSE', isActive: true },
];

// Mock Orders
export const orders: Order[] = [
  {
    id: '1',
    buyerName: 'Alice Johnson',
    buyerPhone: '+1234567890',
    shippingAddress: '123 Main St',
    city: 'New York',
    province: 'NY',
    postalCode: '10001',
    productId: '1',
    affiliatorId: '2',
    affiliateCode: 'JOHN-COURSE',
    affiliateName: 'John Affiliator',
    status: 'paid',
    shippingCost: 10,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    buyerName: 'Bob Smith',
    buyerPhone: '+0987654321',
    shippingAddress: '456 Oak Ave',
    city: 'Los Angeles',
    province: 'CA',
    postalCode: '90001',
    productId: '2',
    affiliatorId: '2',
    affiliateCode: 'JOHN-EBOOK',
    affiliateName: 'John Affiliator',
    status: 'pending',
    createdAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    buyerName: 'Carol White',
    buyerPhone: '+1122334455',
    shippingAddress: '789 Pine Rd',
    city: 'Chicago',
    province: 'IL',
    postalCode: '60601',
    productId: '3',
    affiliatorId: '4',
    affiliateCode: 'SARAH-COURSE',
    affiliateName: 'Sarah Marketing',
    status: 'paid',
    createdAt: new Date('2024-01-14'),
  },
];

// Mock Commissions
export const commissions: Commission[] = [
  {
    id: '1',
    affiliatorId: '2',
    orderId: '1',
    amount: 59.80,
    status: 'approved',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    affiliatorId: '4',
    orderId: '3',
    amount: 24.75,
    status: 'pending',
    createdAt: new Date('2024-01-14'),
  },
];

// Helper functions to simulate CRUD operations
export const getProductById = (id: string) => products.find(p => p.id === id);
export const getProductBySlug = (slug: string) => products.find(p => p.slug === slug);
export const getUserById = (id: string) => users.find(u => u.id === id);
export const getAffiliateLinkByCode = (code: string) => affiliateLinks.find(l => l.code === code && l.isActive);
export const getOrdersByAffiliatorId = (affiliatorId: string) => orders.filter(o => o.affiliatorId === affiliatorId);
export const getCommissionsByAffiliatorId = (affiliatorId: string) => commissions.filter(c => c.affiliatorId === affiliatorId);
export const getLinksByAffiliatorId = (affiliatorId: string) => affiliateLinks.filter(l => l.affiliatorId === affiliatorId);
