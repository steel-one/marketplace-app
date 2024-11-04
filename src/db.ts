import postgres from 'postgres';

const sql = postgres({
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  database: process.env.DATABASE_NAME || 'marketplace',
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD,
  ssl: process.env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
});

export default sql;
