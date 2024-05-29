import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const migrationsClient = postgres(process.env.SQL_CONNECTION_LINK||'', {
	max: 1,
});
export const db = drizzle(migrationsClient);