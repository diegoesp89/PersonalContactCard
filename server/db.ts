import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  const errorMsg = "DATABASE_URL must be set. Did you forget to provision a database?";
  console.error('[DATABASE ERROR]', errorMsg);
  console.error('[DATABASE ERROR] For production deployment, ensure DATABASE_URL is set in deployment secrets');
  throw new Error(errorMsg);
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });