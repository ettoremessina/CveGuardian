import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

async function createDb() {
    const url = process.env.DATABASE_URL!;
    // Connect to 'postgres' database to create the new one
    const adminUrl = url.replace(/\/([^\/]+)$/, '/postgres');

    const sql = postgres(adminUrl);
    const dbName = 'CveGuardian';

    try {
        console.log(`Checking if database directory ${dbName} exists...`);
        // Check if exists
        const exists = await sql`SELECT 1 FROM pg_database WHERE datname = ${dbName}`;
        if (exists.length === 0) {
            console.log(`Creating database ${dbName}...`);
            await sql`CREATE DATABASE "CveGuardian"`;
            console.log('Database created.');
        } else {
            console.log('Database already exists.');
        }
    } catch (e) {
        console.error('Error creating DB:', e);
    } finally {
        await sql.end();
    }
}

createDb();
