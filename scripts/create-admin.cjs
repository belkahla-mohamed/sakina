/* Create or update a Sakina admin user (scrypt-hashed password).
   Usage: node scripts/create-admin.cjs <email> <password> [name]
   Idempotent: re-running resets the password for that email.
*/
const { Client } = require("pg");
const { randomBytes, scrypt } = require("crypto");
const fs = require("fs");
const path = require("path");

// ── must mirror lib/auth/password.ts exactly ──
const KEYLEN = 64;
const COST = 16384;
const BLOCK = 8;
const PARALLEL = 1;

function scryptAsync(password, salt, keylen, opts) {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, keylen, opts, (err, dk) => (err ? reject(err) : resolve(dk)))
  );
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, KEYLEN, {
    N: COST,
    r: BLOCK,
    p: PARALLEL,
    maxmem: 128 * COST * BLOCK * 2 + 1024 * 1024,
  });
  return ["scrypt", COST, BLOCK, PARALLEL, salt.toString("hex"), derived.toString("hex")].join("$");
}

const [email, passwordArg, name] = process.argv.slice(2);
if (!email) {
  console.error("Usage: node scripts/create-admin.cjs <email> [password|--gen] [name]");
  process.exit(1);
}

function generatePassword(len = 18) {
  // URL/shell-safe alphabet (no quotes, $, !, spaces) — still high entropy.
  const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

const password = !passwordArg || passwordArg === "--gen" ? generatePassword() : passwordArg;

const root = path.resolve(__dirname, "..");
const url = fs.readFileSync(path.join(root, ".env.local"), "utf8").replace(/^\uFEFF/, "").match(/^DATABASE_URL=(.*)$/m)[1].trim();

(async () => {
  const hash = await hashPassword(password);
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
  await c.connect();
  await c.query(
    `insert into public.admin_users (email, password_hash, name)
     values ($1, $2, $3)
     on conflict (email) do update set password_hash = excluded.password_hash, name = excluded.name`,
    [email.toLowerCase(), hash, name || null]
  );
  const n = await c.query("select count(*)::int as n from public.admin_users");
  await c.end();
  console.log(`✔ admin ready: ${email.toLowerCase()} (total admins: ${n.rows[0].n})`);
  if (passwordArg === "--gen" || !passwordArg) {
    console.log(`\n  Email:    ${email.toLowerCase()}`);
    console.log(`  Password: ${password}\n`);
    console.log("  (save these — re-run with a new password to rotate)");
  }
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
