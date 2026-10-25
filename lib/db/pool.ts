import "server-only";
import { Pool, types, type PoolClient, type PoolConfig } from "pg";

// node-postgres returns `numeric`/`decimal` columns as strings to preserve
// precision. Prices, ratings and order totals are all `numeric`, but the
// TypeScript models and every call site treat them as numbers
// (`product.price.toFixed(2)`), which threw at runtime and blanked the admin
// pages. Parse them to numbers once, at the source.
types.setTypeParser(1700, (v: string) => parseFloat(v));

// node-postgres supports this at runtime but omits it from PoolConfig's type.
type PoolConfigEx = PoolConfig & { statement_cache_size?: number };

const globalForPool = globalThis as unknown as {
  __sakinaPool?: Pool;
};

function createPool(): Pool {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (Supabase → Settings → Database → Connection string)."
    );
  }

  // Supabase pooler port 5432 is Session mode, which starves connection slots
  // on serverless hosts like Vercel. Port 6543 is Transaction mode, designed
  // for serverless lambdas. Auto-route to 6543 if pooler.supabase.com:5432 is configured.
  if (connectionString.includes("pooler.supabase.com:5432")) {
    connectionString = connectionString.replace(":5432", ":6543");
  }

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  const config: PoolConfigEx = {
    connectionString,
    // Supabase pooler (5432 session / 6543 transaction) requires TLS.
    ssl: /(:5432|:6543)/.test(connectionString)
      ? { rejectUnauthorized: false }
      : undefined,
    // The transaction pooler (6543) routes each query to a fresh server
    // connection, so cached named prepared statements can vanish. Disable
    // the cache to avoid intermittent "prepared statement" errors.
    statement_cache_size: 0,
    max: isServerless ? 2 : 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
  };
  return new Pool(config);
}

export function getPool(): Pool {
  if (!globalForPool.__sakinaPool) {
    globalForPool.__sakinaPool = createPool();
  }
  return globalForPool.__sakinaPool;
}

/** Run a query with parameters. */
export async function q<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = getPool();
  const res = await pool.query(text, params);
  return res.rows as T[];
}

/** Run a query and return the first row (or null). */
export async function q1<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}

/** Run work inside a transaction. */
export async function withTx<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (err) {
    try {
      await client.query("rollback");
    } catch {
      /* connection already broken */
    }
    throw err;
  } finally {
    client.release();
  }
}
