import * as dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'path';

// Load env before anything else
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Load env before anything else
dotenv.config({ path: resolve(__dirname, '../../../.env') });

async function runMigrations() {
    console.log('Running migrations...');
    console.log('Using DB URL:', process.env.DATABASE_URL?.split('@')[1]); // Log host only for safety

    // Dynamic import to ensure process.env is set before DB connection is initialized
    const { db } = await import('@cve-guardian/core');

    try {
        await migrate(db, { migrationsFolder: resolve(__dirname, '../drizzle') });
        console.log('Migrations completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed!', err);
        process.exit(1);
    }
}

runMigrations();
