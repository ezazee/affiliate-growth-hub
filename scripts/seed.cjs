require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { products, users } = require('./data.cjs');


const uri = process.env.MONGODB_URI;

// Function to generate a unique link code
const generateLinkCode = (productName, affiliatorName) => {
  const productCode = productName.slice(0, 4).toUpperCase();
  const affiliatorCode = affiliatorName.slice(0, 4).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${affiliatorCode}-${productCode}-${randomPart}`;
};


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
    await db.collection('affiliateLinks').deleteMany({});

    // Drop the problematic index if it exists
    try {
      await db.collection('products').dropIndex('sku_1');
    } catch (e) {
      if (e.codeName !== 'IndexNotFound') {
        // Index might not exist or another error occurred
      }
    }




    // Seed users with hashed passwords
    const usersWithHashedPasswords = await Promise.all(users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return {
        ...user,
        password: hashedPassword,
      };
    }));
    await db.collection('users').insertMany(usersWithHashedPasswords);

    // Seed products
    await db.collection('products').insertMany(products);

    // Fetch the created users and products to get their _ids
    const createdUsers = await db.collection('users').find().toArray();
    const createdProducts = await db.collection('products').find().toArray();

    const affiliatorUsers = createdUsers.filter(user => user.role === 'affiliator');

    // Dynamically create affiliate links for every affiliator for every product
    const newAffiliateLinks = [];
    for (const affiliator of affiliatorUsers) {
      for (const product of createdProducts) {
        newAffiliateLinks.push({
          affiliatorId: affiliator._id,
          productId: product._id,
          linkCode: generateLinkCode(product.name, affiliator.name),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Seed affiliate links
    if (newAffiliateLinks.length > 0) {
      await db.collection('affiliateLinks').insertMany(newAffiliateLinks);
    }

  } catch (error) {
  } finally {
    await client.close();
  }
};

seed();
