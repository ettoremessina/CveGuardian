import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
// Load .env from root
dotenv.config({ path: '../../.env' });

export default {
    schema: '../../packages/core/src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
        ssl: (process.env.DB_SSL === 'false' ? false : (process.env.DB_SSL === 'true' ? true : (process.env.DB_SSL || true))) as any,
    },
} satisfies Config;
