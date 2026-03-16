import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LorRequest from '../src/models/lor.request.model.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lor_nexus';

const run = async () => {
  await mongoose.connect(mongoUri);

  const result = await LorRequest.updateMany(
    { $or: [{ subject: { $exists: false } }, { subject: null }, { subject: '' }] },
    { $set: { subject: 'Not specified' } }
  );

  console.log(`Updated ${result.modifiedCount || 0} request(s).`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
