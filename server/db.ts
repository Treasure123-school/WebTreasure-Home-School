import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// ✅ Improved connection configuration
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    // ✅ Explicitly set the server name for SSL
    servername: 'aws-1-eu-north-1.pooler.supabase.com'
  },
  max: 1, // Start with just 1 connection
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // 5 second connection timeout
});

// ✅ Better error handling
pool.on('connect', (client) => {
  console.log('✅ New database connection established');
});

pool.on('error', (err, client) => {
  console.error('❌ Database pool error:', err.message);
});

pool.on('acquire', (client) => {
  console.log('🔗 Client acquired from pool');
});

pool.on('remove', (client) => {
  console.log('🔌 Client removed from pool');
});

export const db = drizzle(pool, { schema });
