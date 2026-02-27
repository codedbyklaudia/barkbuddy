import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

pool.on("connect", () => console.log("✅ PostgreSQL connected"));
pool.on("error",   (err) => console.error("❌ PostgreSQL error:", err));

export default pool;