import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import * as dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Force load env from workspace root
dotenv.config({ path: resolve(__dirname, '../../../.env') });
console.log('Environment loaded from root .env');
