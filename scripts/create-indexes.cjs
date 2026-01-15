const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

async function createIndexes() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Products collection indexes
    const productsCollection = db.collection('products');
    await productsCollection.createIndex({ isActive: 1 });
    await productsCollection.createIndex({ createdAt: -1 });
    await productsCollection.createIndex({ category: 1, isActive: 1 });
    console.log('Products indexes created');
    
    // Commissions collection indexes
    const commissionsCollection = db.collection('commissions');
    await commissionsCollection.createIndex({ affiliatorId: 1 });
    await commissionsCollection.createIndex({ affiliatorId: 1, createdAt: -1 });
    await commissionsCollection.createIndex({ affiliatorId: 1, status: 1 });
    await commissionsCollection.createIndex({ orderId: 1 });
    await commissionsCollection.createIndex({ withdrawalId: 1 });
    console.log('Commissions indexes created');
    
    // Orders collection indexes
    const ordersCollection = db.collection('orders');
    await ordersCollection.createIndex({ affiliatorId: 1 });
    await ordersCollection.createIndex({ createdAt: -1 });
    await ordersCollection.createIndex({ status: 1 });
    console.log('Orders indexes created');
    
    // Withdrawals collection indexes
    const withdrawalsCollection = db.collection('withdrawals');
    await withdrawalsCollection.createIndex({ affiliatorId: 1 });
    await withdrawalsCollection.createIndex({ affiliatorId: 1, createdAt: -1 });
    await withdrawalsCollection.createIndex({ status: 1 });
    console.log('Withdrawals indexes created');
    
    // Affiliate links collection indexes
    const affiliateLinksCollection = db.collection('affiliateLinks');
    await affiliateLinksCollection.createIndex({ affiliatorId: 1 });
    await affiliateLinksCollection.createIndex({ linkCode: 1 }, { unique: true });
    await affiliateLinksCollection.createIndex({ productSlug: 1 });
    await affiliateLinksCollection.createIndex({ isActive: 1, createdAt: -1 });
    console.log('Affiliate links indexes created');
    
    // Users collection indexes
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ role: 1 });
    console.log('Users indexes created');
    
    // Settings collection indexes
    const settingsCollection = db.collection('settings');
    await settingsCollection.createIndex({ name: 1 }, { unique: true });
    console.log('Settings indexes created');
    
    console.log('\n✅ All database indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await client.close();
  }
}

// Run the function
createIndexes();