const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is missing in .env.local');
    return;
  }

  console.log('🔄 Testing MongoDB connection...');
  console.log(`📡 URI Host: ${uri.split('@')[1]?.split('/')[0] || 'hidden'}`);

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    family: 4,
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully to MongoDB!');
    const db = client.db();
    const result = await db.command({ ping: 1 });
    console.log('✅ Database ping result:', result);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.code === 'ETIMEOUT') {
      console.log('\n💡 Tip: This looks like a network timeout.');
      console.log('1. Check if your IP is allowed in MongoDB Atlas Network Access.');
      console.log('2. Try changing your DNS to Google (8.8.8.8) or Cloudflare (1.1.1.1).');
      console.log('3. If using a VPN, try disabling it.');
    }
  } finally {
    await client.close();
  }
}

testConnection();
