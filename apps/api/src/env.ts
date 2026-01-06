import * as dotenv from 'dotenv';
import path from 'path';

// Force load env from workspace root
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../../.env') });
console.log('Environment loaded from root .env');
