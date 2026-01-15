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

    const collectionsToPurge = ['users', 'products', 'orders', 'commissions', 'affiliateLinks', 'withdrawals', 'settings'];

    for (const collectionName of collectionsToPurge) {
        try {
            await db.collection(collectionName).deleteMany({});
        } catch (e) {
            if (e.codeName === 'NamespaceNotFound') {
                // Collection doesn't exist, skip
            } else {
                throw e;
            }
        }
    }

    // Also drop incorrect collection if it exists
    try {
        await db.dropCollection('affiliatelinks');
    } catch(e) {
        if (e.codeName === 'NamespaceNotFound') {
            // Collection doesn't exist, skip
        } else {
            throw e;
        }
    }
  } catch (error) {
    console.error('❌ An error occurred during the purge:', error);
  } finally {
    await client.close();
  }
};

purge();
