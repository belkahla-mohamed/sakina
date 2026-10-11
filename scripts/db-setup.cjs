/* One-time (idempotent) DB setup: applies data/schema.sql then data/seed.sql
   to the database in DATABASE_URL, then verifies the sakina schema.
   Usage: node scripts/db-setup.cjs
*/
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const envRaw = fs.readFileSync(path.join(root, ".env.local"), "utf8").replace(/^\uFEFF/, "");
const url = envRaw.match(/^DATABASE_URL=(.*)$/m)[1].trim();

function statements(file) {
  // Split on top-level semicolons is risky (function bodies use $$).
  // Instead just return the whole file — pg runs multi-statement simple queries.
  return fs.readFileSync(path.join(root, file), "utf8");
}

async function run(c, label, sql) {
  try {
    await c.query(sql);
    console.log(`  ✔ ${label}`);
  } catch (e) {
    console.log(`  ✘ ${label}: ${e.message}`);
    throw e;
  }
}

(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
  await c.connect();
  console.log("Connected. Applying…");

  await run(c, "schema.sql", statements("data/schema.sql"));
  await run(c, "seed.sql", statements("data/seed.sql"));

  const tables = await c.query(
    `select table_name from information_schema.tables
      where table_schema='sakina' order by table_name`
  );
  console.log("\nsakina tables:", tables.rows.map((r) => r.table_name).join(", "));

  const counts = {};
  for (const t of ["categories", "products", "settings", "orders", "reviews", "admin_users", "admin_sessions"]) {
    try {
      const r = await c.query(`select count(*)::int as n from public.${t}`);
      counts[t] = r.rows[0].n;
    } catch {
      counts[t] = "ERR";
    }
  }
  console.log("row counts:", JSON.stringify(counts));

  // confirm the school app's public tables were untouched
  const pub = await c.query(
    `select count(*)::int as n from information_schema.tables where table_schema='public'`
  );
  console.log("public tables still present:", pub.rows[0].n, "(must be 23)");

  await c.end();
  console.log("\nDONE.");
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
