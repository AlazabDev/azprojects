import dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// Function to create or retrieve the connection pool (Object Method)
export const createPool = (): Pool => {
  if (!global._postgresPool) {
    const host = process.env.SQL_HOST;
    const user = process.env.SQL_USER || process.env.SQL_ADMIN_USER;
    const password = process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD;
    const database = process.env.SQL_DB_NAME;

    global._postgresPool = new Pool({
      host: host || '/app/cloudsql/gen-lang-client-0670306620:europe-west2:ai-studio-70c87610',
      user,
      password,
      database,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err) => {
      // Avoid verbose logging if connection failed on idle
      if ((err as any)?.code !== 'ECONNREFUSED') {
        console.warn('Postgres connection pool notice:', (err as any)?.message || err);
      }
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance
export const pool = createPool();

// Initialize Drizzle with the pool and schema
export const db = drizzle(pool, { schema });

