import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

console.log('--- DIAGNÓSTICO DO ENV ---');
console.log('DB_HOST atual:', process.env.DB_HOST);

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
});

export default pool;