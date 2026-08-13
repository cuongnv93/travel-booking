import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedDataInternal } from '../seed/seedData';

let mongoMemoryServer: MongoMemoryServer | null = null;

const connectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travel-booking';

    try {
      console.log('Attempting connection to MongoDB at:', mongoUri);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
      console.log('✅ Connected to Persistent MongoDB Database!');
    } catch (err: any) {
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ Failed to connect to MongoDB in production:', err?.message || err);
        process.exit(1);
      }
      console.log('⚠️ Local MongoDB not running. Falling back to Persistent Mongo Server (dbPath)...');
      const path = require('path');
      const fs = require('fs');
      const dbDir = path.join(__dirname, '../../data');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbPath: dbDir,
          storageEngine: 'wiredTiger',
        }
      });
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log('✅ Connected to Persistent Local Mongo Server at:', memoryUri);
    }

    await seedDataInternal();
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
};

export default connectDB;
