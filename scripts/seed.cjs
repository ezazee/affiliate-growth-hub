require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const { products, users } = require('./data.cjs');

const uri = process.env.MONGODB_URI;
console.log('MONGODB_URI from process.env:', uri);

const seed = async () => {
  if (!uri || uri === 'your_mongodb_connection_string') {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();

    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('products').deleteMany({});
    await db.collection('orders').deleteMany({});
    await db.collection('commissions').deleteMany({});
    
    // Drop the problematic index if it exists
    try {
      await db.collection('products').dropIndex('sku_1');
      console.log('Dropped sku_1 index from products collection.');
    } catch (e) {
      if (e.codeName !== 'IndexNotFound') {
        console.warn('Could not drop sku_1 index, it might not exist or another error occurred:', e.message);
      }
    }

    // Seed users
    await db.collection('users').insertMany(users);

    // Seed products
    await db.collection('products').insertMany(products);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
};

seed();
