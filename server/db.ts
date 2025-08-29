import { Pool } from 'pg'; // ← CHANGE TO pg
import { drizzle } from 'drizzle-orm/pg'; // ← CHANGE TO pg
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = drizzle(pool, { schema });
