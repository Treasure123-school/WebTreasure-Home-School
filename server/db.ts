import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// For Express backend, use process.env (not Vite's import.meta.env)
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in your backend .env file");
}

// Create the connection
const client = postgres(process.env.DATABASE_URL, {
  // Optimal settings for your setup
  max: 10, // Reasonable connection pool for Express
  idle_timeout: 30,
});

export const db = drizzle(client, { schema });
