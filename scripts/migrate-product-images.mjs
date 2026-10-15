// One-off: add products.images text[] column. Run: node --env-file=.env.local scripts/migrate-product-images.mjs
import { Pool } from "pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL missing");
const pool = new Pool({
  connectionString: url,
  ssl: /(:5432|:6543)/.test(url) ? { rejectUnauthorized: false } : undefined,
});

await pool.query("alter table public.products add column if not exists images text[]");
const { rows } = await pool.query(
  "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'products' order by ordinal_position"
);
console.log("products columns:", rows.map((r) => r.column_name).join(", "));
await pool.end();
