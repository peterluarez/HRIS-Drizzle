import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

// Testing the connection
pool.connect()
    .then(() => console.log("✅ DB Connected Successfully (Pool)!"))
    .catch(err => console.error("❌ DB Connection Error:", err.message));

const db = drizzle(pool);

export default db;