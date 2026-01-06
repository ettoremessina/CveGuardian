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
        ssl: true,
    },
} satisfies Config;
