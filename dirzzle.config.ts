import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './db/schema.ts',
	dialect: 'postgresql',
	out: './db/migrations',
	dbCredentials: {
		url: process.env.SQL_CONNECTION_LINK || '',
	},
});
