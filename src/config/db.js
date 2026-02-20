import mongoose from 'mongoose';
import env from './env.js';

let connectionPromise = null;

export const connectDb = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  mongoose.set('strictQuery', true);
  connectionPromise = mongoose
    .connect(env.mongoUri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000
    })
    .then((conn) => {
      console.log('[db] connected');
      return conn;
    })
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
};
