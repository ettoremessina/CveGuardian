import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const connectionString = process.env.DATABASE_URL;
const ssl = process.env.DB_SSL === 'false' ? false : (process.env.DB_SSL === 'true' ? true : (process.env.DB_SSL || 'require'));
const client = postgres(connectionString, { ssl: ssl as any });
export const db = drizzle(client, { schema });
export * from './schema';
