const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkSubscriptions() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('No MONGODB_URI found');
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to DB');
        const db = client.db();

        const count = await db.collection('users').countDocuments({
            pushSubscription: { $exists: true, $ne: null }
        });

        console.log(`Users with push subscriptions: ${count}`);

        const subscribes = await db.collection('users').find({
            pushSubscription: { $exists: true, $ne: null }
        }).project({ email: 1, role: 1 }).toArray();

        console.log('Subscribed users:', subscribes);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

checkSubscriptions();
