import mongoose from 'mongoose';

type CachedType = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  cache: {
    [key: string]: {
      data: unknown;
      timestamp: number;
    };
  };
}

declare global {
  var mongoose: CachedType | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/i-do-hair-studios';
const CACHE_DURATION = 60 * 1000; // 1 minute cache

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = (global as { mongoose?: CachedType }).mongoose as CachedType;
if (!cached) {
  cached = (global as { mongoose?: CachedType }).mongoose = {
    conn: null,
    promise: null,
    cache: {},
  };
}

async function initializeCollections(db: mongoose.Connection) {
  console.log('Initializing collections...');
  const collections = await db.db?.collections();
  if (!collections) {
    console.log('No collections found in database');
    return;
  }
  
  const collectionNames = collections.map(c => c.collectionName);
  console.log('Existing collections:', collectionNames);

  if (!collectionNames.includes('appointments')) {
    console.log('Creating appointments collection...');
    await db.createCollection('appointments');
  }

  if (!collectionNames.includes('availabledates')) {
    console.log('Creating availabledates collection...');
    await db.createCollection('availabledates');
  }
}

// Cache middleware
export const withCache = async <T>(
  key: string,
  fetchData: () => Promise<T>,
  priority: boolean = false
): Promise<T> => {
  const now = Date.now();
  const cachedData = cached.cache[key];

  // Return cached data if it's still valid and not a priority request
  if (!priority && cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    console.log(`Using cached data for ${key}`);
    return cachedData.data as T;
  }

  // Fetch fresh data
  console.log(`Fetching fresh data for ${key}`);
  const data = await fetchData();
  cached.cache[key] = { data, timestamp: now };
  return data;
};

async function connectDB(): Promise<typeof mongoose> {
  try {
    if (cached.conn) {
      console.log('Using cached database connection');
      return cached.conn;
    }

    if (!cached.promise) {
      // Mask credentials in logs
      const maskedUri = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
      console.log('Connecting to MongoDB:', maskedUri);
      
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10, // Limit concurrent connections
        serverSelectionTimeoutMS: 10000, // Increased timeout for network issues
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        connectTimeoutMS: 10000, // Connection timeout
        retryWrites: true,
        retryReads: true,
      };

      cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongooseInstance) => {
        console.log('MongoDB connected successfully');
        await initializeCollections(mongooseInstance.connection);
        return mongooseInstance;
      }).catch((error: any) => {
        // Clear the promise on error so we can retry
        cached.promise = null;
        
        // Provide helpful error messages
        if (error.name === 'MongoServerSelectionError') {
          if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
            console.error('\n❌ MongoDB Connection Error: Cannot resolve hostname');
            console.error('   This usually means:');
            console.error('   1. The MongoDB Atlas cluster is paused or deleted');
            console.error('   2. The connection string hostname is incorrect');
            console.error('   3. There are network/DNS issues');
            console.error('   4. Your IP address is not whitelisted in MongoDB Atlas');
            console.error('\n   Please check:');
            console.error('   - Your .env file has the correct MONGODB_URI');
            console.error('   - Your MongoDB Atlas cluster is running');
            console.error('   - Your IP is whitelisted in MongoDB Atlas Network Access');
            console.error('   - The connection string format is correct\n');
          } else {
            console.error('\n❌ MongoDB Connection Error: Server selection failed');
            console.error('   Error:', error.message);
          }
        } else if (error.name === 'MongoNetworkError') {
          console.error('\n❌ MongoDB Network Error');
          console.error('   Error:', error.message);
          console.error('   Check your internet connection and MongoDB Atlas status\n');
        } else {
          console.error('\n❌ MongoDB Connection Error:', error.name);
          console.error('   Error:', error.message);
        }
        
        throw error;
      });
    }

    const mongooseInstance = await cached.promise;
    cached.conn = mongooseInstance;
    return mongooseInstance;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default connectDB; 