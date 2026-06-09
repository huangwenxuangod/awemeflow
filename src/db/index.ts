import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

let db: ReturnType<typeof drizzle> | null = null;

/**
 * Connect to Cloudflare D1 Database (SQLite)
 * https://developers.cloudflare.com/d1/get-started
 * https://orm.drizzle.team/docs/connect-cloudflare-d1
 * https://opennext.js.org/cloudflare/howtos/db#d1-example
 */
export async function getDb() {
  if (db) return db;
  const { env } = await getCloudflareContext({ async: true });
  db = drizzle(env.DB, { schema });
  return db;
}
