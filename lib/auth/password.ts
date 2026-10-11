import "server-only";
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

interface ScryptOptions {
  N: number;
  r: number;
  p: number;
  maxmem: number;
}

type ScryptFn = (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options?: ScryptOptions
) => Promise<Buffer>;

const scrypt = promisify(_scrypt) as unknown as ScryptFn;

const KEYLEN = 64;
const COST = 16384; // N
const BLOCK = 8; // r
const PARALLEL = 1; // p

/** Hash a plaintext password → `scrypt$N$r$p$salt$hash` (hex). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEYLEN, {
    N: COST,
    r: BLOCK,
    p: PARALLEL,
    maxmem: 128 * COST * BLOCK * 2 + 1024 * 1024,
  });
  return [
    "scrypt",
    COST,
    BLOCK,
    PARALLEL,
    salt.toString("hex"),
    derived.toString("hex"),
  ].join("$");
}

/** Constant-time verify. Returns false on any malformed stored hash. */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  try {
    const [scheme, nStr, rStr, pStr, saltHex, hashHex] = stored.split("$");
    if (scheme !== "scrypt") return false;
    const N = Number(nStr);
    const r = Number(rStr);
    const p = Number(pStr);
    if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) {
      return false;
    }
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const derived = await scrypt(password, salt, expected.length, {
      N,
      r,
      p,
      maxmem: 128 * N * r * 2 + 1024 * 1024,
    });
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
