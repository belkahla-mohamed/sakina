/* Removes ONLY the `sakina` schema I created in this (wrong) account.
   The other app's `public` schema is never touched.
   Usage: node scripts/drop-sakina.cjs
*/
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const url = fs
  .readFileSync(path.join(root, ".env.local"), "utf8")
  .replace(/^\uFEFF/, "")
  .match(/^DATABASE_URL=(.*)$/m)[1].trim();

(async () => {
  const c = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  await c.connect();

  const before = await c.query(
    "select count(*)::int as n from information_schema.tables where table_schema='public'"
  );
  console.log("public tables before:", before.rows[0].n);

  const exists = await c.query(
    "select 1 from information_schema.schemata where schema_name='sakina'"
  );
  if (exists.rows.length === 0) {
    console.log("schema 'sakina' does not exist — nothing to drop.");
  } else {
    await c.query("drop schema if exists sakina cascade");
    console.log("✔ dropped schema 'sakina' (with all its tables/data)");
  }

  const afterPub = await c.query(
    "select count(*)::int as n from information_schema.tables where table_schema='public'"
  );
  const still = await c.query(
    "select 1 from information_schema.schemata where schema_name='sakina'"
  );
  console.log("public tables after :", afterPub.rows[0].n, "(should match before)");
  console.log("sakina schema present:", still.rows.length > 0 ? "YES (unexpected)" : "NO ✔");

  await c.end();
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
