import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const isSrvUri = (uri: string) => uri.startsWith('mongodb+srv://');

const buildFallbackUri = (uri: string): string => {
  if (!isSrvUri(uri)) {
    return uri;
  }

  const match = uri.match(/^mongodb\+srv:\/\/(?:([^@]+)@)?([^/]+)(\/[^?]*)?(\?.*)?$/);
  if (!match) {
    return uri;
  }

  const auth = match[1] || '';
  const host = match[2];
  const pathname = match[3] || '';
  const search = match[4] || '';
  const authSegment = auth ? `${auth}@` : '';

  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  if (!params.has('tls') && !params.has('ssl')) {
    params.set('tls', 'true');
  }

  const searchString = params.toString() ? `?${params.toString()}` : '';
  return `mongodb://${authSegment}${host}:27017${pathname}${searchString}`;
};

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI?.trim();
  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  console.log('MongoDB URI loaded:', !!mongoUri);
  console.log(`MongoDB URI scheme detected: ${mongoUri.startsWith('mongodb+srv://') ? 'mongodb+srv' : 'mongodb'}`);

  const fallbackUri = buildFallbackUri(mongoUri);
  const urisToTry = [mongoUri];
  if (fallbackUri !== mongoUri) {
    urisToTry.push(fallbackUri);
  }

  let lastError: unknown;

  for (const uri of urisToTry) {
    const isFallback = uri !== mongoUri;

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        if (isFallback) {
          console.log('Attempting fallback MongoDB URI');
        }

        if (attempt > 1) {
          console.log(`Retrying MongoDB connection attempt ${attempt} for ${isFallback ? 'fallback' : 'primary'} URI`);
          await delay(1000);
        }

        await mongoose.connect(uri, {
          dbName: 'eyes_on_u',
        });

        console.log('MongoDB connected successfully');
        return;
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`MongoDB connection failed (${isFallback ? 'fallback' : 'primary'}): ${message}`);

        const isDnsFailure = message.includes('querySrv') || message.includes('ENOTFOUND') || message.includes('ECONNREFUSED');
        if (!isDnsFailure || attempt === 2) {
          break;
        }

        console.warn('DNS lookup failed, retrying connection...');
      }
    }
  }

  throw lastError;
};

export default connectDB;
