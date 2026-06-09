import fs from 'node:fs';
import path from 'node:path';
import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';
import { pathToFileURL } from 'node:url';

// Load Next.js environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

function getLocalD1DB() {
  try {
    const basePath = path.resolve('.wrangler');
    const dbFile = fs
      .readdirSync(basePath, { encoding: 'utf-8', recursive: true })
      .find((f) => f.endsWith('.sqlite'));

    if (!dbFile) {
      return undefined;
    }

    return pathToFileURL(path.resolve(basePath, dbFile)).href;
  } catch (error) {
    console.error('Error reading local D1 database file:', error);
    return undefined;
  }
}

/**
 * Drizzle Kit configuration for Cloudflare D1 (SQLite)
 * https://orm.drizzle.team/docs/connect-cloudflare-d1
 */
export default defineConfig({
  out: './src/db/migrations',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: getLocalD1DB() || 'file:./dev.db',
  },
});
