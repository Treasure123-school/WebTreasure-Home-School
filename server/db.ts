import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

// ✅ DEBUG: Log connection info (without password)
console.log('Database Connection Debug:');
console.log('Using Transaction Pooler:', process.env.DATABASE_URL?.includes('pooler') ? 'YES' : 'NO');
console.log('Host:', process.env.DATABASE_URL?.match(/@([^:]+)/)?.[1] || 'unknown');
console.log('Port:', process.env.DATABASE_URL?.match(/:(\d+)\//)?.[1] || 'unknown');
console.log('User:', process.env.DATABASE_URL?.match(/\/\/([^:]+):/)?.[1] || 'unknown');

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// ✅ INCREASED TIMEOUTS for connection issues
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    servername: 'aws-1-eu-north-1.pooler.supabase.com'
  },
  max: 2, // Small connection pool
  idleTimeoutMillis: 60000, // 60 seconds
  connectionTimeoutMillis: 15000, // ✅ 15 seconds (increased from 5)
});

// ✅ COMPREHENSIVE ERROR HANDLING
pool.on('connect', (client) => {
  console.log('✅ New database connection established');
});

pool.on('acquire', (client) => {
  console.log('🔗 Client acquired from pool');
});

pool.on('remove', (client) => {
  console.log('🔌 Client removed from pool');
});

pool.on('error', (err: any) => {
  console.error('❌ Database pool error:', err.message);
  if (err.code) {
    console.error('Error code:', err.code);
  }
});

// ✅ TEST CONNECTION ON STARTUP
async function testDatabaseConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log('🚀 Testing database connection...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Database connection successful!');
    console.log('PostgreSQL Version:', result.rows[0].pg_version.split(',')[0]);
    console.log('Server Time:', result.rows[0].current_time);
  } catch (error: any) {
    console.error('❌ Database connection failed:');
    console.error('Error message:', error.message);
    
    // ✅ PROVIDE SPECIFIC TROUBLESHOOTING TIPS
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.log('\n🔧 TROUBLESHOOTING TIPS:');
      console.log('1. Check Supabase Dashboard → Settings → Database → Connection Security');
      console.log('2. Ensure "Allow all IP addresses" is enabled');
      console.log('3. Verify your database password is correct');
      console.log('4. Check if Supabase project is active and not suspended');
    } else {
      console.log('\n🔧 Check your Supabase database settings and connection string');
    }
  } finally {
    if (client) {
      client.release();
    }
  }
}

// ✅ RUN CONNECTION TEST ON STARTUP
testDatabaseConnection().catch(console.error);

// ✅ GRACEFUL SHUTDOWN HANDLING
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down database pool gracefully...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down database pool gracefully...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

export const db = drizzle(pool, { schema });

// ✅ EXPORT THE TEST FUNCTION FOR MANUAL TESTING
export { testDatabaseConnection };
