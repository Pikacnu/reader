import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const migrationsClient = postgres(process.env.SQL_CONNECTION_LINK, {
	max: 1,
});
const db = drizzle(migrationsClient,{
	onnotice: (notice) => {
		console.log('notice:', notice);
	},
});
const main = async () => {
	try {
		await migrate(db, {
			migrationsFolder: './db/migrations',
		});
		console.log('mirgrate successfully');
		process.exit(0);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};
main();
