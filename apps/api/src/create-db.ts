import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';
// @ts-ignore
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log('__dirname:', __dirname);
const envPath = resolve(__dirname, '../../../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

async function createDb() {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    const url = process.env.DATABASE_URL!;
    if (!url) {
        console.error('DATABASE_URL is not defined!');
        process.exit(1);
    }
    // Connect to 'postgres' database to create the new one
    const adminUrl = url.replace(/\/([^\/]+)$/, '/postgres');

    const sql = postgres(adminUrl, { ssl: 'require' });
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
