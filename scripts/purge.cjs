require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

const purge = async () => {
  if (!uri) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();

    const collectionsToPurge = ['users', 'products', 'orders', 'commissions', 'affiliateLinks'];

    for (const collectionName of collectionsToPurge) {
        try {
            await db.collection(collectionName).deleteMany({});
            console.log(`🧹 Purged collection: ${collectionName}`);
        } catch (e) {
            if (e.codeName === 'NamespaceNotFound') {
                console.log(`- Collection not found, skipping: ${collectionName}`);
            } else {
                throw e;
            }
        }
    }

    // Also drop the incorrect collection if it exists
    try {
        await db.dropCollection('affiliatelinks');
        console.log(`🧹 Dropped incorrect collection: affiliatelinks`);
    } catch(e) {
        if (e.codeName === 'NamespaceNotFound') {
            console.log(`- Incorrect collection not found, skipping: affiliatelinks`);
        } else {
            throw e;
        }
    }
    

    console.log('\n✅ Database purge complete.');
  } catch (error) {
    console.error('❌ An error occurred during the purge:', error);
  } finally {
    await client.close();
  }
};

purge();
