import mysql, { type RowDataPacket, type ResultSetHeader } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env["DB_HOST"] ?? "localhost",
  port: Number(process.env["DB_PORT"] ?? 3306),
  database: process.env["DB_NAME"] ?? "QppDB",
  user: process.env["DB_USER"] ?? "root",
  password: process.env["DB_PASSWORD"] ?? "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query<T extends RowDataPacket>(
  sql: string,
  params: (string | number | boolean | null | Date)[] = []
): Promise<T[]> {
  const [rows] = await pool.execute<T[]>(sql, params);
  return rows;
}

export async function queryOne<T extends RowDataPacket>(
  sql: string,
  params: (string | number | boolean | null | Date)[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function execute(
  sql: string,
  params: (string | number | boolean | null | Date)[] = []
): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(sql, params);
  return result;
}

export async function testConnection(): Promise<void> {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
}

export default pool;
