import { PrismaClient } from '@prisma/client';
import { INITIAL_SCHEMA_SQL } from './schemaInit.js';

// If running in a serverless environment like Vercel, the root filesystem is read-only.
// Point SQLite to /tmp/dev.db where write permissions are allowed, unless an external DATABASE_URL is configured.
if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('./')) {
    process.env.DATABASE_URL = 'file:/tmp/dev.db';
  }
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

let isReadyPromise = null;

export async function ensureDatabaseReady() {
  if (!isReadyPromise) {
    isReadyPromise = (async () => {
      try {
        const dbUrl = process.env.DATABASE_URL || '';
        // If using SQLite, ensure all tables are created
        if (!dbUrl || dbUrl.startsWith('file:')) {
          const check = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='User';`;
          if (!check || check.length === 0) {
            console.log('⚡ Bootstrapping SQLite database tables...');
            for (const stmt of INITIAL_SCHEMA_SQL) {
              await prisma.$executeRawUnsafe(stmt);
            }
            console.log('✅ SQLite database schema successfully initialized.');
          }
        }
      } catch (err) {
        console.error('⚠️ Database readiness verification warning:', err.message);
      }
    })();
  }
  return isReadyPromise;
}

// Kick off readiness check immediately on import
ensureDatabaseReady().catch(e => console.error('Database bootstrap error:', e));

export default prisma;
