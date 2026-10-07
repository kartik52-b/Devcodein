import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Loads server/.env regardless of the working directory the process was
 * started from (repo root for the Vite dev server, server/ for `npm start`).
 * Values already present in the environment are never overridden.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '../../.env') });
