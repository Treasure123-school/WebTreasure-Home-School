import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

// ✅ Get SSL servername from environment variable or extract from DATABASE_URL
const getSSLServername = () => {
  // Try environment variable first
  if (process.env.DB_SSL_SERVERNAME) {
    return process.env.DB_SSL_SERVERNAME;
  }
  
  // Extract from DATABASE_URL as fallback
  const host = process.env.DATABASE_URL?.match(/@([^:@]+)/)?.[1];
  return host || 'aws-0-us-east-1.pooler.supabase.com'; // Default to common US host
};

const SSL_SERVERNAME = getSSLServername();

console.log('Database Connection Debug:');
console.log('SSL Servername:', SSL_SERVERNAME);
console.log('Host:', process.env.DATABASE_URL?.match(/@([^:]+)/)?.[1] || 'unknown');
console.log('Port:', process.env.DATABASE_URL?.match(/:(\d+)\//)?.[1] || 'unknown');

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// ✅ INCREASED TIMEOUTS for connection issues
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    servername: SSL_SERVERNAME // ✅ Now dynamic based on your connection string
  },
  max: 2,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 15000,
});

// ✅ COMPREHENSIVE ERROR HANDLING
pool.on('connect', () => {
  console.log('✅ New database connection established');
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
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
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
    }
  } finally {
    if (client) {
      client.release();
    }
  }
}

// ✅ RUN CONNECTION TEST ON STARTUP
testDatabaseConnection().catch(console.error);

export const db = drizzle(pool, { schema });
