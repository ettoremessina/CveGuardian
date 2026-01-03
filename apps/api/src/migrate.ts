import * as dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import path from 'path';

// Load env before anything else
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

async function runMigrations() {
    console.log('Running migrations...');
    console.log('Using DB URL:', process.env.DATABASE_URL?.split('@')[1]); // Log host only for safety

    // Dynamic import to ensure process.env is set before DB connection is initialized
    const { db } = await import('@cve-guardian/core');

    try {
        await migrate(db, { migrationsFolder: './drizzle' });
        console.log('Migrations completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed!', err);
        process.exit(1);
    }
}

runMigrations();
