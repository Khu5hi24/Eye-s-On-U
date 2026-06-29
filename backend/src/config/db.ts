import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  await mongoose.connect(process.env.MONGO_URI, {
    dbName: 'eyes_on_u',
  });

  console.log('MongoDB connected successfully');
};

export default connectDB;
