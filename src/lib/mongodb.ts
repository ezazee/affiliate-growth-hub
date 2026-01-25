import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  family: 4, // Force IPv4 to bypass DNS issues
};

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    try {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect()
        .catch(err => {
          console.error('MongoDB connection error:', err);
          if (err.message.includes('ESERVFAIL') || err.message.includes('queryTxt')) {
            console.error('DNS resolution failed. This might be a temporary network issue.');
            console.error('Try the following:');
            console.error('1. Check your internet connection');
            console.error('2. Try again in a few minutes');
            console.error('3. Restart your development server');
          }
          throw err;
        });
    } catch (error) {
      console.error('MongoDB client creation error:', error);
      throw error;
    }
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .catch(err => {
      console.error('MongoDB connection error:', err);
      throw err;
    });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
