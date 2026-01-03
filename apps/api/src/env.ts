import * as dotenv from 'dotenv';
import path from 'path';

// Force load env from workspace root
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
console.log('Environment loaded from root .env');
