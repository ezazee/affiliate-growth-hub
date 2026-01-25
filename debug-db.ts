import { MongoClient } from 'mongodb';

// URI from your .env.local (assuming default localhost or valid connection string)
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/affiliate-growth-hub";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const db = client.db();

        console.log("=== USERS ===");
        const users = await db.collection('users').find({}).toArray();
        users.forEach((u: any) => {
            console.log(`- ${u.name} (${u.email}) | Role: ${u.role} | ID: ${u._id}`);
        });

        console.log("\n=== NOTIFICATIONS (Last 10) ===");
        const notifs = await db.collection('notifications').find({}).sort({ timestamp: -1 }).limit(10).toArray();
        notifs.forEach((n: any) => {
            console.log(`- [${n.userEmail || 'NO_EMAIL'}] ${n.title}: ${n.message} (Read: ${n.read}) | ID: ${n._id} | Date: ${n.timestamp}`);
        });

        if (notifs.length === 0) {
            console.log("No notifications found in database.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
