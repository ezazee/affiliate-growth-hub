import clientPromise from '@/lib/mongodb';
import { Collection, MongoClient, Db, ObjectId } from 'mongodb';
import { Product, AffiliateLink, User } from '@/types';

let _client: MongoClient;
let _db: Db;

async function init() {
  if (_client && _db) {
    return;
  }
  try {
    _client = await clientPromise;
    _db = _client.db();
  } catch (error) {
    console.error('Failed to connect to DB:', error);
    throw new Error('Database initialization failed');
  }
}

export async function getProducts(): Promise<Product[]> {
  await init();
  const productsCollection = _db.collection<Product>('products');
  return productsCollection.find({}).toArray();
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await init();
  const productsCollection = _db.collection<Product>('products');
  const product = await productsCollection.findOne({ slug });
  if (product) {
    return { ...product, id: product._id.toString() };
  }
  return null;
}

export async function getAffiliateLinks(): Promise<AffiliateLink[]> {
  await init();
  const affiliateLinksCollection = _db.collection<AffiliateLink>('affiliateLinks');
  return affiliateLinksCollection.find({}).toArray();
}

export async function getUsers(): Promise<User[]> {
  await init();
  const usersCollection = _db.collection<User>('users');
  return usersCollection.find({}).toArray();
}

export async function getUserById(id: string): Promise<User | null> {
  await init();
  const usersCollection = _db.collection<User>('users');
  const user = await usersCollection.findOne({ _id: new ObjectId(id) });
  if (user) {
    return { ...user, id: user._id.toString() };
  }
  return null;
}

export async function getUserByReferralCode(referralCode: string): Promise<User | null> {
  await init();
  const usersCollection = _db.collection<User>('users');
  const user = await usersCollection.findOne({ referralCode: referralCode });
  if (user) {
    return { ...user, id: user._id.toString() };
  }
  return null;
}

export async function getAffiliateLinkByAffiliatorProduct(affiliatorId: string, productId: string): Promise<AffiliateLink | null> {
  await init();
  const affiliateLinksCollection = _db.collection<AffiliateLink>('affiliateLinks');
  return affiliateLinksCollection.findOne({ 
    affiliatorId, 
    productId 
  });
}
