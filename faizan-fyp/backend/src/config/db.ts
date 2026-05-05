import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';

function ensureMongoSrvDnsServers(): void {
  if (!env.mongoUri.startsWith('mongodb+srv://')) return;
  if (env.mongoDnsServers.length > 0) {
    dns.setServers(env.mongoDnsServers);
    console.log('[db] using custom MongoDB DNS servers:', env.mongoDnsServers.join(', '));
    return;
  }

  const servers = dns.getServers();
  const hasLocalResolver = servers.some((server) => server === '127.0.0.1' || server === '::1');
  if (hasLocalResolver) {
    const fallback = ['1.1.1.1', '8.8.8.8'];
    dns.setServers(fallback);
    console.log('[db] overriding local DNS resolver for SRV lookup:', fallback.join(', '));
  }
}

function normalizeMongoUri(uri: string): string {
  if (!uri.startsWith('mongodb+srv://')) return uri;
  try {
    const url = new URL(uri);
    if (!url.searchParams.has('authSource')) {
      url.searchParams.set('authSource', 'admin');
      console.log('[db] adding authSource=admin to MongoDB URI for Atlas auth');
    }
    return url.toString();
  } catch {
    return uri;
  }
}

function getMongoTarget(uri: string): string | undefined {
  try {
    const url = new URL(uri);
    return `${url.username || '<unknown>'}@${url.host}`;
  } catch {
    return undefined;
  }
}

export async function connectMongo(): Promise<void> {
  mongoose.set('strictQuery', true);
  ensureMongoSrvDnsServers();
  const mongoUri = normalizeMongoUri(env.mongoUri);
  const target = getMongoTarget(env.mongoUri);
  if (target) {
    console.log('[db] connecting to MongoDB:', target);
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('[db] MongoDB connected');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/bad auth/i.test(message) || /authentication failed/i.test(message)) {
      console.error('[db] MongoDB authentication failed. Check the following:');
      console.error('  - MONGODB_URI username and password are correct');
      console.error('  - Atlas user exists and has access to this cluster');
      console.error('  - Atlas IP access list includes your machine or 0.0.0.0/0');
      console.error('  - The URI is exactly the Atlas connection string, with any special characters URL-encoded');
    }
    throw error;
  }
}
