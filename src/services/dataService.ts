import clientPromise from '@/lib/mongodb';
import { Collection, MongoClient, Db, ObjectId } from 'mongodb';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  imageUrl: string;
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
  isActive: boolean;
}

interface AffiliateLink {
  id: string;
  code: string;
  productId: string;
  affiliatorId: string;
  createdAt: Date;
}

interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Password might not always be needed or should be handled securely
  role: 'admin' | 'affiliator';
  status: 'approved' | 'pending';
  createdAt: Date;
}

let _client: MongoClient;
let _db: Db;

async function init() {
  if (_client && _db) {
    return;
  }
  try {
    _client = await clientPromise;
    _db = _client.db(); // This assumes the database name is already configured in clientPromise in lib/mongodb.ts
  } catch (error) {
    console.error('Failed to connect to DB or get collections:', error);
    throw new Error('Database initialization failed');
  }
}

export async function getProducts(): Promise<Product[]> {
  await init();
  const productsCollection = _db.collection<Product>('products');
  const products = await productsCollection.find({}).toArray();
  return products.map(product => ({ ...product, id: product._id.toString() }));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await init();
  const productsCollection = _db.collection<Product>('products');
  const product = await productsCollection.findOne({ slug });
  return product ? { ...product, id: product._id.toString() } : null;
}

export async function getAffiliateLinks(): Promise<AffiliateLink[]> {
  await init();
  const affiliateLinksCollection = _db.collection<AffiliateLink>('affiliateLinks');
  const links = await affiliateLinksCollection.find({}).toArray();
  return links.map(link => ({ ...link, id: link._id.toString() }));
}

export async function getAffiliateLinkByCode(code: string): Promise<AffiliateLink | null> {
  await init();
  const affiliateLinksCollection = _db.collection<AffiliateLink>('affiliateLinks');
  const link = await affiliateLinksCollection.findOne({ code });
  return link ? { ...link, id: link._id.toString() } : null;
}

export async function getUsers(): Promise<User[]> {
  await init();
  const usersCollection = _db.collection<User>('users');
  return usersCollection.find({}).toArray();
}

export async function getUserById(id: string): Promise<User | null> {
  await init();
  const usersCollection = _db.collection<User>('users');
  // Check if id is a valid ObjectId before creating a new ObjectId
  if (!ObjectId.isValid(id)) {
    return null;
  }
  const user = await usersCollection.findOne({ _id: new ObjectId(id) });
  return user ? { ...user, id: user._id.toString() } : null;
}
